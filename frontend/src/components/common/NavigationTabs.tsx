export type ActiveTab = "dashboard" | "interview" | "progress" | "results" | "calendar";

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveSession: boolean;
  isSessionCompleted: boolean;
}

export function NavigationTabs({
  activeTab,
  onSelectTab,
  hasActiveSession,
  isSessionCompleted,
}: NavigationTabsProps) {
  const tabs: { id: ActiveTab; label: string; badge?: string; disabled?: boolean }[] = [
    { id: "dashboard", label: "Candidate Dashboard" },
    { id: "interview", label: "Interview Workspace", badge: hasActiveSession ? "Active" : undefined },
    { id: "progress", label: "Live Progress", disabled: !hasActiveSession },
    { id: "results", label: "Evaluation Results", badge: isSessionCompleted ? "Final" : undefined, disabled: !isSessionCompleted },
    { id: "calendar", label: "31-Day Test Calendar" },
  ];

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-app)",
        padding: "0 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          gap: "0.25rem",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onSelectTab(tab.id)}
              disabled={tab.disabled}
              style={{
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                color: isActive
                  ? "var(--text-primary)"
                  : tab.disabled
                  ? "var(--text-muted)"
                  : "var(--text-secondary)",
                padding: "0.85rem 1rem",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 500,
                cursor: tab.disabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
                opacity: tab.disabled ? 0.4 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
              {tab.badge && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "999px",
                    backgroundColor: isActive ? "var(--accent-glow)" : "var(--bg-element)",
                    color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
