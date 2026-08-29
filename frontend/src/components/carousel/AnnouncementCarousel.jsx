import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnnouncementCard from './AnnouncementCard';
import { useCarousel } from '../../hooks/useCarousel';

const CARDS_PER_PAGE = 4;
const IMAGE_PAGE_MS  = 10000;
const MIN_MS = 8000;
const MAX_MS = 30000;
const CHARS_PER_SEC = 5;

function hasImage(ann) {
  return /<img/i.test(ann.content || '');
}

/** 含圖公告獨佔一頁（全版），純文字公告 4 張一組 */
function buildPages(announcements) {
  const pages = [];
  let textGroup = [];

  for (const ann of announcements) {
    if (hasImage(ann)) {
      if (textGroup.length > 0) {
        for (let i = 0; i < textGroup.length; i += CARDS_PER_PAGE) {
          pages.push({ type: 'text', cards: textGroup.slice(i, i + CARDS_PER_PAGE) });
        }
        textGroup = [];
      }
      pages.push({ type: 'image', cards: [ann] });
    } else {
      textGroup.push(ann);
    }
  }

  if (textGroup.length > 0) {
    for (let i = 0; i < textGroup.length; i += CARDS_PER_PAGE) {
      pages.push({ type: 'text', cards: textGroup.slice(i, i + CARDS_PER_PAGE) });
    }
  }

  return pages.length > 0 ? pages : [{ type: 'text', cards: [] }];
}

function calcPageInterval(cards) {
  const chars = cards.reduce((sum, ann) => {
    const text = (ann.content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, '');
    return sum + text.length;
  }, 0);
  const ms = Math.round((chars / CHARS_PER_SEC) * 1000);
  return Math.min(MAX_MS, Math.max(MIN_MS, ms));
}

// 垂直換頁動畫
const PAGE_VARIANTS = {
  enter: (dir) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 220, damping: 30 } },
  exit:   (dir) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.28, ease: 'easeIn' } }),
};

/**
 * AnnouncementCarousel — 固定 2×2 網格，15 秒自動換頁，支援垂直拖曳
 * 卡片字型大小由 AnnouncementCard 依內容長度自動縮放
 */
export default function AnnouncementCarousel({ announcements, loading, onCardDoubleClick, onNavInfo }) {
  const count = announcements.length;
  const pages = buildPages(announcements);
  const pageCount = pages.length;

  const intervals = pages.map(p =>
    p.type === 'image' ? IMAGE_PAGE_MS : calcPageInterval(p.cards)
  );

  const {
    current: page,
    direction,
    goTo,
    next,
    prev,
    onPointerDown,
    onPointerUp,
    pauseCarousel,
    resumeCarousel,
  } = useCarousel(pageCount, intervals);

  const currentPage = pages[page] ?? { type: 'text', cards: [] };

  // 通知父層目前導覽狀態，讓 Header 顯示
  useEffect(() => {
    onNavInfo?.({ page, pageCount, count, prev, next, goTo });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageCount, count]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-school-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-school-navy/50 text-sm">載入公告中…</p>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-school-navy/40">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium">目前無公告</p>
        <p className="text-sm">請稍後再查看，或由管理員新增公告</p>
      </div>
    );
  }

  return (
    <>
      {/* ── 手機版：單欄垂直捲動，無輪播 ── */}
      <div className="md:hidden h-full overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-3 pb-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="h-64 flex-shrink-0">
              <AnnouncementCard
                announcement={ann}
                isActive
                onDoubleClick={() => onCardDoubleClick?.(ann)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── 桌面版：2×2 網格自動輪播（導覽已移至頂部 Header）── */}
      <div className="hidden md:block h-full">
        <div
          className="relative w-full h-full overflow-hidden rounded-2xl select-none cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          style={{ touchAction: 'pan-x' }}
        >
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={page}
              custom={direction}
              variants={PAGE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              className={`absolute inset-0 p-0 ${
                currentPage.type === 'image'
                  ? ''
                  : 'grid grid-cols-2 grid-rows-2 gap-2'
              }`}
            >
              {currentPage.type === 'image' ? (
                <AnnouncementCard
                  key={currentPage.cards[0].id}
                  announcement={currentPage.cards[0]}
                  isActive
                  onDoubleClick={() => onCardDoubleClick?.(currentPage.cards[0])}
                />
              ) : (
                currentPage.cards.map((ann) => (
                  <AnnouncementCard
                    key={ann.id}
                    announcement={ann}
                    isActive
                    onDoubleClick={() => onCardDoubleClick?.(ann)}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
