import { useEffect, useRef } from 'react';
import Quill from 'quill';

const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean'],
];

/**
 * RichTextEditor — Quill v2 封裝
 * 直接使用 quill 套件（不用 react-quill，避免 React 18 StrictMode 問題）
 *
 * @param {string}   value    - 初始 HTML 值
 * @param {function} onChange - 內容變更時回呼 (html: string)
 */
export default function RichTextEditor({ value, onChange }) {
  const containerRef = useRef(null);
  const quillRef     = useRef(null);
  const onChangeRef  = useRef(onChange);

  // 保持 onChange ref 最新（避免閉包舊值）
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const container = containerRef.current;

    // 建立 Quill 實例
    const quill = new Quill(container, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder: '請輸入公告內容…（支援粗體、顏色、圖片、Emoji）',
    });

    quillRef.current = quill;

    // 設定初始內容
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    // 監聽內容變更（用 root.innerHTML，比 getSemanticHTML 更可靠）
    quill.on('text-change', () => {
      onChangeRef.current?.(quill.root.innerHTML);
    });

    return () => {
      quill.off('text-change');
      quillRef.current = null;
      // Quill Snow 將 .ql-toolbar 插入為 container 的前一個 sibling，
      // innerHTML 清不到它，必須手動移除，否則 StrictMode 二次 mount 會出現雙工具列
      const toolbar = container.previousElementSibling;
      if (toolbar?.classList.contains('ql-toolbar')) {
        toolbar.remove();
      }
      container.innerHTML = '';
      container.className = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 外部 value 重置（切換編輯目標時）
  useEffect(() => {
    if (!quillRef.current) return;
    if (quillRef.current.root.innerHTML !== value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
    }
  }, [value]);

  return (
    <div className="quill-wrapper rounded-lg overflow-hidden border border-school-blue/30">
      <div ref={containerRef} />
    </div>
  );
}
