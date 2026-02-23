import { useState } from 'react';
import Header from './components/layout/Header';
import PixelMonster from './components/pixel/PixelMonster';
import AnnouncementCarousel from './components/carousel/AnnouncementCarousel';
import OverviewGrid from './components/overview/OverviewGrid';
import AdminPanel from './components/admin/AdminPanel';
import { useAnnouncements } from './hooks/useAnnouncements';
import { useAdminAccess } from './hooks/useAdminAccess';

export default function App() {
  const announcementsHook = useAnnouncements();
  const { announcements, allAnnouncements, loading, useMock } = announcementsHook;

  const { adminOpen, handleLogoClick, closeAdmin } = useAdminAccess();
  const [overviewOpen, setOverviewOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-white overflow-hidden">
      {/* 頂部導覽列 */}
      <Header
        onLogoClick={handleLogoClick}
        onOverviewOpen={() => setOverviewOpen(true)}
        useMock={useMock}
      />

      {/* 像素小怪物跑道 */}
      <PixelMonster />

      {/* 主內容區：flex-1 + min-h-0 讓輪播能撐滿剩餘高度 */}
      <main className="flex-1 min-h-0 flex flex-col px-5 pt-4 pb-2">
        <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col gap-3">
          {/* 標題列 */}
          <div className="flex-shrink-0 flex items-center justify-between">
            <h2 className="text-xl font-bold text-school-navy tracking-wide">
              📋 今日公告
            </h2>
            <p className="text-school-blue/50 text-xs">
              上下拖曳切換 · 每 15 秒自動翻頁
            </p>
          </div>

          {/* 輪播主體：撐滿剩餘高度 */}
          <div className="flex-1 min-h-0">
            <AnnouncementCarousel
              announcements={announcements}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* 頁尾 */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200 bg-white/50">
        育賢國中校園公告系統 · 如有問題請洽教務處
      </footer>

      {/* 總覽 Modal */}
      <OverviewGrid
        open={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        announcements={announcements}
      />

      {/* 管理後台 Panel */}
      <AdminPanel
        open={adminOpen}
        onClose={closeAdmin}
        announcements={announcements}
        allAnnouncements={allAnnouncements}
        hooks={announcementsHook}
        loading={loading}
      />
    </div>
  );
}
