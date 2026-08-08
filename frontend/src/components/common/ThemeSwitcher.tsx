import { useTheme, type Theme } from "../../context/ThemeContext.js";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; label: string; icon: string }[] = [
    { id: "light", label: "Light", icon: "☀" },
    { id: "dark", label: "Dark", icon: "🌙" },
    { id: "night", label: "Night", icon: "🌌" },
  ];

  return (
    <div
      aria-label="Theme selector"
      role="radiogroup"
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "var(--bg-element)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-full)",
        padding: "2px",
        gap: "2px",
      }}
    >
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${t.label} theme`}
            onClick={() => setTheme(t.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.25rem 0.65rem",
              fontSize: "0.75rem",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              backgroundColor: isActive ? "var(--bg-surface-hover)" : "transparent",
              border: "none",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.2)" : "none",
              outline: "none",
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
