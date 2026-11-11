import { useEffect, useRef } from "react";

export function MenuDropdown({
  isOpen,
  darkMode,
  items,
  onClose,
  className = "",
}) {
  const ref = useRef(null);

  // Close on an outside click or Escape. Without this the menu stayed open
  // until you clicked the same "..." button again, and opening a second menu
  // left the first one hanging behind it.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    // `capture` so we win the race against the trigger button's own onClick.
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      role="menu"
      className={`
        font-[Saira] font-[500]
        absolute bottom-8 right-8
        z-40 w-[200px] sm:w-[190px] md:min-w-[220px]
        overflow-hidden rounded-xl shadow-xl border
        ${
          darkMode
            ? "bg-neutral-900 border-neutral-700 text-white"
            : "bg-white border-neutral-200 text-black"
        }
        ${className}
      `}
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <button
            key={index}
            role="menuitem"
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick?.();
              onClose?.();
            }}
            className={`
              flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors
              disabled:cursor-not-allowed disabled:opacity-40
              ${item.danger ? "text-red-400" : ""}
              ${darkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}
            `}
          >
            {Icon && <Icon size={16} className="shrink-0 opacity-80" />}
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
