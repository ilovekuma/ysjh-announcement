import { useSeason } from '../../hooks/useSeason';

// 四季像素小怪物 SVG（16×16 像素風格，放大 3x 顯示）
const MONSTERS = {
  spring: (
    // 春季：粉色兔子
    <svg viewBox="0 0 16 16" width="48" height="48" style={{ imageRendering: 'pixelated' }}>
      {/* 耳朵 */}
      <rect x="3" y="0" width="2" height="5" fill="#f9a8d4" />
      <rect x="11" y="0" width="2" height="5" fill="#f9a8d4" />
      <rect x="4" y="1" width="1" height="3" fill="#fb7185" />
      <rect x="11" y="1" width="1" height="3" fill="#fb7185" />
      {/* 頭 */}
      <rect x="2" y="4" width="12" height="8" fill="#fce7f3" />
      {/* 眼睛 */}
      <rect x="4" y="6" width="2" height="2" fill="#be185d" />
      <rect x="10" y="6" width="2" height="2" fill="#be185d" />
      {/* 鼻子 */}
      <rect x="7" y="8" width="2" height="1" fill="#f472b6" />
      {/* 嘴 */}
      <rect x="6" y="9" width="1" height="1" fill="#f472b6" />
      <rect x="9" y="9" width="1" height="1" fill="#f472b6" />
      {/* 身體 */}
      <rect x="3" y="12" width="10" height="3" fill="#fce7f3" />
      {/* 腳 */}
      <rect x="2" y="14" width="4" height="2" fill="#f9a8d4" />
      <rect x="10" y="14" width="4" height="2" fill="#f9a8d4" />
      {/* 花飾 */}
      <rect x="13" y="4" width="2" height="2" fill="#4ade80" />
      <rect x="14" y="3" width="2" height="2" fill="#86efac" />
    </svg>
  ),
  summer: (
    // 夏季：藍色青蛙
    <svg viewBox="0 0 16 16" width="48" height="48" style={{ imageRendering: 'pixelated' }}>
      {/* 眼睛凸起 */}
      <rect x="2" y="1" width="4" height="4" fill="#4ade80" />
      <rect x="10" y="1" width="4" height="4" fill="#4ade80" />
      <rect x="3" y="2" width="2" height="2" fill="#fff" />
      <rect x="11" y="2" width="2" height="2" fill="#fff" />
      <rect x="4" y="2" width="1" height="1" fill="#111" />
      <rect x="12" y="2" width="1" height="1" fill="#111" />
      {/* 頭/身 */}
      <rect x="1" y="4" width="14" height="9" fill="#4ade80" />
      {/* 嘴 */}
      <rect x="3" y="10" width="10" height="2" fill="#16a34a" />
      <rect x="4" y="11" width="8" height="1" fill="#fff" />
      {/* 肚子 */}
      <rect x="4" y="6" width="8" height="4" fill="#bbf7d0" />
      {/* 腳 */}
      <rect x="0" y="12" width="5" height="2" fill="#4ade80" />
      <rect x="11" y="12" width="5" height="2" fill="#4ade80" />
      <rect x="0" y="13" width="3" height="2" fill="#4ade80" />
      <rect x="13" y="13" width="3" height="2" fill="#4ade80" />
      {/* 太陽光點 */}
      <rect x="14" y="0" width="2" height="2" fill="#fbbf24" />
    </svg>
  ),
  autumn: (
    // 秋季：橘色狐狸
    <svg viewBox="0 0 16 16" width="48" height="48" style={{ imageRendering: 'pixelated' }}>
      {/* 耳朵 */}
      <rect x="1" y="0" width="4" height="5" fill="#ea580c" />
      <rect x="11" y="0" width="4" height="5" fill="#ea580c" />
      <rect x="2" y="1" width="2" height="3" fill="#fbbf24" />
      <rect x="12" y="1" width="2" height="3" fill="#fbbf24" />
      {/* 頭 */}
      <rect x="1" y="4" width="14" height="8" fill="#ea580c" />
      {/* 臉頰白 */}
      <rect x="2" y="7" width="4" height="4" fill="#fed7aa" />
      <rect x="10" y="7" width="4" height="4" fill="#fed7aa" />
      {/* 眼睛 */}
      <rect x="3" y="5" width="3" height="3" fill="#1c1917" />
      <rect x="4" y="5" width="1" height="1" fill="#fff" />
      <rect x="10" y="5" width="3" height="3" fill="#1c1917" />
      <rect x="11" y="5" width="1" height="1" fill="#fff" />
      {/* 鼻子 */}
      <rect x="7" y="8" width="2" height="2" fill="#1c1917" />
      {/* 身體 */}
      <rect x="2" y="12" width="12" height="3" fill="#ea580c" />
      {/* 尾巴尖白 */}
      <rect x="0" y="10" width="2" height="3" fill="#fbbf24" />
      {/* 楓葉裝飾 */}
      <rect x="13" y="11" width="3" height="3" fill="#dc2626" />
    </svg>
  ),
  winter: (
    // 冬季：白色雪人
    <svg viewBox="0 0 16 16" width="48" height="48" style={{ imageRendering: 'pixelated' }}>
      {/* 帽子 */}
      <rect x="4" y="0" width="8" height="2" fill="#1e3a5f" />
      <rect x="3" y="1" width="10" height="1" fill="#1e3a5f" />
      <rect x="5" y="2" width="6" height="3" fill="#1e3a5f" />
      <rect x="4" y="4" width="1" height="1" fill="#c9a227" />
      <rect x="11" y="4" width="1" height="1" fill="#c9a227" />
      {/* 頭 */}
      <rect x="3" y="4" width="10" height="8" fill="#f1f5f9" />
      {/* 眼睛 */}
      <rect x="5" y="6" width="2" height="2" fill="#1e293b" />
      <rect x="9" y="6" width="2" height="2" fill="#1e293b" />
      {/* 鼻子（胡蘿蔔） */}
      <rect x="7" y="8" width="3" height="1" fill="#f97316" />
      <rect x="8" y="9" width="1" height="1" fill="#f97316" />
      {/* 嘴（微笑） */}
      <rect x="5" y="10" width="2" height="1" fill="#64748b" />
      <rect x="9" y="10" width="2" height="1" fill="#64748b" />
      <rect x="7" y="11" width="2" height="1" fill="#64748b" />
      {/* 身體 */}
      <rect x="2" y="12" width="12" height="4" fill="#e2e8f0" />
      {/* 鈕扣 */}
      <rect x="7" y="13" width="2" height="1" fill="#1e3a5f" />
      <rect x="7" y="15" width="2" height="1" fill="#1e3a5f" />
      {/* 雪花 */}
      <rect x="0" y="2" width="1" height="1" fill="#93c5fd" />
      <rect x="15" y="5" width="1" height="1" fill="#93c5fd" />
      <rect x="1" y="8" width="1" height="1" fill="#bfdbfe" />
    </svg>
  ),
};

/**
 * PixelMonster — 頂部橫向移動的季節像素小怪物
 */
export default function PixelMonster() {
  const { season } = useSeason();

  return (
    <div className="pixel-track h-14 bg-gradient-to-r from-school-navy/5 to-school-blue/5 relative border-b border-school-blue/10">
      {/* 主怪物：從左往右（translateY 合入 @keyframes，避免 translate class 互相覆蓋） */}
      <div
        className="absolute top-1/2"
        style={{ animation: 'walkRight 16s linear infinite' }}
      >
        {MONSTERS[season]}
      </div>

      {/* 副怪物：延遲出發，製造連續感 */}
      <div
        className="absolute top-1/2 opacity-60"
        style={{ animation: 'walkRight 16s linear infinite', animationDelay: '8s' }}
      >
        {MONSTERS[season]}
      </div>

      {/* 季節標籤 */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-school-navy/40 font-medium select-none">
        {season === 'spring' && '🌸 春'}
        {season === 'summer' && '☀️ 夏'}
        {season === 'autumn' && '🍂 秋'}
        {season === 'winter' && '❄️ 冬'}
      </div>
    </div>
  );
}
