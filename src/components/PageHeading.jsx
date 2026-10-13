function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      {action && <button className="primary-button" onClick={action}><span>＋</span> Add a task</button>}
    </div>
  )
}

export default PageHeading
