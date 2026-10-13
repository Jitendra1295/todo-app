function TaskRow({ task, onToggle }) {
  return (
    <article className={`task-row${task.done ? ' completed' : ''}`}>
      <button className="checkbox" onClick={() => onToggle(task.id)} aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}>{task.done && '✓'}</button>
      <div className="task-details"><span className="task-title">{task.title}</span><span className="task-category">{task.category}</span></div>
      <span className={`tag ${task.category.toLowerCase()}`}>{task.category}</span>
      <span className="task-due"><span className="calendar-icon">▦</span>{task.due}</span>
      <button className="row-more" aria-label={`More options for ${task.title}`}>···</button>
    </article>
  )
}

export default TaskRow
