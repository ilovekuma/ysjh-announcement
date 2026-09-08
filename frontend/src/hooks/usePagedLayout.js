import { useState, useLayoutEffect } from 'react';
import { measureNaturalHeight, waitForImages } from '../utils/textMeasure';
import { cleanAnnouncementHtml, classifyContent, extractLineHeight } from '../utils/announcementContent';

const GAP = 8;        // 對應 grid gap-2
const HEADER_H = 56;  // 卡片頂部標籤列估計高度（px-5 pt-4 pb-2 + 標籤本身）
const CARD_MS = 10000; // 每張卡片播放秒數（無論卡片大小）

/** 依內容自然高度決定卡片所需版位：1=1/4頁、2=1/2頁、4=整頁 */
function computeTiers(announcements, quarterW, quarterH, fullW, fullH) {
  const availTier1 = quarterH - HEADER_H;
  const availTier3 = fullH - HEADER_H;

  return announcements.map((ann) => {
    const html = cleanAnnouncementHtml(ann.content || '');
    const { hasImg, hasTxt } = classifyContent(html);

    // 含圖片一律用整頁版位呈現大圖，維持原本做法
    if (hasImg) {
      if (!hasTxt) {
        return { ann, tier: 4, truncate: false };
      }
      const lineHeight = extractLineHeight(ann.content || '');
      const hFull = measureNaturalHeight(html, fullW, lineHeight);
      return { ann, tier: 4, truncate: hFull > availTier3 };
    }

    const lineHeight = extractLineHeight(ann.content || '');
    const hQuarter = measureNaturalHeight(html, quarterW, lineHeight);

    if (hQuarter <= availTier1) {
      return { ann, tier: 1, truncate: false };
    }

    const hFull = measureNaturalHeight(html, fullW, lineHeight);
    if (hFull <= availTier1) {
      return { ann, tier: 2, truncate: false };
    }
    if (hFull <= availTier3) {
      return { ann, tier: 4, truncate: false };
    }
    return { ann, tier: 4, truncate: true };
  });
}

/**
 * 由第一頁開始往後找空位放置卡片，放不下才開新頁（first-fit）。
 * 每頁固定 2×2＝4 格，以「列」為單位追蹤佔用狀態：
 *   row === null                      → 該列全空
 *   { kind:'full',  item }            → 整頁卡片佔用（跨兩列）
 *   { kind:'half',  item }            → 該列被 1/2 頁卡片整列佔滿
 *   { kind:'quarter', items:[a] }     → 該列放了 1 張 1/4 卡片，還有 1 格空位
 *   { kind:'quarter', items:[a,b] }   → 該列 2 格皆滿
 */
function pack(sizedList) {
  const pages = [];
  const newPage = () => { const p = { row0: null, row1: null }; pages.push(p); return p; };

  const place4 = (item) => {
    for (const page of pages) {
      if (page.row0 === null && page.row1 === null) {
        page.row0 = { kind: 'full', item };
        page.row1 = { kind: 'full', item };
        return;
      }
    }
    const page = newPage();
    page.row0 = { kind: 'full', item };
    page.row1 = { kind: 'full', item };
  };

  const place2 = (item) => {
    for (const page of pages) {
      if (page.row0 === null) { page.row0 = { kind: 'half', item }; return; }
      if (page.row1 === null) { page.row1 = { kind: 'half', item }; return; }
    }
    const page = newPage();
    page.row0 = { kind: 'half', item };
  };

  const place1 = (item) => {
    for (const page of pages) {
      for (const key of ['row0', 'row1']) {
        const row = page[key];
        if (row === null) { page[key] = { kind: 'quarter', items: [item] }; return; }
        if (row.kind === 'quarter' && row.items.length === 1) { row.items.push(item); return; }
      }
    }
    const page = newPage();
    page.row0 = { kind: 'quarter', items: [item] };
  };

  for (const item of sizedList) {
    if (item.tier === 4) place4(item);
    else if (item.tier === 2) place2(item);
    else place1(item);
  }

  return pages;
}

/** 將 pack() 結果轉為可直接渲染的頁面模型（含 grid-column / grid-row） */
function toRenderModel(pages) {
  return pages.map((page) => {
    const cards = [];
    [page.row0, page.row1].forEach((row, rowIdx) => {
      if (!row) return;
      if (row.kind === 'full') {
        if (rowIdx === 0) {
          cards.push({
            ann: row.item.ann,
            gridColumn: '1 / span 2',
            gridRow: '1 / span 2',
          });
        }
      } else if (row.kind === 'half') {
        cards.push({
          ann: row.item.ann,
          gridColumn: '1 / span 2',
          gridRow: `${rowIdx + 1} / span 1`,
        });
      } else if (row.kind === 'quarter') {
        row.items.forEach((item, colIdx) => {
          cards.push({
            ann: item.ann,
            gridColumn: `${colIdx + 1} / span 1`,
            gridRow: `${rowIdx + 1} / span 1`,
          });
        });
      }
    });
    return { cards, cardCount: cards.length };
  });
}

function computeLayout(announcements, w, h) {
  const quarterW = (w - GAP) / 2;
  const quarterH = (h - GAP) / 2;
  const sized = computeTiers(announcements, quarterW, quarterH, w, h);
  return toRenderModel(pack(sized));
}

/**
 * usePagedLayout — 依卡片實際內容自然高度動態決定版位（1/4、1/2、整頁），
 * 並以 first-fit 方式從第一頁開始填補空位，放不下才開新頁。
 */
export function usePagedLayout(announcements, containerRef) {
  const [pages, setPages] = useState([]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || announcements.length === 0) {
      setPages([]);
      return;
    }

    let cancelled = false;

    const recompute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      if (!cancelled) setPages(computeLayout(announcements, w, h));
    };

    recompute();

    const ro = new ResizeObserver(recompute);
    ro.observe(el);

    // 圖片首次量測時可能尚未載入完成（自然高度量測為 0），載入後校正一次
    const anyImages = announcements.some(a => /<img/i.test(a.content || ''));
    if (anyImages) {
      Promise.all(announcements.map(a => waitForImages(a.content || ''))).then(() => {
        if (!cancelled) recompute();
      });
    }

    return () => { cancelled = true; ro.disconnect(); };
  }, [announcements, containerRef]);

  return pages;
}

export const CARD_INTERVAL_MS = CARD_MS;
