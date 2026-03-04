import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { daysLeft } from '../../utils/dateUtils';

/** 從 HTML wrapper div 的 data-lh 屬性取出行高值 */
function extractLineHeight(html) {
  const m = (html || '').match(/data-lh="([^"]*)"/);
  return m ? m[1] : '1.8';
}

/**
 * 文字內容自動縮放：若文字超出容器高度，等比縮小直到不截斷
 */
function ScaledContent({ html, className, style }) {
  const wrapRef  = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    // 先還原，量測原始高度
    inner.style.transform = '';
    inner.style.width     = '';

    requestAnimationFrame(() => {
      const wh = wrap.clientHeight;
      const ih = inner.scrollHeight;
      if (ih > wh + 2) {
        const s = wh / ih;
        inner.style.transform       = `scale(${s})`;
        inner.style.transformOrigin = 'top left';
        inner.style.width           = `${100 / s}%`;
      }
    });
  }, [html]);

  return (
    <div ref={wrapRef} className={className} style={{ ...style, overflow: 'hidden' }}>
      <div ref={innerRef} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
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

/** 移除空行（空段落、只有 br 的段落） */
function stripEmptyLines(html) {
  return (html || '')
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
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

  const cleanContent = stripEmptyLines(content || '');
  const imageSrcs   = extractImageSrcs(cleanContent);
  const textHtml    = stripImages(cleanContent);
  const hasImg      = imageSrcs.length > 0;
  const hasTxt      = textHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, '').length > 0;
  const lineHeight  = extractLineHeight(content || '');

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
          <ScaledContent
            html={textHtml}
            className="announcement-content flex-1 text-gray-700 min-h-0"
            style={{ lineHeight }}
          />
          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1 overflow-hidden"
            style={{ width: '42%' }}>
            {imageSrcs.map((src, i) => (
              <img key={i} src={src} alt="公告圖片" className="w-full object-contain rounded-md" />
            ))}
          </div>
        </div>
      ) : hasImg ? (
        /* 純圖片：置中等比縮放至框內 */
        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 min-h-0 overflow-hidden">
          {imageSrcs.map((src, i) => (
            <img key={i} src={src} alt="公告圖片" className="max-w-full max-h-full object-contain rounded-md" />
          ))}
        </div>
      ) : (
        /* 純文字 */
        <ScaledContent
          html={cleanContent}
          className="announcement-content flex-1 px-5 py-3 text-gray-700 min-h-0"
          style={{ lineHeight }}
        />
      )}
    </motion.div>
  );
}
