// ============================================================
// ImageManager.gs — Google Drive 圖片上傳與自動清理
// ============================================================

/**
 * 將 base64 圖片上傳至 Google Drive，回傳公開 URL
 * @param {string} base64   - base64 編碼的圖片資料（不含 data:... 前綴）
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @param {string} fileName - e.g. 'photo.jpg'
 * @returns {{ success: boolean, url: string }}
 */
function uploadImageToDrive(base64, mimeType, fileName) {
  const folder = getOrCreateImageFolder();

  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64),
    mimeType,
    fileName
  );

  const file = folder.createFile(blob);

  // 設定任何人皆可透過連結檢視
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // 記錄到 images sheet 供日後清理
  const sheet = getOrCreateImageSheet();
  sheet.appendRow([file.getId(), fileName, new Date().toISOString()]);

  // 使用 thumbnail API URL（比 uc?export=view 更穩定，不會跳轉確認頁）
  const url = 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600';
  return { success: true, url };
}

/**
 * 刪除上傳超過 IMAGE_EXPIRE_DAYS 天的圖片
 * 由每日 trigger 呼叫
 */
function deleteOldImages() {
  const sheet = getOrCreateImageSheet();
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - IMAGE_EXPIRE_DAYS);

  let deleted = 0;

  // 從底部往上刪，避免 row index 偏移
  for (let i = rows.length - 1; i >= 1; i--) {
    const [fileId, , uploadedAt] = rows[i];
    if (new Date(uploadedAt) < cutoff) {
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (e) {
        // 檔案已不存在，略過
      }
      sheet.deleteRow(i + 1);
      deleted++;
    }
  }

  Logger.log('deleteOldImages: ' + deleted + ' 張圖片已移至垃圾桶');
  return { deleted };
}

// ─── 內部工具 ─────────────────────────────────────────────────

function getOrCreateImageFolder() {
  const folders = DriveApp.getFoldersByName(IMAGE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(IMAGE_FOLDER_NAME);
}

function getOrCreateImageSheet() {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let   sheet = ss.getSheetByName(IMAGES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(IMAGES_SHEET_NAME);
    sheet.appendRow(['file_id', 'filename', 'uploaded_at']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
