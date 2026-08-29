import { useState } from 'react';
import Header from './components/layout/Header';
import AnnouncementCarousel from './components/carousel/AnnouncementCarousel';
import OverviewGrid from './components/overview/OverviewGrid';
import AdminPanel from './components/admin/AdminPanel';
import { useAnnouncements } from './hooks/useAnnouncements';
import { useAdminAccess } from './hooks/useAdminAccess';

export default function App() {
  const announcementsHook = useAnnouncements();
  const { announcements, allAnnouncements, loading, useMock } = announcementsHook;

  const { adminOpen, handleLogoClick: _handleLogoClick, openAdmin, closeAdmin } = useAdminAccess();
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [carouselNav, setCarouselNav] = useState(null);
  const [adminOpenKey, setAdminOpenKey] = useState(0);

  // Logo 點擊：開啟後台，同時遞增 key 讓 AdminPanel 重置表單
  const handleLogoClick = () => {
    _handleLogoClick();
    setAdminOpenKey(k => k + 1);
  };

  const handleCardDoubleClick = (ann) => {
    setPendingEdit(ann);
    openAdmin();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-white overflow-hidden">
      {/* 頂部導覽列 */}
      <Header
        onLogoClick={handleLogoClick}
        onOverviewOpen={() => setOverviewOpen(true)}
        useMock={useMock}
        carouselNav={carouselNav}
      />

      {/* 主內容區：flex-1 + min-h-0 讓輪播撐滿剩餘高度 */}
      <main className="flex-1 min-h-0 px-0.5 py-1">
        <div className="h-full w-full">
          <AnnouncementCarousel
            announcements={announcements}
            loading={loading}
            onCardDoubleClick={handleCardDoubleClick}
            onNavInfo={setCarouselNav}
          />
        </div>
      </main>

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
        initialEdit={pendingEdit}
        onInitialEditConsumed={() => setPendingEdit(null)}
        openKey={adminOpenKey}
      />
    </div>
  );
}
