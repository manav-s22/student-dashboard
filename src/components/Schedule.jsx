import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ClassForm from './ClassForm'
import TimetableGrid from './TimetableGrid'
import MonthCalendar from './MonthCalendar'

function Schedule() {
  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [subView, setSubView] = useState('timetable')

  const fetchData = async () => {
    setLoading(true)

    const [classesRes, coursesRes, assignmentsRes] = await Promise.all([
      supabase.from('class_schedule').select('*'),
      supabase.from('courses').select('*'),
      supabase.from('assignments').select('*'),
    ])

    if (!classesRes.error) setClasses(classesRes.data)
    if (!coursesRes.error) setCourses(coursesRes.data)
    if (!assignmentsRes.error) setAssignments(assignmentsRes.data)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Schedule</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSubView('timetable')}
            className={`px-3 py-1 rounded-lg text-sm ${
              subView === 'timetable' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-neutral-400'
            }`}
          >
            Timetable
          </button>
          <button
            onClick={() => setSubView('calendar')}
            className={`px-3 py-1 rounded-lg text-sm ${
              subView === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-neutral-400'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-neutral-400">Loading schedule...</p>
      ) : subView === 'timetable' ? (
        <>
          <ClassForm courses={courses} onAdded={fetchData} />
          <TimetableGrid classes={classes} courses={courses} onDeleted={fetchData} />
        </>
      ) : (
        <MonthCalendar classes={classes} assignments={assignments} courses={courses} />
      )}
    </div>
  )
}

export default Schedule