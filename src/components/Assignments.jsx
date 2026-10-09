import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AssignmentForm from './AssignmentForm'
import AssignmentList from './AssignmentList'

function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)

    const [assignmentsRes, coursesRes] = await Promise.all([
      supabase.from('assignments').select('*').order('due_date', { ascending: true }),
      supabase.from('courses').select('*'),
    ])

    if (!assignmentsRes.error) setAssignments(assignmentsRes.data)
    if (!coursesRes.error) setCourses(coursesRes.data)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Assignments</h2>
      <AssignmentForm courses={courses} onAdded={fetchData} />
      {loading ? (
        <p className="text-neutral-400">Loading assignments...</p>
      ) : (
        <AssignmentList assignments={assignments} courses={courses} onUpdated={fetchData} />
      )}
    </div>
  )
}

export default Assignments