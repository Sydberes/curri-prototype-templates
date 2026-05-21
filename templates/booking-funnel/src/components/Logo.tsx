/* ──────────────────────────────────────────────────────────────────
 * Logo
 *
 * Brand mark + wordmark for the design system shell. Replace the SVG
 * content (or remove the mark entirely and keep just the wordmark)
 * for your product.
 *
 * Brand copy is centralized in src/App.tsx → PRODUCT_NAME so swapping
 * names doesn't require touching this file.
 * ──────────────────────────────────────────────────────────────── */

export function Logo({
  size = 20,
  showMark = true,
  productName,
}: {
  size?: number
  showMark?: boolean
  productName: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      {showMark && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          className="text-[var(--color-icon-primary)]"
        >
          {/* Replace with the product mark. This neutral square is a placeholder. */}
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )}
      <span
        className="text-[16px] text-[var(--color-text-primary)] tracking-tight"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}
      >
        {productName}
      </span>
    </div>
  )
}
