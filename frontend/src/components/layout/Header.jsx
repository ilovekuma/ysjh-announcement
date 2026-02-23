import Logo from './Logo';
import { formatDate } from '../../utils/dateUtils';

/**
 * Header.jsx — 頂部導覽列
 */
export default function Header({ onLogoClick, onOverviewOpen, useMock }) {
  const today = formatDate(new Date().toISOString());

  return (
    <header className="bg-school-navy text-white shadow-lg z-20 relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* 校徽（三連點） */}
        <Logo onClick={onLogoClick} />

        {/* 校名 */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold leading-tight tracking-wide">
            育賢國中
          </h1>
          <p className="text-school-cream text-xs opacity-80">
            每日校園公告 · {today}
          </p>
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
          className="flex items-center gap-1.5 bg-school-gold hover:bg-yellow-500 text-school-navy
                     font-semibold text-sm px-3 py-1.5 rounded-lg shadow transition-colors"
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
