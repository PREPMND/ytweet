function MenuDropdown({
  isOpen,
  darkMode,
  items,
  className = "",
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`
        font-[Saira] font-[500]
        absolute bottom-8 right-8
        z-40 w-[200px] md:min-w-[220px]
        overflow-hidden rounded-xl shadow-xl border
        ${
          darkMode
            ? "bg-neutral-900 border-neutral-700 text-white"
            : "bg-white border-neutral-200 text-black"
        }
        ${className}
      `}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={`
            w-full text-left px-4 py-3 text-sm transition-colors
            ${
              darkMode
                ? "hover:bg-neutral-800"
                : "hover:bg-neutral-100"
            }
          `}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}