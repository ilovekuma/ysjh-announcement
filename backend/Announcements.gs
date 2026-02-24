// ============================================================
// Announcements.gs — Google Sheets CRUD 操作
// ============================================================

/**
 * 取得 announcements sheet
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(SHEET_NAME);
}

/**
 * 將 Sheets 的日期 cell 值格式化為 YYYY-MM-DD 字串
 * getValues() 回傳的日期欄位是 JS Date 物件（Sheets 時區），
 * 直接 JSON.stringify 會輸出 UTC ISO 字串，在 UTC+8 環境下會早一天。
 */
function formatDateCell(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  // 若已是字串（舊資料），取前 10 碼保持相容
  return String(val).slice(0, 10);
}

/**
 * 將 row 陣列轉為公告物件
 */
function rowToObj(row) {
  return {
    id:          row[COL.ID],
    department:  row[COL.DEPARTMENT],
    label_color: row[COL.LABEL_COLOR],
    content:     row[COL.CONTENT],
    start_date:  formatDateCell(row[COL.START_DATE]),
    end_date:    formatDateCell(row[COL.END_DATE]),
    status:      row[COL.STATUS],
    created_at:  row[COL.CREATED_AT] instanceof Date
                   ? row[COL.CREATED_AT].toISOString()
                   : String(row[COL.CREATED_AT]),
  };
}

/**
 * 取得所有公告（管理後台用）
 */
function getAllAnnouncements() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // 只有標頭或空白
  return data.slice(1).map(rowToObj).reverse(); // 最新在前
}

/**
 * 取得目前有效的公告（看板顯示用）
 * 條件：status = active 且 today 在 start_date ~ end_date 之間
 */
function getActiveAnnouncements() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return data.slice(1)
    .filter(row => {
      if (row[COL.STATUS] !== STATUS.ACTIVE) return false;
      const start = new Date(row[COL.START_DATE]);
      const end   = new Date(row[COL.END_DATE]);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    })
    .map(rowToObj)
    .reverse();
}

/**
 * 建立新公告
 */
function createAnnouncement(data) {
  const sheet = getSheet();
  const id = generateId();
  const now = new Date().toISOString();

  // 若 sheet 全空，先插入標頭列
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'department', 'label_color', 'content', 'start_date', 'end_date', 'status', 'created_at']);
  }

  const row = new Array(COL_COUNT).fill('');
  row[COL.ID]          = id;
  row[COL.DEPARTMENT]  = data.department  || '';
  row[COL.LABEL_COLOR] = data.label_color || '#2D5DA6';
  row[COL.CONTENT]     = data.content     || '';
  row[COL.START_DATE]  = data.start_date  || now;
  row[COL.END_DATE]    = data.end_date    || now;
  row[COL.STATUS]      = STATUS.ACTIVE;
  row[COL.CREATED_AT]  = now;

  sheet.appendRow(row);
  return { success: true, id };
}

/**
 * 更新公告
 */
function updateAnnouncement(id, data) {
  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL.ID] === id) {
      const rowNum = i + 1; // 1-based
      if (data.department  !== undefined) sheet.getRange(rowNum, COL.DEPARTMENT  + 1).setValue(data.department);
      if (data.label_color !== undefined) sheet.getRange(rowNum, COL.LABEL_COLOR + 1).setValue(data.label_color);
      if (data.content     !== undefined) sheet.getRange(rowNum, COL.CONTENT     + 1).setValue(data.content);
      if (data.start_date  !== undefined) sheet.getRange(rowNum, COL.START_DATE  + 1).setValue(data.start_date);
      if (data.end_date    !== undefined) sheet.getRange(rowNum, COL.END_DATE    + 1).setValue(data.end_date);
      if (data.status      !== undefined) sheet.getRange(rowNum, COL.STATUS      + 1).setValue(data.status);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

/**
 * 刪除公告（物理刪除）
 */
function deleteAnnouncement(id) {
  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL.ID] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

/**
 * 產生簡易 UUID（不依賴外部套件）
 */
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 21; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
