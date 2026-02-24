import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const GAS_URL = import.meta.env.VITE_GAS_URL;

export function useAnnouncements() {
  const [announcements,    setAnnouncements]    = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const useMock = !GAS_URL || GAS_URL.includes('YOUR_DEPLOYMENT_ID');

  // ── 讀取 ────────────────────────────────────────────────────────

  const fetchActive = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (useMock) {
        setAnnouncements(api.MOCK_ANNOUNCEMENTS);
      } else {
        const data = await api.getActive();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
      setAnnouncements(api.MOCK_ANNOUNCEMENTS);
    } finally {
      setLoading(false);
    }
  }, [useMock]);

  const fetchAll = useCallback(async () => {
    try {
      if (useMock) { setAllAnnouncements(api.MOCK_ANNOUNCEMENTS); return; }
      const data = await api.getAll();
      setAllAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }, [useMock]);

  useEffect(() => { fetchActive(); }, [fetchActive]);

  // 每 5 分鐘靜默重新 fetch（不顯示 loading），確保過期公告自動撤下、新公告自動出現
  useEffect(() => {
    if (useMock) return;
    const id = setInterval(async () => {
      try {
        const data = await api.getActive();
        if (Array.isArray(data)) setAnnouncements(data);
      } catch {
        // 背景刷新失敗不影響現有顯示
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [useMock]);

  // ── 寫入（Optimistic UI）────────────────────────────────────────
  //
  // 流程：
  //   1. 立即更新本地 state（UI 瞬間響應）
  //   2. 背景呼叫 GAS API（只有 1 次，不再二次 fetchActive/fetchAll）
  //   3. 成功：補上伺服器產生的真實 ID
  //   4. 失敗：revert 本地 state，回傳錯誤讓 UI 顯示

  const create = useCallback(async (data) => {
    if (useMock) {
      const item = { ...data, id: 'mock-' + Date.now(), status: 'active', created_at: new Date().toISOString() };
      setAnnouncements(p => [item, ...p]);
      setAllAnnouncements(p => [item, ...p]);
      return { success: true };
    }

    // Optimistic：暫用本地 ID
    const tempId = '_opt_' + Date.now();
    const optimistic = { ...data, id: tempId, status: 'active', created_at: new Date().toISOString() };
    setAnnouncements(p => [optimistic, ...p]);
    setAllAnnouncements(p => [optimistic, ...p]);

    try {
      const result = await api.createAnnouncement(data);
      if (result.success) {
        // 用伺服器回傳的真實 ID 取代暫時 ID
        const realId = result.id || tempId;
        const swap = a => a.id === tempId ? { ...optimistic, id: realId } : a;
        setAnnouncements(p => p.map(swap));
        setAllAnnouncements(p => p.map(swap));
      } else {
        // Revert
        setAnnouncements(p => p.filter(a => a.id !== tempId));
        setAllAnnouncements(p => p.filter(a => a.id !== tempId));
      }
      return result;
    } catch (err) {
      setAnnouncements(p => p.filter(a => a.id !== tempId));
      setAllAnnouncements(p => p.filter(a => a.id !== tempId));
      throw err;
    }
  }, [useMock]);

  const update = useCallback(async (id, data) => {
    if (useMock) {
      const merge = a => a.id === id ? { ...a, ...data } : a;
      setAnnouncements(p => p.map(merge));
      setAllAnnouncements(p => p.map(merge));
      return { success: true };
    }

    // 儲存舊 state 供 revert
    let snapAnn, snapAll;
    setAnnouncements(p  => { snapAnn = p;  return p.map(a => a.id === id ? { ...a, ...data } : a); });
    setAllAnnouncements(p => { snapAll = p; return p.map(a => a.id === id ? { ...a, ...data } : a); });

    try {
      const result = await api.updateAnnouncement(id, data);
      if (!result.success) {
        setAnnouncements(snapAnn);
        setAllAnnouncements(snapAll);
      }
      return result;
    } catch (err) {
      setAnnouncements(snapAnn);
      setAllAnnouncements(snapAll);
      throw err;
    }
  }, [useMock]);

  const remove = useCallback(async (id) => {
    if (useMock) {
      setAnnouncements(p => p.filter(a => a.id !== id));
      setAllAnnouncements(p => p.filter(a => a.id !== id));
      return { success: true };
    }

    let snapAnn, snapAll;
    setAnnouncements(p  => { snapAnn = p;  return p.filter(a => a.id !== id); });
    setAllAnnouncements(p => { snapAll = p; return p.filter(a => a.id !== id); });

    try {
      const result = await api.deleteAnnouncement(id);
      if (!result.success) {
        setAnnouncements(snapAnn);
        setAllAnnouncements(snapAll);
      }
      return result;
    } catch (err) {
      setAnnouncements(snapAnn);
      setAllAnnouncements(snapAll);
      throw err;
    }
  }, [useMock]);

  const archive = useCallback(async () => {
    if (useMock) return { archived: 0 };
    const result = await api.triggerArchive();
    // 歸檔後只需更新 allAnnouncements，不需重新 fetch 整包
    if (result.archived > 0) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const expire = a => {
        const end = new Date(a.end_date); end.setHours(23, 59, 59, 999);
        return a.status === 'active' && today > end ? { ...a, status: 'expired' } : a;
      };
      setAnnouncements(p => p.filter(a => expire(a).status === 'active'));
      setAllAnnouncements(p => p.map(expire));
    }
    return result;
  }, [useMock]);

  return {
    announcements, allAnnouncements,
    loading, error, useMock,
    fetchActive, fetchAll,
    create, update, remove, archive,
  };
}
