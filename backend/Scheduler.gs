// ============================================================
// Scheduler.gs — 每日自動歸檔排程
// ============================================================

/**
 * 將過期公告（end_date < 今日 且 status=active）標記為 expired
 * 設定 time-driven trigger：每日凌晨執行此函式
 */
function archiveExpired() {
  const sheet = getSheet();
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let archived = 0;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL.STATUS] !== STATUS.ACTIVE) continue;
    const end = new Date(rows[i][COL.END_DATE]);
    end.setHours(23, 59, 59, 999);
    if (today > end) {
      sheet.getRange(i + 1, COL.STATUS + 1).setValue(STATUS.EXPIRED);
      archived++;
    }
  }

  Logger.log(`archiveExpired: ${archived} 筆公告已歸檔`);
  return { archived };
}

/**
 * 每日維護：歸檔過期公告 + 刪除過期圖片
 * Time-driven trigger 指向此函式
 */
function dailyMaintenance() {
  archiveExpired();
  deleteOldImages();
}

/**
 * 手動設定每日 trigger（只需執行一次）
 * 在 GAS 編輯器中手動執行此函式即可建立每日排程
 */
function setupDailyTrigger() {
  // 移除舊有排程（archiveExpired 和 dailyMaintenance）
  ScriptApp.getProjectTriggers()
    .filter(t => ['archiveExpired', 'dailyMaintenance'].includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('dailyMaintenance')
    .timeBased()
    .everyDays(1)
    .atHour(1) // 每天凌晨 1 點執行
    .create();

  Logger.log('每日維護排程已建立（歸檔 + 圖片清理）');
}

/**
 * 移除所有排程（重置用）
 */
function removeDailyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => ['archiveExpired', 'dailyMaintenance'].includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('排程已移除');
}
