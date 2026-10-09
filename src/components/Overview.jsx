import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function percentToGPA(percent) {
  if (percent >= 93) return 4.0
  if (percent >= 90) return 3.7
  if (percent >= 87) return 3.3
  if (percent >= 83) return 3.0
  if (percent >= 80) return 2.7
  if (percent >= 77) return 2.3
  if (percent >= 73) return 2.0
  if (percent >= 70) return 1.7
  if (percent >= 67) return 1.3
  if (percent >= 63) return 1.0
  if (percent >= 60) return 0.7
  return 0.0
}

function Overview({ onNavigate }) {
  const [displayName, setDisplayName] = useState('')
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [assessments, setAssessments] = useState([])
  const [classes, setClasses] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()

      const [
        profileRes,
        coursesRes,
        assignmentsRes,
        assessmentsRes,
        classesRes,
        announcementsRes,
        placementsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('courses').select('*'),
        supabase.from('assignments').select('*'),
        supabase.from('assessments').select('*'),
        supabase.from('class_schedule').select('*'),
        supabase.from('announcements').select('*'),
        supabase.from('placements').select('*'),
      ])

      if (profileRes.data) setDisplayName(profileRes.data.display_name || '')
      if (!coursesRes.error) setCourses(coursesRes.data)
      if (!assignmentsRes.error) setAssignments(assignmentsRes.data)
      if (!assessmentsRes.error) setAssessments(assessmentsRes.data)
      if (!classesRes.error) setClasses(classesRes.data)
      if (!announcementsRes.error) setAnnouncements(announcementsRes.data)
      if (!placementsRes.error) setPlacements(placementsRes.data)

      setLoading(false)
    }

    fetchAll()
  }, [])

  if (loading) {
    return <p className="text-neutral-400">Loading overview...</p>
  }

  // --- Derived data ---

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayWeekday = today.getDay()

  const pendingAssignments = assignments.filter((a) => a.status !== 'done')

  const upcomingAssignments = [...pendingAssignments]
    .filter((a) => a.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)

  const overdueCount = pendingAssignments.filter(
    (a) => a.due_date && new Date(a.due_date) < today
  ).length

  const todayClasses = classes
    .filter((c) => c.day_of_week === todayWeekday)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const upcomingAnnouncements = [...announcements]
    .filter((a) => a.event_date && new Date(a.event_date) >= today)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 3)

  const activePlacements = placements.filter(
    (p) => p.status !== 'rejected' && p.status !== 'offer'
  ).length

  // Overall GPA (same logic as Grades tab)
  let totalCredits = 0
  let totalGradePoints = 0
  const courseGradeChart = []

  courses.forEach((course) => {
    const courseAssessments = assessments.filter((a) => a.course_id === course.id)
    const graded = courseAssessments.filter((a) => a.score !== null)
    const completedWeight = graded.reduce((sum, a) => sum + a.weight, 0)
    if (completedWeight === 0) return

    const earnedWeight = graded.reduce((sum, a) => sum + (a.score / a.max_score) * a.weight, 0)
    const percent = (earnedWeight / completedWeight) * 100
    const gpaPoints = percentToGPA(percent)

    totalCredits += parseFloat(course.credits)
    totalGradePoints += gpaPoints * parseFloat(course.credits)

    courseGradeChart.push({
      name: course.code || course.name.slice(0, 10),
      percent: parseFloat(percent.toFixed(1)),
    })
  })

  const overallGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : null

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${m} ${period}`
  }

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold text-white mb-1">
        {displayName ? `Welcome back, ${displayName}` : 'Welcome back'}
      </h2>
      <p className="text-neutral-400 text-sm mb-6">
        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => onNavigate('grades')}
          className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 text-left hover:border-indigo-500/50 transition-colors"
        >
          <p className="text-2xl font-bold text-white">{overallGPA || '—'}</p>
          <p className="text-xs text-neutral-400">Current GPA</p>
        </button>
        <button
          onClick={() => onNavigate('assignments')}
          className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 text-left hover:border-indigo-500/50 transition-colors"
        >
          <p className="text-2xl font-bold text-white">{pendingAssignments.length}</p>
          <p className="text-xs text-neutral-400">Pending Assignments</p>
        </button>
        <button
          onClick={() => onNavigate('assignments')}
          className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 text-left hover:border-red-500/50 transition-colors"
        >
          <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {overdueCount}
          </p>
          <p className="text-xs text-neutral-400">Overdue</p>
        </button>
        <button
          onClick={() => onNavigate('placements')}
          className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 text-left hover:border-indigo-500/50 transition-colors"
        >
          <p className="text-2xl font-bold text-white">{activePlacements}</p>
          <p className="text-xs text-neutral-400">Active Applications</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Upcoming deadlines */}
        <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">Upcoming Deadlines</h3>
          {upcomingAssignments.length === 0 ? (
            <p className="text-neutral-500 text-sm">Nothing due soon.</p>
          ) : (
            <div className="space-y-2">
              {upcomingAssignments.map((a) => {
                const course = courses.find((c) => c.id === a.course_id)
                const isOverdue = new Date(a.due_date) < today
                return (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      {course && (
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                      )}
                      <span className="text-neutral-200 truncate">{a.title}</span>
                    </div>
                    <span className={isOverdue ? 'text-red-400 text-xs' : 'text-neutral-500 text-xs'}>
                      {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Today's classes */}
        <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">Today's Classes</h3>
          {todayClasses.length === 0 ? (
            <p className="text-neutral-500 text-sm">No classes today.</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((c) => {
                const course = courses.find((co) => co.id === c.course_id)
                return (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: course?.color || '#6366f1' }} />
                      <span className="text-neutral-200 truncate">{course?.name || 'Unknown'}</span>
                    </div>
                    <span className="text-neutral-500 text-xs">
                      {formatTime(c.start_time)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grade chart */}
      {courseGradeChart.length > 0 && (
        <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-3">Grades by Course</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={courseGradeChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} />
              <YAxis stroke="#ffffff60" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
              <Bar dataKey="percent" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Upcoming announcements */}
      {upcomingAnnouncements.length > 0 && (
        <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">Upcoming Events</h3>
          <div className="space-y-2">
            {upcomingAnnouncements.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-200">{a.title}</span>
                <span className="text-neutral-500 text-xs">
                  {new Date(a.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview