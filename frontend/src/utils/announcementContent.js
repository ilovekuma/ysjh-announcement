/**
 * announcementContent.js — 公告 HTML 內容清理 / 分類共用邏輯
 * 供 AnnouncementCard（實際渲染）與 usePagedLayout（分頁量測）共用，
 * 確保量測結果與實際顯示一致。
 */

/** 從 HTML wrapper div 的 data-lh 屬性取出行高值 */
export function extractLineHeight(html) {
  const m = (html || '').match(/data-lh="([^"]*)"/);
  return m ? m[1] : '1.8';
}

/** lh3.googleusercontent.com 圖片 URL 強制使用原始尺寸（=s0），修正舊公告的 =sNUM 縮圖 */
export function fixImageUrl(src) {
  if (!src.includes('lh3.googleusercontent.com')) return src;
  return src.replace(/=s\d+/, '=s0').replace(/(\/d\/[^=?]+)(?!=s)(\?|$)/, '$1=s0$2');
}

/** HTML 字串內所有 lh3 圖片 URL 套用 fixImageUrl */
export function fixHtmlImageUrls(html) {
  return (html || '').replace(
    /(<img[^>]+src=["'])(https:\/\/lh3\.googleusercontent\.com[^"']+)(["'])/gi,
    (_, pre, url, post) => pre + fixImageUrl(url) + post
  );
}

/** 移除首個字元為空或換行符號的行（h1/h2/p 元素），含圖片的段落保留 */
export function filterEmptyStartLines(html) {
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
export function extractImageSrcs(html) {
  const srcs = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    srcs.push(match[1]);
  }
  return srcs;
}

/** 移除所有 img 標籤及其產生的空段落 */
export function stripImages(html) {
  return (html || '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<p>(\s|&nbsp;)*<\/p>/gi, '');
}

/** 移除空行（空段落、只有 br 的段落） */
export function stripEmptyLines(html) {
  return (html || '')
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
}

/** 完整清理流程：修正圖片網址、移除空開頭行、移除空行 */
export function cleanAnnouncementHtml(html) {
  return fixHtmlImageUrls(filterEmptyStartLines(stripEmptyLines(html || '')));
}

/** 分類已清理過的內容：是否含圖片 / 是否含文字 */
export function classifyContent(cleanContent) {
  const imageSrcs = extractImageSrcs(cleanContent).map(fixImageUrl);
  const hasImg = imageSrcs.length > 0;
  const hasTxt = stripImages(cleanContent).replace(/<[^>]*>/g, '').replace(/\s+/g, '').length > 0;
  return { imageSrcs, hasImg, hasTxt };
}
