import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import * as api from '../../services/api';

const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean'],
];

const LINE_HEIGHTS = [
  { label: '1.0', value: '1' },
  { label: '1.5', value: '1.5' },
  { label: '1.8', value: '1.8' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3' },
];

const DEFAULT_LINE_HEIGHT = '1.8';
const MAX_SIZE_MB    = 3;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/** File → base64 字串（不含 data:... 前綴） */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 將 HTML 內容包上行高 wrapper（供卡片讀取） */
function wrapContent(html, lh) {
  return `<div data-lh="${lh}" style="line-height:${lh}">${html}</div>`;
}

/** 解析存入的 HTML，取出行高與實際內容 */
function parseContent(html) {
  const m = (html || '').match(/^<div data-lh="([^"]*)"[^>]*>([\s\S]*)<\/div>$/);
  if (m) return { lineHeight: m[1], innerHtml: m[2] };
  return { lineHeight: DEFAULT_LINE_HEIGHT, innerHtml: html || '' };
}

/**
 * RichTextEditor — Quill v2 封裝
 * - 行高儲存在 wrapper div，卡片顯示時自動套用
 * - 圖片上傳至 Google Drive（非 Base64）
 */
export default function RichTextEditor({ value, onChange }) {
  const containerRef    = useRef(null);
  const quillRef        = useRef(null);
  const onChangeRef     = useRef(onChange);
  const lineHeightRef   = useRef(DEFAULT_LINE_HEIGHT);
  const [lineHeight, setLineHeightState] = useState(DEFAULT_LINE_HEIGHT);
  const [uploading, setUploading]        = useState(false);
  const setUploadingRef = useRef(setUploading);

  useEffect(() => { onChangeRef.current     = onChange;    });
  useEffect(() => { setUploadingRef.current = setUploading; });

  /** 設定行高：同步更新 state、ref、DOM 樣式，並重新 emit 內容 */
  const setLineHeight = (lh) => {
    lineHeightRef.current = lh;
    setLineHeightState(lh);
    const el = containerRef.current?.querySelector('.ql-editor');
    if (el) el.style.lineHeight = lh;
    if (quillRef.current) {
      onChangeRef.current?.(wrapContent(quillRef.current.root.innerHTML, lh));
    }
  };

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const container = containerRef.current;

    const quill = new Quill(container, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder: '請輸入公告內容…（支援粗體、顏色、圖片、Emoji）',
    });

    quillRef.current = quill;

    // 載入初始值，還原行高
    const { lineHeight: storedLh, innerHtml } = parseContent(value);
    lineHeightRef.current = storedLh;
    setLineHeightState(storedLh);
    quill.root.style.lineHeight = storedLh;
    if (innerHtml) quill.clipboard.dangerouslyPasteHTML(innerHtml);

    // 內容變更時 emit wrapped HTML
    quill.on('text-change', () => {
      onChangeRef.current?.(wrapContent(quill.root.innerHTML, lineHeightRef.current));
    });

    // 自訂圖片上傳 handler
    quill.getModule('toolbar').addHandler('image', () => {
      const input = document.createElement('input');
      input.type   = 'file';
      input.accept = 'image/jpeg,image/png,image/gif,image/webp';

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > MAX_SIZE_BYTES) {
          alert(`圖片大小不可超過 ${MAX_SIZE_MB}MB`);
          return;
        }
        setUploadingRef.current(true);
        const range = quill.getSelection() ?? { index: quill.getLength() };
        try {
          const base64 = await fileToBase64(file);
          const result = await api.uploadImage(base64, file.type, file.name);
          if (!result.success) throw new Error(result.error || '上傳失敗');
          quill.insertEmbed(range.index, 'image', result.url);
          quill.setSelection(range.index + 1);
        } catch (err) {
          alert('圖片上傳失敗：' + err.message);
        } finally {
          setUploadingRef.current(false);
        }
      };
      input.click();
    });

    return () => {
      quill.off('text-change');
      quillRef.current = null;
      const toolbar = container.previousElementSibling;
      if (toolbar?.classList.contains('ql-toolbar')) toolbar.remove();
      container.innerHTML = '';
      container.className = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 切換編輯目標時，還原行高與內容
  useEffect(() => {
    if (!quillRef.current) return;
    const { lineHeight: storedLh, innerHtml } = parseContent(value);

    if (storedLh !== lineHeightRef.current) {
      lineHeightRef.current = storedLh;
      setLineHeightState(storedLh);
      const el = containerRef.current?.querySelector('.ql-editor');
      if (el) el.style.lineHeight = storedLh;
    }
    if (quillRef.current.root.innerHTML !== innerHtml) {
      quillRef.current.clipboard.dangerouslyPasteHTML(innerHtml || '');
    }
  }, [value]);

  return (
    <div className="relative">
      {/* 行高選擇器 + Emoji 連結 */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-500">行高</span>
        <div className="flex gap-1">
          {LINE_HEIGHTS.map(({ label, value: lh }) => (
            <button
              key={lh}
              type="button"
              onClick={() => setLineHeight(lh)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors
                ${lineHeight === lh
                  ? 'bg-school-blue text-white border-school-blue'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-school-blue hover:text-school-blue'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        <a
          href="https://getemoji.com"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 flex items-center gap-1 text-xs px-2 py-0.5 rounded border
                     border-gray-300 text-gray-600 bg-white hover:border-school-blue
                     hover:text-school-blue transition-colors"
          title="前往 Emoji 查詢頁面"
        >
          😊 Emoji
        </a>
      </div>

      <div className="quill-wrapper rounded-lg overflow-hidden border border-school-blue/30">
        <div ref={containerRef} />
      </div>

      {/* 上傳中遮罩 */}
      {uploading && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex flex-col items-center justify-center gap-2 z-10">
          <div className="w-6 h-6 border-2 border-school-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-school-navy font-medium">圖片上傳中…</p>
        </div>
      )}
    </div>
  );
}
