import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import CourseGradeCard from './CourseGradeCard'

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

function Grades() {
  const [courses, setCourses] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [coursesRes, assessmentsRes] = await Promise.all([
      supabase.from('courses').select('*'),
      supabase.from('assessments').select('*'),
    ])
    if (!coursesRes.error) setCourses(coursesRes.data)
    if (!assessmentsRes.error) setAssessments(assessmentsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getAssessmentsFor = (courseId) =>
    assessments.filter((a) => a.course_id === courseId)

  // Overall GPA: weighted by credits, using each course's current percentage
  let totalCredits = 0
  let totalGradePoints = 0

  courses.forEach((course) => {
    const courseAssessments = getAssessmentsFor(course.id)
    const graded = courseAssessments.filter((a) => a.score !== null)
    const completedWeight = graded.reduce((sum, a) => sum + a.weight, 0)
    if (completedWeight === 0) return

    const earnedWeight = graded.reduce((sum, a) => sum + (a.score / a.max_score) * a.weight, 0)
    const percent = (earnedWeight / completedWeight) * 100
    const gpaPoints = percentToGPA(percent)

    totalCredits += parseFloat(course.credits)
    totalGradePoints += gpaPoints * parseFloat(course.credits)
  })

  const overallGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : null

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">GPA & Grades</h2>
        {overallGPA && (
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold text-indigo-400">{overallGPA}</p>
            <p className="text-xs text-neutral-400">Current GPA</p>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-neutral-400">Loading grades...</p>
      ) : courses.length === 0 ? (
        <p className="text-neutral-400">Add a course first on the Courses tab.</p>
      ) : (
        courses.map((course) => (
          <CourseGradeCard
            key={course.id}
            course={course}
            assessments={getAssessmentsFor(course.id)}
            onUpdated={fetchData}
          />
        ))
      )}
    </div>
  )
}

export default Grades