/**
 * 根據月份回傳季節
 * 3-5: spring | 6-8: summer | 9-11: autumn | 12,1,2: winter
 */
export function getSeason(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

/**
 * 季節對應的主題色
 */
export const SEASON_THEME = {
  spring: {
    bg:      'from-pink-100 to-green-100',
    accent:  '#e879a0',
    label:   '🌸 春季',
    monster: 'spring',
  },
  summer: {
    bg:      'from-cyan-100 to-yellow-100',
    accent:  '#0ea5e9',
    label:   '☀️ 夏季',
    monster: 'summer',
  },
  autumn: {
    bg:      'from-orange-100 to-amber-100',
    accent:  '#ea580c',
    label:   '🍂 秋季',
    monster: 'autumn',
  },
  winter: {
    bg:      'from-blue-100 to-indigo-100',
    accent:  '#3b82f6',
    label:   '❄️ 冬季',
    monster: 'winter',
  },
};
