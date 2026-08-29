import { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import { todayISO, toLocalDateString } from '../../utils/dateUtils';

/** 從已儲存的 HTML 取出行高值（與 RichTextEditor wrapContent 格式對應） */
function extractLH(html) {
  const m = (html || '').match(/^<div data-lh="([^"]*)"[^>]*>/);
  return m ? m[1] : '1.8';
}

/** 用明確的行高重新包裝內容，確保卡片可讀取到正確值 */
function applyLH(html, lh) {
  // 若 html 已有 wrapper，先去掉再重包；若無則直接包
  const inner = (html || '').replace(/^<div data-lh="[^"]*"[^>]*>([\s\S]*)<\/div>$/, '$1');
  const innerHtml = inner !== html ? inner : (html || '');
  return `<div data-lh="${lh}" style="line-height:${lh}">${innerHtml}</div>`;
}

const DEPARTMENTS = [
  { name: '教務處', color: '#2D5DA6' },
  { name: '學務處', color: '#16a34a' },
  { name: '總務處', color: '#C9A227' },
  { name: '輔導室', color: '#7c3aed' },
  { name: '體育組', color: '#dc2626' },
  { name: '圖書館', color: '#0891b2' },
  { name: '校長室', color: '#ea580c' },
  { name: '其他',   color: '#be185d' },
];

const DEFAULT_COLORS = DEPARTMENTS.map(d => d.color);

const EMPTY_FORM = {
  department:  '',
  label_color: '#2D5DA6',
  content:     '',
  start_date:  todayISO(),
  end_date:    todayISO(),
};

/**
 * AnnouncementForm — 新增 / 編輯公告表單
 */
export default function AnnouncementForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [lineHeight, setLineHeight] = useState('1.8');

  // 載入編輯目標
  useEffect(() => {
    if (initial) {
      setForm({
        department:  initial.department  || '',
        label_color: initial.label_color || '#2D5DA6',
        content:     initial.content     || '',
        start_date:  toLocalDateString(initial.start_date) || todayISO(),
        end_date:    toLocalDateString(initial.end_date),
      });
      setLineHeight(extractLH(initial.content));
    } else {
      setForm(EMPTY_FORM);
      setLineHeight('1.8');
    }
  }, [initial]);

  const set = (key) => (e) => setForm(f => {
    const updated = { ...f, [key]: e.target.value };
    if (key === 'start_date' && updated.end_date < updated.start_date) {
      updated.end_date = updated.start_date;
    }
    return updated;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.department) { alert('請選擇發布單位'); return; }
    if (!form.end_date)   { alert('請填寫截止日期'); return; }
    // 有文字或有圖片皆視為有效內容
    const textOnly = (form.content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, '');
    const hasImg   = /<img/i.test(form.content || '');
    if (!hasImg && textOnly.length === 0) { alert('請填寫公告內容或上傳圖片'); return; }
    // 移除空行後再包裝行高
    const cleaned = (form.content || '').replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
    onSubmit({ ...form, content: applyLH(cleaned, lineHeight) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 發布單位 */}
      <div>
        <label className="block text-sm font-semibold text-school-navy mb-1">發布單位 *</label>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map(({ name, color }) => (
            <button
              key={name}
              type="button"
              onClick={() => setForm(f => ({ ...f, department: name, label_color: color }))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${form.department === name
                  ? 'text-white border-transparent'
                  : 'bg-white text-school-navy border-gray-300 hover:border-school-blue'}`}
              style={form.department === name ? { backgroundColor: color, borderColor: color } : {}}
            >
              {name}
            </button>
          ))}
        </div>
        {/* 自訂輸入 */}
        <input
          type="text"
          value={form.department}
          onChange={set('department')}
          placeholder="或直接輸入單位名稱"
          className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-school-blue"
        />
      </div>

      {/* 標籤顏色 */}
      <div>
        <label className="block text-sm font-semibold text-school-navy mb-1">標籤顏色</label>
        <div className="flex items-center gap-2 flex-wrap">
          {DEFAULT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setForm(f => ({ ...f, label_color: c }))}
              className={`w-8 h-8 rounded-full border-2 transition-transform
                ${form.label_color === c ? 'border-gray-800 scale-125' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c }}
              aria-label={`選擇顏色 ${c}`}
            />
          ))}
          <input
            type="color"
            value={form.label_color}
            onChange={set('label_color')}
            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
            title="自訂顏色"
          />
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-bold"
            style={{ backgroundColor: form.label_color }}
          >
            {form.department || '預覽'}
          </span>
        </div>
      </div>

      {/* 日期區間 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-school-navy mb-1">起始日期 *</label>
          <input
            type="date"
            value={form.start_date}
            onChange={set('start_date')}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-school-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-school-navy mb-1">截止日期 *</label>
          <input
            type="date"
            value={form.end_date}
            onChange={set('end_date')}
            min={form.start_date}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-school-blue"
          />
        </div>
      </div>

      {/* 內容編輯器 */}
      <div>
        <label className="block text-sm font-semibold text-school-navy mb-1">公告內容 *</label>
        <RichTextEditor
          value={form.content}
          onChange={(html) => setForm(f => ({ ...f, content: html }))}
          onLineHeightChange={setLineHeight}
        />
      </div>

      {/* 按鈕列 */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600
                     hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-lg bg-school-blue text-white
                     hover:bg-school-navy text-sm font-semibold transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {initial ? '儲存變更' : '新增公告'}
        </button>
      </div>
    </form>
  );
}
