import { useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import PageHeading from '../components/PageHeading.jsx'
import TaskRow from '../components/TaskRow.jsx'

function TasksPage({ tasks, onToggle, onAdd }) {
  const [filter, setFilter] = useState('All')
  const visible = tasks.filter((task) => filter === 'All' || (filter === 'To do' ? !task.done : task.done))
  const complete = tasks.filter((task) => task.done).length

  return (
    <section className="content">
      <PageHeading eyebrow="MONDAY, OCTOBER 12, 2026" title="A little progress, every day." description="Make space for what matters. You’ve got this." action={onAdd} />
      <div className="progress-card"><div className="progress-copy"><div className="progress-icon">✳</div><div><strong>{complete === tasks.length ? 'Everything is done!' : 'You’re making great progress'}</strong><span>{complete} of {tasks.length} tasks completed today</span></div></div><div className="progress-track"><span style={{ width: `${tasks.length ? (complete / tasks.length) * 100 : 0}%` }} /></div><span className="progress-percent">{tasks.length ? Math.round((complete / tasks.length) * 100) : 0}%</span></div>
      <div className="section-heading"><div><span className="section-title">Your tasks</span><span className="task-total">{tasks.length}</span></div><div className="filters">{['All', 'To do', 'Done'].map((name) => <button key={name} onClick={() => setFilter(name)} className={filter === name ? 'selected' : ''}>{name}</button>)}</div></div>
      <div className="task-list">{visible.length ? visible.map((task) => <TaskRow key={task.id} task={task} onToggle={onToggle} />) : <EmptyState message={filter === 'Done' ? 'No completed tasks yet.' : 'You’re all caught up. Add a task to get started.'} />}</div>
      <button className="add-inline" onClick={onAdd}><span>＋</span> Add another task</button>
      <div className="quote-card"><span className="quote-mark">“</span><p>Small steps every day add up to big change.</p><span className="quote-credit">— JAMES CLEAR</span><span className="quote-spark">✳</span></div>
    </section>
  )
}

export default TasksPage
