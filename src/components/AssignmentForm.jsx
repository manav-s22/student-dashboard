import { useState } from 'react'
import { supabase } from '../lib/supabase'

const PRIORITY_OPTIONS = ['low', 'medium', 'high']

const COMMON_COURSES = [
  { name: 'Data Structures', code: 'CS201' },
  { name: 'Algorithms', code: 'CS301' },
  { name: 'Calculus I', code: 'MATH101' },
  { name: 'Calculus II', code: 'MATH102' },
  { name: 'Linear Algebra', code: 'MATH221' },
  { name: 'Discrete Mathematics', code: 'MATH215' },
  { name: 'Introduction to Programming', code: 'CS101' },
  { name: 'Object-Oriented Programming', code: 'CS202' },
  { name: 'Database Systems', code: 'CS340' },
  { name: 'Operating Systems', code: 'CS350' },
  { name: 'Computer Networks', code: 'CS360' },
  { name: 'Software Engineering', code: 'CS401' },
  { name: 'Web Development', code: 'CS310' },
  { name: 'Physics I', code: 'PHYS101' },
  { name: 'Physics II', code: 'PHYS102' },
  { name: 'Chemistry I', code: 'CHEM101' },
  { name: 'Organic Chemistry', code: 'CHEM201' },
  { name: 'Microeconomics', code: 'ECON101' },
  { name: 'Macroeconomics', code: 'ECON102' },
  { name: 'Statistics', code: 'STAT200' },
  { name: 'English Composition', code: 'ENG101' },
  { name: 'Technical Writing', code: 'ENG210' },
  { name: 'Psychology 101', code: 'PSYC101' },
  { name: 'World History', code: 'HIST101' },
  { name: 'Philosophy', code: 'PHIL101' },
  { name: 'Digital Logic Design', code: 'CS220' },
  { name: 'Computer Architecture', code: 'CS330' },
  { name: 'Machine Learning', code: 'CS450' },
  { name: 'Artificial Intelligence', code: 'CS440' },
  { name: 'Human-Computer Interaction', code: 'CS370' },
]

const DEFAULT_COLOR = '#6366f1'

function AssignmentForm({ courses, onAdded }) {
  const [title, setTitle] = useState('')
  const [courseSelection, setCourseSelection] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const existingNames = new Set(courses.map((c) => c.name.toLowerCase()))
  const presetOptions = COMMON_COURSES.filter(
    (c) => !existingNames.has(c.name.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    let courseId = null

    if (courseSelection.startsWith('existing:')) {
      courseId = courseSelection.replace('existing:', '')
    } else if (courseSelection.startsWith('preset:')) {
      const presetName = courseSelection.replace('preset:', '')
      const preset = COMMON_COURSES.find((c) => c.name === presetName)

      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          user_id: user.id,
          name: preset.name,
          code: preset.code,
          credits: 3,
          semester: '',
          color: DEFAULT_COLOR,
        })
        .select()
        .single()

      if (courseError) {
        setError(courseError.message)
        setSaving(false)
        return
      }

      courseId = newCourse.id
    }

    const { error } = await supabase.from('assignments').insert({
      user_id: user.id,
      course_id: courseId,
      title,
      due_date: dueDate || null,
      priority,
      status: 'pending',
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setCourseSelection('')
      setDueDate('')
      setPriority('medium')
      onAdded()
    }

    setSaving(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6"
    >
      <h3 className="text-white font-semibold mb-4">Add an Assignment</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Assignment title"
          required
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500 sm:col-span-2"
        />

        <select
          value={courseSelection}
          onChange={(e) => setCourseSelection(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
        >
          <option value="" className="text-black">No course</option>

          {courses.length > 0 && (
            <optgroup label="Your Courses">
              {courses.map((c) => (
                <option key={c.id} value={`existing:${c.id}`} className="text-black">
                  {c.name}
                </option>
              ))}
            </optgroup>
          )}

          {presetOptions.length > 0 && (
            <optgroup label="Add New Course">
              {presetOptions.map((c) => (
                <option key={c.name} value={`preset:${c.name}`} className="text-black">
                  {c.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500 sm:col-span-2"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p} className="text-black">
              {p.charAt(0).toUpperCase() + p.slice(1)} priority
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? 'Adding...' : 'Add Assignment'}
      </button>
    </form>
  )
}

export default AssignmentForm