/**
 * CarouselDots — 底部進度點
 */
export default function CarouselDots({ count, current, onDotClick }) {
  if (count <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-3" role="tablist" aria-label="公告進度">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`第 ${i + 1} 則公告`}
          onClick={() => onDotClick(i)}
          className={`rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-school-blue/50
            ${i === current
              ? 'w-6 h-2.5 bg-school-blue shadow-md'
              : 'w-2.5 h-2.5 bg-gray-300 hover:bg-school-light'
            }`}
        />
      ))}
    </div>
  );
}
