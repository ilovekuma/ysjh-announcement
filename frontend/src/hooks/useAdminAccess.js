import { useRef, useState, useCallback } from 'react';

const CLICK_COUNT = 3;
const WINDOW_MS   = 3000;

/**
 * 三連點偵測：CLICK_COUNT 次點擊在 WINDOW_MS 毫秒內 → 開啟管理後台
 */
export function useAdminAccess() {
  const [adminOpen, setAdminOpen] = useState(false);
  const clickTimestamps = useRef([]);

  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    clickTimestamps.current.push(now);

    // 只保留 WINDOW_MS 內的點擊
    clickTimestamps.current = clickTimestamps.current.filter(
      t => now - t <= WINDOW_MS
    );

    if (clickTimestamps.current.length >= CLICK_COUNT) {
      clickTimestamps.current = [];
      setAdminOpen(true);
    }
  }, []);

  const closeAdmin = useCallback(() => setAdminOpen(false), []);

  return { adminOpen, handleLogoClick, closeAdmin };
}
