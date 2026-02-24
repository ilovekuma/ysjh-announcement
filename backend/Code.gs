// ============================================================
// Code.gs — 入口：doGet / doPost 路由
// 部署設定：
//   Execute as: Me
//   Who has access: Anyone
// ============================================================

/**
 * 處理 GET 請求
 * ?action=getActive  → 回傳目前有效公告
 * ?action=getAll     → 回傳全部公告（管理後台）
 * ?action=archive    → 手動觸發歸檔
 */
function doGet(e) {
  const action = e.parameter.action || 'getActive';
  let result;

  try {
    switch (action) {
      case 'getActive':
        result = getActiveAnnouncements();
        break;
      case 'getAll':
        result = getAllAnnouncements();
        break;
      case 'archive':
        result = archiveExpired();
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return buildResponse(result);
}

/**
 * 處理 POST 請求
 * Body JSON: { action, id?, data? }
 */
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return buildResponse({ error: 'Invalid JSON body' });
  }

  const { action, id, data } = body;
  let result;

  try {
    switch (action) {
      case 'create':
        result = createAnnouncement(data);
        break;
      case 'update':
        result = updateAnnouncement(id, data);
        break;
      case 'delete':
        result = deleteAnnouncement(id);
        break;
      case 'uploadImage':
        result = uploadImageToDrive(body.base64, body.mimeType, body.fileName);
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return buildResponse(result);
}

/**
 * 建立 JSON 回應（自動附上 CORS header）
 * GAS 部署為 "Anyone" 時會自動加上 Access-Control-Allow-Origin: *
 */
function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
