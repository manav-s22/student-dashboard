import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'

function AttendanceChart({ courses, attendance }) {
  const chartData = courses
    .map((course) => {
      const records = attendance.filter((a) => a.course_id === course.id)
      if (records.length === 0) return null

      const present = records.filter((a) => a.status === 'present' || a.status === 'excused').length
      const percent = (present / records.length) * 100

      return {
        name: course.code || course.name.slice(0, 10),
        percent: parseFloat(percent.toFixed(1)),
        color: course.color,
        total: records.length,
      }
    })
    .filter(Boolean)

  if (chartData.length === 0) {
    return (
      <p className="text-neutral-400 text-center py-8">
        No attendance logged yet.
      </p>
    )
  }

  return (
    <div className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4">Attendance by Course</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} />
          <YAxis stroke="#ffffff60" fontSize={12} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
            formatter={(value, name, props) => [`${value}% (${props.payload.total} classes)`, 'Attendance']}
          />
          <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AttendanceChart