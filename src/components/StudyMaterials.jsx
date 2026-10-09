import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import MaterialForm from './MaterialForm'
import MaterialList from './MaterialList'

function StudyMaterials() {
  const [materials, setMaterials] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [materialsRes, coursesRes] = await Promise.all([
      supabase.from('study_materials').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*'),
    ])
    if (!materialsRes.error) setMaterials(materialsRes.data)
    if (!coursesRes.error) setCourses(coursesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold text-white mb-6">Study Materials</h2>
      <MaterialForm courses={courses} onAdded={fetchData} />
      {loading ? (
        <p className="text-neutral-400">Loading materials...</p>
      ) : (
        <MaterialList materials={materials} courses={courses} onDeleted={fetchData} />
      )}
    </div>
  )
}

export default StudyMaterials