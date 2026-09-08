import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnnouncementCard from './AnnouncementCard';
import { useCarousel } from '../../hooks/useCarousel';
import { usePagedLayout, CARD_INTERVAL_MS } from '../../hooks/usePagedLayout';

// 垂直換頁動畫
const PAGE_VARIANTS = {
  enter: (dir) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 220, damping: 30 } },
  exit:   (dir) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.28, ease: 'easeIn' } }),
};

/**
 * AnnouncementCarousel — 2×2 版位，卡片依內容自然高度動態決定佔用 1/4、1/2 或整頁，
 * 由第一頁開始往後找空位放置（first-fit），放不下才開新頁。
 * 每張卡片固定播放 10 秒，一頁停留時間 = 該頁卡片數 × 10 秒。
 * 卡片字型大小固定為標題1，內容超出版位時直接裁切（不再自動縮放）。
 */
export default function AnnouncementCarousel({ announcements, loading, onCardDoubleClick, onNavInfo }) {
  const count = announcements.length;
  const gridRef = useRef(null);
  const pages = usePagedLayout(announcements, gridRef);
  const pageCount = pages.length;

  const intervals = pages.map(p => p.cardCount * CARD_INTERVAL_MS);

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

  const currentPage = pages[page] ?? { cards: [] };

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

      {/* ── 桌面版：2×2 版位自動輪播（導覽已移至頂部 Header）── */}
      <div className="hidden md:block h-full">
        <div
          ref={gridRef}
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
              className="absolute inset-0 p-0 grid grid-cols-2 grid-rows-2 gap-2"
            >
              {currentPage.cards.map(({ ann, gridColumn, gridRow }) => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  isActive
                  style={{ gridColumn, gridRow }}
                  onDoubleClick={() => onCardDoubleClick?.(ann)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
