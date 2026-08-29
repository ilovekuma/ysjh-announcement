import { AnimatePresence, motion } from 'framer-motion';
import { daysLeft } from '../../utils/dateUtils';

function fixUrl(src) {
  if (!src || !src.includes('lh3.googleusercontent.com')) return src;
  return src.replace(/=s\d+/, '=s0').replace(/(\/d\/[^=?]+)(?!=s)(\?|$)/, '$1=s0$2');
}

/** 總覽用小卡：固定高度、縮圖 + 截斷純文字 */
function OverviewCard({ ann }) {
  const { department, label_color, content, end_date } = ann;
  const remaining = daysLeft(end_date);

  const plain = (content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const imgMatch = (content || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  const thumb = imgMatch ? fixUrl(imgMatch[1]) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-28 overflow-hidden">
      {/* 標籤列 */}
      <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1 flex-shrink-0">
        <span
          className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none"
          style={{ backgroundColor: label_color || '#2D5DA6' }}
        >
          {department || '校方'}
        </span>
        {remaining !== null && (
          <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none
            ${remaining < 0  ? 'bg-gray-100 text-gray-400' :
              remaining <= 2 ? 'bg-red-100 text-red-600'   :
              remaining <= 7 ? 'bg-amber-100 text-amber-700' :
                               'bg-gray-100 text-gray-500'}`}
          >
            {remaining < 0 ? '已過期' : remaining === 0 ? '今日' : `${remaining}天`}
          </span>
        )}
      </div>

      {/* 內容：縮圖 + 文字 */}
      <div className="flex flex-1 min-h-0 gap-2 px-2.5 pb-2 overflow-hidden">
        {thumb && (
          <img
            src={thumb}
            alt=""
            className="w-14 flex-shrink-0 self-stretch object-contain rounded"
          />
        )}
        <p
          className="text-xs text-gray-600 leading-snug flex-1 overflow-hidden"
          style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {plain || '（圖片公告）'}
        </p>
      </div>
    </div>
  );
}

/**
 * OverviewGrid — 總覽網格 Modal
 */
export default function OverviewGrid({ open, onClose, announcements }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            aria-modal="true"
            aria-label="公告總覽"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-school-navy text-white rounded-t-2xl flex-shrink-0">
              <h2 className="text-lg font-bold flex-1">公告總覽</h2>
              <span className="text-school-cream/70 text-sm">{announcements.length} 則有效公告</span>
              <button
                onClick={onClose}
                aria-label="關閉總覽"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg font-medium">目前無有效公告</p>
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {announcements.map((ann, i) => (
                    <motion.div
                      key={ann.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <OverviewCard ann={ann} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
