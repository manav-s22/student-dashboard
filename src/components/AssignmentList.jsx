import { supabase } from '../lib/supabase'

function getUrgency(dueDate, status) {
  if (status === 'done') return 'done'
  if (!dueDate) return 'none'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'soon'
  return 'normal'
}

const URGENCY_STYLES = {
  overdue: 'border-red-500/50 bg-red-500/5',
  soon: 'border-amber-500/50 bg-amber-500/5',
  normal: 'border-white/10',
  none: 'border-white/10',
  done: 'border-white/10 opacity-50',
}

function AssignmentList({ assignments, courses, onUpdated }) {
  const toggleStatus = async (assignment) => {
    const newStatus = assignment.status === 'done' ? 'pending' : 'done'
    const { error } = await supabase
      .from('assignments')
      .update({ status: newStatus })
      .eq('id', assignment.id)
    if (!error) onUpdated()
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('assignments').delete().eq('id', id)
    if (!error) onUpdated()
  }

  const getCourse = (courseId) => courses.find((c) => c.id === courseId)

  if (assignments.length === 0) {
    return (
      <p className="text-neutral-400 text-center py-8">
        No assignments yet — add your first one above.
      </p>
    )
  }

  const sorted = [...assignments].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date) - new Date(b.due_date)
  })

  return (
    <div className="space-y-3">
      {sorted.map((a) => {
        const urgency = getUrgency(a.due_date, a.status)
        const course = getCourse(a.course_id)

        return (
          <div
            key={a.id}
            className={`flex items-center justify-between gap-4 bg-neutral-900/60 backdrop-blur-md border rounded-xl p-4 ${URGENCY_STYLES[urgency]}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                checked={a.status === 'done'}
                onChange={() => toggleStatus(a)}
                className="w-4 h-4 accent-indigo-500 shrink-0"
              />
              <div className="min-w-0">
                <p className={`text-white font-medium truncate ${a.status === 'done' ? 'line-through' : ''}`}>
                  {a.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                  {course && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: course.color }}
                      />
                      {course.name}
                    </span>
                  )}
                  {a.due_date && (
                    <span>
                      {urgency === 'overdue' ? 'Overdue — ' : 'Due '}
                      {new Date(a.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  <span className="capitalize">{a.priority} priority</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(a.id)}
              className="text-neutral-500 hover:text-red-400 text-sm shrink-0"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default AssignmentList