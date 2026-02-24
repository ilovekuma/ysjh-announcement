/**
 * api.js — GAS API 呼叫層
 * GAS Web App 以 302 重定向回應，需帶 redirect: 'follow'
 */

const BASE = import.meta.env.VITE_GAS_URL;

function gasUrl(params = {}) {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

async function gasGet(action) {
  const res = await fetch(gasUrl({ action }), { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function gasPost(body) {
  const res = await fetch(BASE, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain' }, // GAS POST 需用 text/plain 避免 preflight
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Public API ───────────────────────────────────────────────

/** 取得目前有效的公告（看板） */
export const getActive = () => gasGet('getActive');

/** 取得全部公告（管理後台） */
export const getAll = () => gasGet('getAll');

/** 手動觸發歸檔 */
export const triggerArchive = () => gasGet('archive');

/** 新增公告 */
export const createAnnouncement = (data) =>
  gasPost({ action: 'create', data });

/** 更新公告 */
export const updateAnnouncement = (id, data) =>
  gasPost({ action: 'update', id, data });

/** 刪除公告 */
export const deleteAnnouncement = (id) =>
  gasPost({ action: 'delete', id });

/**
 * 上傳圖片至 Google Drive
 * @param {string} base64   - base64 字串（不含 data:... 前綴）
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @param {string} fileName - 原始檔名
 * @returns {{ success: boolean, url: string }}
 */
export const uploadImage = (base64, mimeType, fileName) =>
  gasPost({ action: 'uploadImage', base64, mimeType, fileName });

// ─── Mock fallback（未設定 GAS URL 時的假資料） ─────────────────

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 'mock-1',
    department: '教務處',
    label_color: '#2D5DA6',
    content: '<h2>📚 段考時間公告</h2><p>本學期第二次段考訂於 <strong>3月18日（週一）至3月20日（週三）</strong> 舉行，請同學提前準備，加油！</p>',
    start_date: '2026-02-01',
    end_date: '2026-03-25',
    status: 'active',
    created_at: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'mock-2',
    department: '學務處',
    label_color: '#C9A227',
    content: '<h2>🏃 運動會報名</h2><p>本年度運動會將於 <strong>4月5日</strong> 舉行，各班運動代表請於 <strong>3月10日前</strong> 向班導師登記報名項目。</p><ul><li>100公尺短跑</li><li>400公尺接力</li><li>跳高、跳遠</li></ul>',
    start_date: '2026-02-10',
    end_date: '2026-03-10',
    status: 'active',
    created_at: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'mock-3',
    department: '總務處',
    label_color: '#16a34a',
    content: '<h2>🔧 校舍維修通知</h2><p>因應校舍定期維護工程，<strong>3月1日（週六）</strong> 圖書館暫停開放，造成不便敬請見諒。</p>',
    start_date: '2026-02-15',
    end_date: '2026-03-05',
    status: 'active',
    created_at: '2026-02-15T08:00:00.000Z',
  },
];
