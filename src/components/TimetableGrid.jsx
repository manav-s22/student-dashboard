import { supabase } from '../lib/supabase'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DAY_INDEX = [1, 2, 3, 4, 5]

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${period}`
}

function TimetableGrid({ classes, courses, onDeleted }) {
  const getCourse = (courseId) => courses.find((c) => c.id === courseId)

  const handleDelete = async (id) => {
    const { error } = await supabase.from('class_schedule').delete().eq('id', id)
    if (!error) onDeleted()
  }

  if (classes.length === 0) {
    return (
      <p className="text-neutral-400 text-center py-8">
        No classes scheduled yet — add one above.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {DAY_INDEX.map((dayIdx, col) => {
        const dayClasses = classes
          .filter((c) => c.day_of_week === dayIdx)
          .sort((a, b) => a.start_time.localeCompare(b.start_time))

        return (
          <div key={dayIdx} className="min-w-0">
            <h4 className="text-neutral-400 text-xs font-semibold uppercase mb-2 text-center">
              {DAYS[col]}
            </h4>
            <div className="space-y-2">
              {dayClasses.length === 0 && (
                <div className="h-16 rounded-lg border border-dashed border-white/10" />
              )}
              {dayClasses.map((c) => {
                const course = getCourse(c.course_id)
                return (
                  <div
                    key={c.id}
                    className="rounded-lg p-2 text-xs relative group"
                    style={{
                      backgroundColor: `${course?.color || '#6366f1'}20`,
                      borderLeft: `3px solid ${course?.color || '#6366f1'}`,
                    }}
                  >
                    <p className="text-white font-medium truncate">
                      {course?.name || 'Unknown'}
                    </p>
                    <p className="text-neutral-400">
                      {formatTime(c.start_time)} – {formatTime(c.end_time)}
                    </p>
                    {c.location && (
                      <p className="text-neutral-500">{c.location}</p>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="absolute top-1 right-1 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TimetableGrid