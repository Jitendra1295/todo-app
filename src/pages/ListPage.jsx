import { useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import PageHeading from '../components/PageHeading.jsx'
import TaskRow from '../components/TaskRow.jsx'

function ListPage({ tasks, onToggle, onAdd }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const visible = tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()) && (category === 'All categories' || task.category === category))

  return (
    <section className="content">
      <PageHeading eyebrow="YOUR WORKSPACE" title="All tasks" description="Everything on your plate, all in one place." action={onAdd} />
      <div className="list-summary"><div><span className="summary-dot violet" /><strong>{tasks.filter((task) => !task.done).length}</strong><span>to do</span></div><div><span className="summary-dot green" /><strong>{tasks.filter((task) => task.done).length}</strong><span>completed</span></div><span className="summary-total">{tasks.length} tasks total</span></div>
      <div className="list-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option>All categories</option><option>Work</option><option>Personal</option></select></div>
      <div className="section-heading list-section-title"><div><span className="section-title">All tasks</span><span className="task-total">{visible.length}</span></div><span className="sort-label">SORTED BY DATE ↓</span></div>
      <div className="task-list">{visible.length ? visible.map((task) => <TaskRow key={task.id} task={task} onToggle={onToggle} />) : <EmptyState message="No tasks match your search." />}</div>
      <button className="add-inline" onClick={onAdd}><span>＋</span> Add a task</button>
    </section>
  )
}

export default ListPage
