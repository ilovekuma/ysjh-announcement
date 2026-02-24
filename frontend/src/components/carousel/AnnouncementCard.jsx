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

/** 從 HTML 中提取所有 img src */
function extractImageSrcs(html) {
  const srcs = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    srcs.push(match[1]);
  }
  return srcs;
}

/** 移除所有 img 標籤及其產生的空段落 */
function stripImages(html) {
  return (html || '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<p>(\s|&nbsp;)*<\/p>/gi, '');
}

/**
 * AnnouncementCard — 單張公告卡片
 * 若含圖片且含文字：左欄文字 / 右欄圖片
 * 若僅含圖片：單欄圖片
 * 若僅含文字：單欄文字（原本行為）
 */
export default function AnnouncementCard({ announcement, isActive = false, onClick, onDoubleClick }) {
  const { department, label_color, content, end_date } = announcement;
  const remaining = daysLeft(end_date);

  const imageSrcs = extractImageSrcs(content || '');
  const textHtml  = stripImages(content || '');
  const hasImg = imageSrcs.length > 0;
  const hasTxt = textHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, '').length > 0;

  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0.55 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border flex flex-col h-full
        ${isActive ? 'border-school-blue/40 shadow-school-blue/20 shadow-xl' : 'border-gray-200'}
        ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}
      `}
    >
      {/* 頂部標籤列 */}
      <div className="flex-shrink-0 flex items-center gap-2 px-5 pt-4 pb-2">
        <span
          className="inline-flex items-center gap-1 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
          style={{ backgroundColor: label_color || '#2D5DA6' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
          {department || '校方'}
        </span>
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

      {/* 內容區 */}
      {hasImg && hasTxt ? (
        /* 圖文並排：左文右圖 */
        <div className="flex-1 flex gap-2 px-5 py-3 min-h-0 overflow-hidden">
          <div
            className="announcement-content flex-1 text-gray-700 overflow-hidden"
            style={{ fontSize: contentFontSize(textHtml) }}
            dangerouslySetInnerHTML={{ __html: textHtml }}
          />
          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1 overflow-hidden"
            style={{ width: '42%' }}>
            {imageSrcs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="公告圖片"
                className="w-full object-contain rounded-md"
              />
            ))}
          </div>
        </div>
      ) : hasImg ? (
        /* 純圖片：置中等比縮放至框內 */
        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 min-h-0 overflow-hidden">
          {imageSrcs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="公告圖片"
              className="max-w-full max-h-full object-contain rounded-md"
            />
          ))}
        </div>
      ) : (
        /* 純文字 */
        <div
          className="announcement-content flex-1 px-5 py-3 text-gray-700 overflow-hidden"
          style={{ fontSize: contentFontSize(content) }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {/* 底部日期 */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>起：{formatDate(announcement.start_date)}</span>
        <span>迄：{formatDate(end_date)}</span>
      </div>
    </motion.div>
  );
}
