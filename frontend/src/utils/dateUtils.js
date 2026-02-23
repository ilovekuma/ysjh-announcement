/**
 * 將 ISO 日期字串格式化為台灣慣用格式
 * e.g. "2024-03-15" → "2024年3月15日"
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 取得今日 ISO date string（YYYY-MM-DD）
 */
export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * 判斷公告是否在有效期內
 */
export function isActive(announcement) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(announcement.start_date);
  const end   = new Date(announcement.end_date);
  end.setHours(23, 59, 59, 999);
  return announcement.status === 'active' && today >= start && today <= end;
}

/**
 * 計算距離 end_date 剩餘天數（負數表示已過期）
 */
export function daysLeft(endDateISO) {
  if (!endDateISO) return null;
  const end   = new Date(endDateISO);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end - today) / 86400000);
}
