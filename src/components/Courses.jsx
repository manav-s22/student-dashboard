import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import CourseForm from './CourseForm'
import CourseList from './CourseList'

function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCourses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold text-white mb-6">Courses</h2>
      <CourseForm onAdded={fetchCourses} />
      {loading ? (
        <p className="text-neutral-400">Loading courses...</p>
      ) : (
        <CourseList courses={courses} onDeleted={fetchCourses} />
      )}
    </div>
  )
}

export default Courses