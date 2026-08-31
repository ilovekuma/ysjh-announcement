import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementTable from './AnnouncementTable';

/**
 * AdminPanel — 管理後台 overlay
 */
export default function AdminPanel({ open, onClose, announcements, allAnnouncements, hooks, loading, initialEdit, onInitialEditConsumed, openKey }) {
  const { create, update, remove, archive, fetchAll } = hooks;

  const [editTarget, setEditTarget]   = useState(null); // null=新增, obj=編輯
  const [showForm, setShowForm]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [archiving, setArchiving]     = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [feedback, setFeedback]       = useState(null); // {type:'success'|'error', msg}
  const [tab, setTab]                 = useState('active'); // 'active' | 'all'

  // 開啟時載入全部；若已有快取則背景靜默刷新，不擋 UI
  useEffect(() => {
    if (!open) return;
    if (allAnnouncements.length === 0) {
      setTableLoading(true);
      fetchAll().finally(() => setTableLoading(false));
    } else {
      fetchAll(); // 背景刷新，不顯示 loading
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Logo 點擊開啟後台時，重置編輯表單（openKey 遞增代表 Logo 觸發）
  const prevOpenKeyRef = useRef(openKey);
  useEffect(() => {
    if (openKey !== prevOpenKeyRef.current) {
      prevOpenKeyRef.current = openKey;
      setShowForm(false);
      setEditTarget(null);
    }
  }, [openKey]);

  // 從卡片雙擊進入時，自動展開編輯表單
  const consumedRef = useRef(false);
  useEffect(() => {
    if (open && initialEdit && !consumedRef.current) {
      consumedRef.current = true;
      setEditTarget(initialEdit);
      setShowForm(true);
      onInitialEditConsumed?.();
    }
    if (!open) consumedRef.current = false;
  }, [open, initialEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSubmit = async (data) => {
    // 記錄目前的操作類型（關閉 form 前先存起來）
    const isEdit  = !!editTarget;
    const targetId = editTarget?.id;

    // ① 立即關閉表單 & 顯示樂觀成功（不等 GAS 回應）
    setShowForm(false);
    setEditTarget(null);
    setSubmitting(true);
    showFeedback('success', isEdit ? '公告更新中…' : '公告新增中…');

    try {
      // ② 背景執行 API（本地 state 已被 Hook 樂觀更新）
      const result = isEdit
        ? await update(targetId, data)
        : await create(data);

      if (result.success) {
        showFeedback('success', isEdit ? '✓ 公告已更新' : '✓ 公告已新增');
      } else {
        // GAS 回報失敗：Hook 已自動 revert state
        showFeedback('error', result.error || '操作失敗，資料已還原');
      }
    } catch (err) {
      showFeedback('error', err.message || '網路錯誤，資料已還原');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ann) => {
    setEditTarget(ann);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await remove(id);
    if (result.success) showFeedback('success', '公告已刪除');
    else showFeedback('error', result.error || '刪除失敗');
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const result = await archive();
      showFeedback('success', `歸檔完成，共 ${result.archived ?? 0} 筆`);
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setArchiving(false);
    }
  };

  const displayList = tab === 'active'
    ? allAnnouncements.filter(a => a.status === 'active')
    : allAnnouncements;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50
                       flex flex-col"
            aria-label="管理後台"
          >
            {/* Header（固定不捲動） */}
            <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-school-navy text-white">
              <span className="text-lg font-bold flex-1">⚙️ 公告管理後台</span>
              <button
                onClick={() => { setShowForm(true); setEditTarget(null); }}
                className="bg-school-gold text-school-navy font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                + 新增公告
              </button>
              <button
                onClick={onClose}
                aria-label="關閉"
                className="ml-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 整個 body 區塊：一個捲動容器，包含表單 + 列表 */}
            <div className="flex-1 overflow-y-auto">

              {/* Feedback toast（黏在捲動區頂部） */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`sticky top-0 z-10 mx-4 mt-3 px-4 py-2.5 rounded-lg text-sm font-medium shadow
                      ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
                  >
                    {feedback.type === 'success' ? '✓ ' : '✕ '}{feedback.msg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 表單區（opacity 動畫，不用 overflow-hidden，按鈕永遠可捲到） */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-gray-200"
                  >
                    <div className="px-6 py-4 bg-blue-50/50">
                      <h2 className="text-base font-bold text-school-navy mb-3">
                        {editTarget ? '✏️ 編輯公告' : '➕ 新增公告'}
                      </h2>

                      {/* 大屏呈現注意事項 */}
                      <div className="mb-4 px-3.5 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                        <p className="font-semibold mb-1">💡 輸出公告後請檢查呈現狀態：</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>最多五行字體較大清晰，超過建議拆分內容為兩張卡片</li>
                          <li>若內容太多、字太小，學生會看不清楚</li>
                          <li>圖片可自成完整一頁輸出</li>
                          <li>公告最多 20 則，超過 20 則無法完整播放一輪</li>
                        </ul>
                      </div>

                      <AnnouncementForm
                        initial={editTarget}
                        onSubmit={handleSubmit}
                        onCancel={() => { setShowForm(false); setEditTarget(null); }}
                        submitting={submitting}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 公告列表 */}
              <div className="px-6 py-4">
                {/* Tab 切換 */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden flex-1">
                    {[
                      { key: 'active', label: '顯示中' },
                      { key: 'all',    label: '全部（含歷史）' },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors
                          ${tab === t.key ? 'bg-school-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* 手動歸檔按鈕 */}
                  <button
                    onClick={handleArchive}
                    disabled={archiving}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-gray-300
                               text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {archiving
                      ? <span className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                      : '🗂️'}
                    歸檔過期
                  </button>
                </div>

                <AnnouncementTable
                  announcements={displayList}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={tableLoading}
                />
              </div>

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
