import { Link, NavLink } from 'react-router-dom'

function Sidebar({ openTaskCount }) {
  return (
    <aside className="sidebar">
      <Link className="brand" to="/" aria-label="Daymark home">
        <span className="brand-mark">d</span>
        <span>daymark<span className="brand-period">.</span></span>
      </Link>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="navigation" aria-label="Main navigation">
        <NavItem to="/" end icon="◷" label="My tasks" count={openTaskCount} />
        <NavItem to="/list" icon="▤" label="All tasks" />
        <NavItem to="/form" icon="＋" label="New task" />
        <NavItem to="/ai" icon="✦" label="AI Creator" badge="AI" />
      </nav>
      <div className="sidebar-bottom">
        <div className="avatar">JP</div>
        <div>
          <strong>Jitendra Patel</strong>
          <span>Personal space</span>
        </div>
        <span className="more">···</span>
      </div>
    </aside>
  )
}

function NavItem({ to, end, icon, label, count, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
      {badge && <span className="nav-ai-badge">{badge}</span>}
      {count > 0 && <span className="nav-count">{count}</span>}
    </NavLink>
  )
}

export default Sidebar
