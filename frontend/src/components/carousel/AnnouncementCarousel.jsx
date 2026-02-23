import { AnimatePresence, motion } from 'framer-motion';
import AnnouncementCard from './AnnouncementCard';
import CarouselDots from './CarouselDots';
import { useCarousel } from '../../hooks/useCarousel';

const CARDS_PER_PAGE = 4;

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
export default function AnnouncementCarousel({ announcements, loading }) {
  const count     = announcements.length;
  const pageCount = Math.max(1, Math.ceil(count / CARDS_PER_PAGE));

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
  } = useCarousel(pageCount);

  const pageCards = announcements.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

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
    <div className="flex flex-col h-full gap-3">
      {/* 主輪播區 */}
      <div
        className="relative flex-1 min-h-0 overflow-hidden rounded-2xl select-none cursor-grab active:cursor-grabbing"
        onMouseEnter={pauseCarousel}
        onMouseLeave={resumeCarousel}
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
            className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3 p-1"
          >
            {pageCards.map((ann) => (
              <AnnouncementCard key={ann.id} announcement={ann} isActive />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部導覽 */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4">
        {pageCount > 1 && (
          <button onClick={prev} aria-label="上一頁"
            className="w-9 h-9 rounded-full bg-white shadow border border-gray-200
                       flex items-center justify-center text-school-navy
                       hover:bg-school-navy hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
        <CarouselDots count={pageCount} current={page} onDotClick={(i) => goTo(i, i > page ? 1 : -1)} />
        {pageCount > 1 && (
          <button onClick={next} aria-label="下一頁"
            className="w-9 h-9 rounded-full bg-white shadow border border-gray-200
                       flex items-center justify-center text-school-navy
                       hover:bg-school-navy hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      <p className="flex-shrink-0 text-center text-xs text-gray-400 -mt-1">
        第 {page + 1} 頁 / 共 {pageCount} 頁 &nbsp;·&nbsp; {count} 則公告
      </p>
    </div>
  );
}
