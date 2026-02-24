/**
 * 將任意日期字串轉成本地時間的 YYYY-MM-DD
 * 解決 new Date("YYYY-MM-DD") 被視為 UTC 午夜、在 UTC+8 會晚 8 小時的問題。
 * 用法：toLocalDateString("2026-02-24T16:00:00.000Z") → "2026-02-25"（台灣時區）
 */
export function toLocalDateString(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 取得今日本地 ISO date string（YYYY-MM-DD）
 * 修正：原本 toISOString() 回傳 UTC，在台灣凌晨會得到昨天的日期
 */
export function todayISO() {
  const d = new Date();
  return toLocalDateString(d.toISOString()); // 用本地時間版本
}

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
