import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AttendanceForm from './AttendanceForm'
import AttendanceChart from './AttendanceChart'

function Attendance() {
  const [courses, setCourses] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [coursesRes, attendanceRes] = await Promise.all([
      supabase.from('courses').select('*'),
      supabase.from('attendance').select('*'),
    ])
    if (!coursesRes.error) setCourses(coursesRes.data)
    if (!attendanceRes.error) setAttendance(attendanceRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Attendance</h2>
      <AttendanceForm courses={courses} onAdded={fetchData} />
      {loading ? (
        <p className="text-neutral-400">Loading...</p>
      ) : (
        <AttendanceChart courses={courses} attendance={attendance} />
      )}
    </div>
  )
}

export default Attendance