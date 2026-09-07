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

/**
 * 卡片內容字數上限（全形字，去除 HTML 標籤後計算）。
 * 原先依理論版面尺寸估算為 180 字，經實機測試後改為 110 字（現場實測值優先於估算值）。
 */
const MAX_CONTENT_CHARS = 110;

/**
 * 卡片內容行數上限。即使總字數沒超過，若使用者手動分段（Enter 換行）造成
 * 行數過多，卡片高度固定的情況下一樣會被壓縮或裁切，因此另外用實際渲染
 * 行數把關，而非只看字數。
 */
const MAX_CONTENT_LINES = 6;

/** 供行數量測用的隱藏容器寬度，對應卡片內文實際可用寬度（86 吋 4K、2×2 版面下的估算值） */
const CARD_CONTENT_WIDTH = 1874;

/** 取出去除 HTML 標籤後的純文字長度，用於字數上限判斷 */
function getPlainTextLength(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, '').length;
}

/**
 * 將內容渲染進隱藏容器（套用與卡片相同的 .announcement-content 樣式），
 * 依每個文字區塊實際高度 / 行高計算出渲染後的總行數，藉此抓出「字不多但
 * 換行太多」的情況。含圖片的區塊不計入行數。
 */
function countRenderedLines(html) {
  if (typeof document === 'undefined' || !html) return 0;

  const container = document.createElement('div');
  container.className = 'announcement-content';
  container.style.cssText =
    `position:fixed; left:-9999px; top:0; width:${CARD_CONTENT_WIDTH}px; visibility:hidden; pointer-events:none;`;
  container.innerHTML = html;
  document.body.appendChild(container);

  let lines = 0;
  container.querySelectorAll('h1, h2, h3, p, li').forEach((block) => {
    if (block.querySelector('img')) return;
    const text = block.textContent.replace(/\s+/g, '');
    if (!text) return;
    const fontSize = parseFloat(getComputedStyle(block).fontSize) || 32;
    const lineHeightPx = fontSize * 1.3; // 對應 index.css .announcement-content 內文 line-height: 1.3
    const height = block.getBoundingClientRect().height;
    lines += Math.max(1, Math.round(height / lineHeightPx));
  });

  document.body.removeChild(container);
  return lines;
}

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
  const [lineCount, setLineCount] = useState(0);

  const contentLength = getPlainTextLength(form.content);
  const overChars = contentLength > MAX_CONTENT_CHARS;
  const overLines = lineCount > MAX_CONTENT_LINES;
  const overLimit = overChars || overLines;

  // 內容變更時重新量測渲染行數
  useEffect(() => {
    setLineCount(countRenderedLines(form.content));
  }, [form.content]);

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
    if (overChars) { alert('字數超過卡片上限，請改編輯 16:9 圖片送出上傳，可完整一頁呈現'); return; }
    if (overLines) { alert('內容超過 6 行，卡片高度顯示不下，請精簡文字或改編輯 16:9 圖片送出上傳，可完整一頁呈現'); return; }
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
        <div className="mt-1 flex items-center justify-end gap-3 text-xs">
          <span className={overChars ? 'text-red-600 font-semibold' : 'text-gray-400'}>
            {contentLength} / {MAX_CONTENT_CHARS} 字
          </span>
          <span className={overLines ? 'text-red-600 font-semibold' : 'text-gray-400'}>
            {lineCount} / {MAX_CONTENT_LINES} 行
          </span>
        </div>
        {overChars && (
          <p className="mt-1 text-xs text-red-600">
            字數超過卡片上限，請改編輯 16:9 圖片送出上傳，可完整一頁呈現
          </p>
        )}
        {overLines && (
          <p className="mt-1 text-xs text-red-600">
            內容超過 6 行，卡片高度顯示不下，請精簡文字或改編輯 16:9 圖片送出上傳，可完整一頁呈現
          </p>
        )}
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
          disabled={submitting || overLimit}
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
