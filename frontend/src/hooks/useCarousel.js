import { useState, useEffect, useRef, useCallback } from 'react';

const AUTO_INTERVAL_MS = 15000; // 15 秒換頁
const DRAG_THRESHOLD   = 40;    // px，垂直拖曳閾值

/**
 * 輪播邏輯 Hook（頁面為單位）
 * - 自動 15 秒換頁
 * - hover pause
 * - 垂直 pointer drag 切換
 */
export function useCarousel(count) {
  const [current, setCurrent]     = useState(0);
  const [paused, setPaused]       = useState(false);
  const [direction, setDirection] = useState(1); // 1=往下(下一頁), -1=往上(上一頁)
  const timerRef   = useRef(null);
  const dragStartY = useRef(null);

  const goTo = useCallback((index, dir = 1) => {
    setDirection(dir);
    setCurrent((index + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(current + 1,  1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // 自動播放
  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => {
        setDirection(1);
        return (c + 1) % count;
      });
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, count]);

  // 資料量改變時 reset
  useEffect(() => {
    setCurrent(0);
  }, [count]);

  // 垂直 Pointer drag handlers
  const onPointerDown = useCallback((e) => {
    dragStartY.current = e.clientY;
  }, []);

  const onPointerUp = useCallback((e) => {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    dragStartY.current = null;
    if (Math.abs(delta) < DRAG_THRESHOLD) return;
    if (delta < 0) next(); // 向上拖 → 下一頁
    else           prev(); // 向下拖 → 上一頁
  }, [next, prev]);

  const pauseCarousel  = useCallback(() => setPaused(true),  []);
  const resumeCarousel = useCallback(() => setPaused(false), []);

  return {
    current,
    direction,
    goTo,
    next,
    prev,
    onPointerDown,
    onPointerUp,
    pauseCarousel,
    resumeCarousel,
  };
}
