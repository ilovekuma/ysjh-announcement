import { useState, useEffect, useRef, useCallback } from 'react';

const DRAG_THRESHOLD = 40; // px

/**
 * 依每頁停留時間（intervals 陣列）自動輪播
 * intervals[i] 單位 ms；若未傳入則固定 20 秒
 */
export function useCarousel(count, intervals = []) {
  const [current, setCurrent]     = useState(0);
  const [paused, setPaused]       = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef   = useRef(null);
  const currentRef = useRef(0);
  const dragStartY = useRef(null);

  const goTo = useCallback((index, dir = 1) => {
    const next = (index + count) % count;
    setDirection(dir);
    setCurrent(next);
    currentRef.current = next;
  }, [count]);

  const next = useCallback(() => goTo(currentRef.current + 1,  1), [goTo]);
  const prev = useCallback(() => goTo(currentRef.current - 1, -1), [goTo]);

  // 自動播放（每頁各自停留時間）
  useEffect(() => {
    if (paused || count <= 1) return;

    const tick = () => {
      const cur = currentRef.current;
      const ms  = intervals[cur] ?? 20000;
      timerRef.current = setTimeout(() => {
        setCurrent(c => {
          const next = (c + 1) % count;
          currentRef.current = next;
          setDirection(1);
          return next;
        });
        tick();
      }, ms);
    };

    tick();
    return () => clearTimeout(timerRef.current);
  }, [paused, count, intervals]); // eslint-disable-line react-hooks/exhaustive-deps

  // 資料量改變時 reset
  useEffect(() => {
    currentRef.current = 0;
    setCurrent(0);
  }, [count]);

  const onPointerDown = useCallback((e) => {
    dragStartY.current = e.clientY;
  }, []);

  const onPointerUp = useCallback((e) => {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    dragStartY.current = null;
    if (Math.abs(delta) < DRAG_THRESHOLD) return;
    if (delta < 0) next();
    else           prev();
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
