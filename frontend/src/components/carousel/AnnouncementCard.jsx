import { motion } from 'framer-motion';
import { formatDate, daysLeft } from '../../utils/dateUtils';

/** 依純文字長度決定內容區字型大小 */
function contentFontSize(content) {
  const len = (content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, '').length;
  if (len > 400) return '10px';
  if (len > 250) return '11px';
  if (len > 150) return '12px';
  return '14px';
}

/**
 * AnnouncementCard — 單張公告卡片
 * @param {object} announcement
 * @param {boolean} isActive - 是否為當前輪播卡（放大效果）
 * @param {function} onClick  - 點擊展開詳情（總覽用）
 */
export default function AnnouncementCard({ announcement, isActive = false, onClick }) {
  const { department, label_color, content, end_date } = announcement;
  const remaining = daysLeft(end_date);

  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0.55 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border flex flex-col h-full
        ${isActive ? 'border-school-blue/40 shadow-school-blue/20 shadow-xl' : 'border-gray-200'}
        ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}
      `}
    >
      {/* 頂部標籤列 */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <span
          className="inline-flex items-center gap-1 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
          style={{ backgroundColor: label_color || '#2D5DA6' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
          {department || '校方'}
        </span>

        {/* 剩餘天數 badge */}
        {remaining !== null && (
          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full
            ${remaining <= 2 ? 'bg-red-100 text-red-600' :
              remaining <= 7 ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-500'}`}
          >
            {remaining < 0 ? '已過期' : remaining === 0 ? '今日到期' : `剩 ${remaining} 天`}
          </span>
        )}
      </div>

      {/* 公告內容（Quill HTML） */}
      <div
        className="announcement-content flex-1 px-5 py-3 text-gray-700 overflow-hidden"
        style={{ fontSize: contentFontSize(content) }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* 底部日期 */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>起：{formatDate(announcement.start_date)}</span>
        <span>迄：{formatDate(end_date)}</span>
      </div>
    </motion.div>
  );
}
