import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { daysLeft } from '../../utils/dateUtils';

/** 從 HTML wrapper div 的 data-lh 屬性取出行高值 */
function extractLineHeight(html) {
  const m = (html || '').match(/data-lh="([^"]*)"/);
  return m ? m[1] : '1.8';
}

/**
 * 純圖片顯示：ResizeObserver 量出容器實際 px 尺寸後，
 * 用 object-fit: contain 填滿可用空間（等比縮放，不裁切）。
 * 多張圖片時平均分配高度。
 */
function PureImageDisplay({ imageSrcs }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const GAP = 8;
  const imgH = dims.h > 0
    ? Math.floor((dims.h - GAP * (imageSrcs.length - 1)) / imageSrcs.length)
    : 0;

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 px-4 py-3 overflow-hidden"
    >
      {dims.w > 0 && imgH > 0 && imageSrcs.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="公告圖片"
          className="rounded-md"
          style={{ width: dims.w, height: imgH, objectFit: 'contain' }}
        />
      ))}
    </div>
  );
}

/**
 * 圖文混排 / 純文字內容
 * - useLayoutEffect（繪製前執行）+ 直接操作 img DOM 樣式，無閃爍
 * - 暫時隱藏圖片量測純文字高度，剩餘高度等分給每張圖
 * - 圖片設為 width:100% / height:perImg / objectFit:contain，填滿並等比縮放
 */
function TextImageContent({ html, lineHeight }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const adjust = () => {
      const imgs = Array.from(el.querySelectorAll('img'));
      if (imgs.length === 0) return;

      const containerH = el.clientHeight;
      if (containerH === 0) return;

      // 隱藏整個 block wrapper（<p>/<h1> 等），而非只隱藏 <img>
      // 避免空 <p> 因 font-size:2em 仍有 ~54px line-height 撐高 textH
      const wrappers = imgs.map(img => img.closest('p, h1, h2, h3, h4, h5, h6') || img);
      wrappers.forEach(w => { w.style.display = 'none'; });

      // el 是 flex-1，el.scrollHeight 在 overflow:hidden 時 = max(clientHeight, contentH)
      // 改用內部 data-lh wrapper（普通 block 元素）量純文字高度才準確
      const inner = el.querySelector('[data-lh]') || el.firstElementChild;
      const textH = inner ? inner.scrollHeight : 0;

      wrappers.forEach(w => { w.style.display = ''; });

      // 扣除容器上下 padding（py-3 = 12px × 2）及緩衝，剩餘空間分配給圖片
      const style = getComputedStyle(el);
      const padV  = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const perImg = Math.max(40, Math.floor((containerH - padV - textH - 8) / imgs.length));

      // 圖片填滿分配空間，等比縮放
      imgs.forEach(img => {
        img.style.width      = '100%';
        img.style.height     = `${perImg}px`;
        img.style.objectFit  = 'contain';
      });
    };

    const ro = new ResizeObserver(adjust);
    ro.observe(el);
    adjust();
    return () => ro.disconnect();
  }, [html]);

  return (
    <div
      ref={ref}
      className="announcement-content flex-1 px-5 py-3 text-gray-700 min-h-0 overflow-hidden"
      style={{ lineHeight }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** lh3.googleusercontent.com 圖片 URL 強制使用原始尺寸（=s0），修正舊公告的 =sNUM 縮圖 */
function fixImageUrl(src) {
  if (!src.includes('lh3.googleusercontent.com')) return src;
  return src.replace(/=s\d+/, '=s0').replace(/(\/d\/[^=?]+)(?!=s)(\?|$)/, '$1=s0$2');
}

/** HTML 字串內所有 lh3 圖片 URL 套用 fixImageUrl */
function fixHtmlImageUrls(html) {
  return (html || '').replace(
    /(<img[^>]+src=["'])(https:\/\/lh3\.googleusercontent\.com[^"']+)(["'])/gi,
    (_, pre, url, post) => pre + fixImageUrl(url) + post
  );
}

/** 移除首個字元為空或換行符號的行（h1/h2/p 元素），含圖片的段落保留 */
function filterEmptyStartLines(html) {
  return (html || '').replace(
    /<(h[1-6]|p)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, _tag, _attrs, inner) => {
      if (/<img/i.test(inner)) return match;
      const text = inner.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      if (text.trim() === '' || text[0] === '\n') return '';
      return match;
    }
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

  const cleanContent = fixHtmlImageUrls(filterEmptyStartLines(stripEmptyLines(content || '')));
  const imageSrcs   = extractImageSrcs(cleanContent).map(fixImageUrl);
  const hasImg      = imageSrcs.length > 0;
  const hasTxt      = stripImages(cleanContent).replace(/<[^>]*>/g, '').replace(/\s+/g, '').length > 0;
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
          className="inline-flex items-center gap-1 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm"
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
      {hasImg && !hasTxt ? (
        /* 純圖片：原始像素大小，超出則等比縮放 */
        <PureImageDisplay imageSrcs={imageSrcs} />
      ) : (
        /* 圖文混排 or 純文字 */
        <TextImageContent html={cleanContent} lineHeight={lineHeight} />
      )}
    </motion.div>
  );
}
