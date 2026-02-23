import { formatDate } from '../../utils/dateUtils';

/**
 * AnnouncementTable — 公告列表（含歷史）
 */
export default function AnnouncementTable({ announcements, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-school-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8 text-sm">尚無公告記錄</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-school-navy text-white">
          <tr>
            <th className="text-left px-4 py-2.5 font-semibold">單位</th>
            <th className="text-left px-4 py-2.5 font-semibold">內容預覽</th>
            <th className="text-left px-4 py-2.5 font-semibold">起訖日期</th>
            <th className="text-center px-4 py-2.5 font-semibold">狀態</th>
            <th className="text-center px-4 py-2.5 font-semibold">操作</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((ann, idx) => (
            <tr
              key={ann.id}
              className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              {/* 單位標籤 */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className="inline-flex items-center gap-1 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: ann.label_color || '#2D5DA6' }}
                >
                  {ann.department}
                </span>
              </td>

              {/* 內容預覽（去除 HTML 標籤） */}
              <td className="px-4 py-3 max-w-xs">
                <p className="truncate text-gray-700" title={stripHtml(ann.content)}>
                  {stripHtml(ann.content).slice(0, 60) || '（無內容）'}
                </p>
              </td>

              {/* 日期 */}
              <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                <div>{formatDate(ann.start_date)}</div>
                <div className="text-gray-400">→ {formatDate(ann.end_date)}</div>
              </td>

              {/* 狀態 */}
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                  ${ann.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ann.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {ann.status === 'active' ? '顯示中' : '已歸檔'}
                </span>
              </td>

              {/* 操作 */}
              <td className="px-4 py-3 text-center whitespace-nowrap">
                <button
                  onClick={() => onEdit(ann)}
                  className="text-school-blue hover:underline text-xs font-medium mr-3"
                  aria-label={`編輯 ${ann.department} 公告`}
                >
                  編輯
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`確定要刪除「${ann.department}」的公告嗎？`)) {
                      onDelete(ann.id);
                    }
                  }}
                  className="text-red-500 hover:underline text-xs font-medium"
                  aria-label={`刪除 ${ann.department} 公告`}
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}
