// ============================================================
// Config.gs — 常數設定
// ============================================================

// Google Sheets 試算表 ID（部署後填入）
const SHEET_ID = '1y_B5OpwkeVMslKze19hYLO8pOjgPlvBqxd863lQSB-M';

// Sheet 名稱
const SHEET_NAME = 'announcements';

// 欄位索引（0-based）
const COL = {
  ID:          0,   // A: UUID
  DEPARTMENT:  1,   // B: 發布單位
  LABEL_COLOR: 2,   // C: 標籤顏色 (hex)
  CONTENT:     3,   // D: HTML 內容
  START_DATE:  4,   // E: 起始日期 (ISO 8601)
  END_DATE:    5,   // F: 結束日期 (ISO 8601)
  STATUS:      6,   // G: active / expired
  CREATED_AT:  7,   // H: 建立時間 (ISO 8601)
};

// 欄位總數
const COL_COUNT = 8;

// 狀態值
const STATUS = {
  ACTIVE:  'active',
  EXPIRED: 'expired',
};

// 允許跨域的 Origin（部署為公開存取時 GAS 自動加入，這裡備用）
const CORS_ORIGIN = '*';

// Google Drive 圖片資料夾名稱
const IMAGE_FOLDER_NAME = '育賢公告圖片';

// 圖片記錄 Sheet 名稱
const IMAGES_SHEET_NAME = 'images';

// 圖片上傳後幾天自動刪除
const IMAGE_EXPIRE_DAYS = 60;
