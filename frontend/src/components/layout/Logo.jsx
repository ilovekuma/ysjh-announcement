/**
 * Logo.jsx — 左上角官方校徽
 * 圖片來源：新竹市立育賢國民中學 官方網站
 * 三連點偵測透過 onClick prop 傳入
 */
export default function Logo({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="育賢國中校徽"
      title="新竹市立育賢國民中學"
      className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-md
                 hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none
                 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white"
    >
      <img
        src={`${import.meta.env.BASE_URL}logo.jpg`}
        alt="新竹市立育賢國民中學校徽"
        className="w-full h-full object-cover"
        draggable="false"
      />
    </button>
  );
}
