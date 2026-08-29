import Logo from './Logo';
import { formatDate } from '../../utils/dateUtils';

/**
 * Header.jsx — 頂部導覽列
 * carouselNav: { page, pageCount, count, prev, next, goTo }
 */
export default function Header({ onLogoClick, onOverviewOpen, useMock, carouselNav }) {
  const today = formatDate(new Date().toISOString());
  const nav = carouselNav;

  return (
    <header className="bg-school-navy text-white shadow-lg z-20 relative">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-3">
        {/* 校徽（三連點） */}
        <Logo onClick={onLogoClick} />

        {/* 校名（單行） */}
        <div className="flex-shrink-0 min-w-0 flex items-baseline gap-1.5">
          <h1 className="text-sm font-bold tracking-wide leading-none">育賢國中</h1>
          <p className="text-school-cream/70 text-xs leading-none hidden sm:block">{today}</p>
        </div>

        {/* 輪播導覽（桌面版，置中彈性區） */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2">
          {nav && nav.pageCount > 1 && (
            <>
              {/* 上一頁 */}
              <button
                onClick={nav.prev}
                aria-label="上一頁"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* 進度點 */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: nav.pageCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => nav.goTo(i, i > nav.page ? 1 : -1)}
                    aria-label={`第 ${i + 1} 頁`}
                    className={`rounded-full transition-all duration-300 focus:outline-none
                      ${i === nav.page
                        ? 'w-5 h-2 bg-white'
                        : 'w-2 h-2 bg-white/35 hover:bg-white/60'
                      }`}
                  />
                ))}
              </div>

              {/* 下一頁 */}
              <button
                onClick={nav.next}
                aria-label="下一頁"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 頁碼 */}
              <span className="text-xs text-white/60 whitespace-nowrap select-none">
                {nav.page + 1} / {nav.pageCount} 頁 · {nav.count} 則
              </span>
            </>
          )}
        </div>

        {/* Mock 提示 */}
        {useMock && (
          <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            ⚠️ 示範模式
          </span>
        )}

        {/* 總覽按鈕 */}
        <button
          onClick={onOverviewOpen}
          className="flex items-center gap-1 bg-school-gold hover:bg-yellow-500 text-school-navy
                     font-semibold text-xs px-2.5 py-1 rounded-lg shadow transition-colors"
          aria-label="開啟公告總覽"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="hidden sm:inline">總覽</span>
        </button>
      </div>
    </header>
  );
}
