/**
 * textMeasure.js — 卡片分頁演算法用的離屏量測工具
 * 直接操作 DOM（不經過 React render），量測 HTML 內容在指定寬度下的自然高度。
 */

/**
 * 量測 HTML 內容在指定寬度、不限高度時的自然高度（px）。
 * 套用與 .announcement-content 相同的 class + 行高，確保與實際卡片渲染一致。
 */
export function measureNaturalHeight(html, width, lineHeight) {
  const probe = document.createElement('div');
  probe.className = 'announcement-content';
  probe.style.position   = 'absolute';
  probe.style.left       = '-99999px';
  probe.style.top        = '0';
  probe.style.visibility = 'hidden';
  probe.style.width      = `${Math.max(0, Math.floor(width))}px`;
  probe.style.height     = 'auto';
  probe.style.lineHeight = lineHeight || '1.8';
  probe.style.paddingTop = '12px';
  probe.style.paddingBottom = '12px';
  probe.style.paddingLeft   = '20px';
  probe.style.paddingRight  = '20px';
  probe.style.boxSizing     = 'border-box';
  probe.innerHTML = html || '';

  document.body.appendChild(probe);
  const h = probe.scrollHeight;
  document.body.removeChild(probe);
  return h;
}

/**
 * 等待 HTML 內容中所有圖片載入完成（取得真實尺寸），供量測後校正一次。
 * 逾時 2 秒放棄等待，避免圖片失效時卡住重新計算。
 */
export function waitForImages(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  const srcs = Array.from(div.querySelectorAll('img')).map(img => img.src);
  if (srcs.length === 0) return Promise.resolve();

  const timeout = new Promise(resolve => setTimeout(resolve, 2000));
  const loaded = Promise.all(srcs.map(src => new Promise(resolve => {
    const img = new Image();
    img.onload  = resolve;
    img.onerror = resolve;
    img.src = src;
  })));

  return Promise.race([loaded, timeout]);
}
