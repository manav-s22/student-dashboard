import { useState } from 'react'

function MonthCalendar({ classes, assignments, courses }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const getCourse = (courseId) => courses.find((c) => c.id === courseId)

  const getDayInfo = (day) => {
    if (!day) return null
    const date = new Date(year, month, day)
    const weekday = date.getDay()

    const classesToday = classes.filter((c) => c.day_of_week === weekday)
    const dueToday = assignments.filter((a) => {
      if (!a.due_date) return false
      const due = new Date(a.due_date)
      return (
        due.getFullYear() === year &&
        due.getMonth() === month &&
        due.getDate() === day
      )
    })

    return { classesToday, dueToday }
  }

  const today = new Date()
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="text-neutral-400 hover:text-white px-2"
        >
          ←
        </button>
        <h3 className="text-white font-semibold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="text-neutral-400 hover:text-white px-2"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs text-neutral-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const info = getDayInfo(day)
          return (
            <div
              key={i}
              className={`min-h-16 rounded-lg p-1 text-xs ${
                day ? 'bg-white/5' : ''
              } ${isToday(day) ? 'ring-1 ring-indigo-500' : ''}`}
            >
              {day && (
                <>
                  <p className="text-neutral-400 mb-1">{day}</p>
                  <div className="space-y-0.5">
                    {info.classesToday.slice(0, 2).map((c) => {
                      const course = getCourse(c.course_id)
                      return (
                        <div
                          key={c.id}
                          className="w-full h-1 rounded-full"
                          style={{ backgroundColor: course?.color || '#6366f1' }}
                          title={course?.name}
                        />
                      )
                    })}
                    {info.dueToday.map((a) => (
                      <div
                        key={a.id}
                        className="text-[10px] text-amber-400 truncate"
                        title={a.title}
                      >
                        {a.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MonthCalendar