import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

const pageTitles = { '/': 'Tasks', '/list': 'List', '/form': 'New task' }

function AppLayout({ openTaskCount, children }) {
  const { pathname } = useLocation()
  const pageTitle = pageTitles[pathname] || 'Tasks'

  return (
    <div className="app-shell">
      <Sidebar openTaskCount={openTaskCount} />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>{pageTitle}</strong></div>
          <div className="topbar-right"><span className="today-label">MONDAY, OCTOBER 12</span><button className="icon-button" aria-label="Notifications">♧<i /></button></div>
        </header>
        {children}
        <footer className="footer"><span>One thing at a time.</span><span>DAYMARK <b>✳</b></span></footer>
      </main>
    </div>
  )
}

export default AppLayout
