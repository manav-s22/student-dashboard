import { useState } from 'react'
import { supabase } from '../lib/supabase'

const COLOR_OPTIONS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
]

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

function getSemesterOptions() {
  const currentYear = new Date().getFullYear()
  const seasons = ['Spring', 'Summer', 'Fall']
  const options = []

  for (let y = currentYear - 1; y <= currentYear + 1; y++) {
    seasons.forEach((season) => {
      options.push(`${season} ${y}`)
    })
  }

  return options
}

const SEMESTER_OPTIONS = getSemesterOptions()

function CourseForm({ onAdded }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [credits, setCredits] = useState(3)
  const [semester, setSemester] = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleNameBlur = () => {
  const match = COMMON_COURSES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  )
  if (match) {
    setCode(match.code)
  }
}

const handleCodeBlur = () => {
  const match = COMMON_COURSES.find(
    (c) => c.code.toLowerCase() === code.toLowerCase()
  )
  if (match) {
    setName(match.name)
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('courses').insert({
      user_id: user.id,
      name,
      code,
      credits,
      semester,
      color,
    })

    if (error) {
      setError(error.message)
    } else {
      setName('')
      setCode('')
      setCredits(3)
      setSemester('')
      setColor(COLOR_OPTIONS[0].value)
      onAdded()
    }

    setSaving(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6"
    >
      <h3 className="text-white font-semibold mb-4">Add a Course</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
<input
  type="text"
  list="course-suggestions"
  value={name}
  onChange={(e) => setName(e.target.value)}
  onBlur={handleNameBlur}
  placeholder="Course name (e.g. Data Structures)"
  required
  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
/>
        <datalist id="course-suggestions">
          {COMMON_COURSES.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>

       <input
  type="text"
  list="code-suggestions"
  value={code}
  onChange={(e) => setCode(e.target.value)}
  onBlur={handleCodeBlur}
  placeholder="Course code (e.g. CS201)"
  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
/>
        <datalist id="code-suggestions">
          {COMMON_COURSES.map((c) => (
            <option key={c.code} value={c.code} />
          ))}
        </datalist>

        <input
          type="number"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          placeholder="Credits"
          min="0"
          step="0.5"
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
        />

        <input
          type="text"
          list="semester-suggestions"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          placeholder="Semester (e.g. Fall 2026)"
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
        />
        <datalist id="semester-suggestions">
          {SEMESTER_OPTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="flex gap-2 mb-4">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setColor(c.value)}
            className={`w-7 h-7 rounded-full border-2 ${
              color === c.value ? 'border-white' : 'border-transparent'
            }`}
            style={{ backgroundColor: c.value }}
            title={c.name}
          />
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? 'Adding...' : 'Add Course'}
      </button>
    </form>
  )
}

export default CourseForm