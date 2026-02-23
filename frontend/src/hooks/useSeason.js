import { useMemo } from 'react';
import { getSeason, SEASON_THEME } from '../utils/seasonUtils';

/**
 * 回傳當前季節與對應主題
 */
export function useSeason() {
  return useMemo(() => {
    const season = getSeason();
    return { season, theme: SEASON_THEME[season] };
  }, []);
}
