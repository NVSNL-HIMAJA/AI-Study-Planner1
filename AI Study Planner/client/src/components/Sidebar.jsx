function Sidebar({ currentPage, setCurrentPage }) {

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "subjects", label: "Subjects", icon: "▦" },
    { id: "planner", label: "Study Planner", icon: "◷" },
    { id: "priority", label: "Study Priority", icon: "✦" },
    { id: "analytics", label: "Analytics", icon: "⌁" },
    { id: "ai", label: "AI Assistant", icon: "✧" },
    { id: "settings", label: "Settings", icon: "⚙" }
  ];

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-mark">S</div>

        <div className="logo-text">
          <span>Study</span>
          <strong>AI</strong>
        </div>
      </div>

      <nav>

        <p className="nav-label">
          WORKSPACE
        </p>

        {navigation.map(item => (

          <button
            key={item.id}
            className={
              currentPage === item.id
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(item.id)
            }
          >

            <span className="nav-icon">
              {item.icon}
            </span>

            <span className="nav-text">
              {item.label}
            </span>

            {currentPage === item.id && (
              <span className="active-indicator" />
            )}

          </button>

        ))}

      </nav>

      <div className="sidebar-bottom">

        <div className="sidebar-status">
          <span className="status-dot" />

          <div>
            <strong>
              Study mode
            </strong>

            <span>
              Ready to focus
            </span>
          </div>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;