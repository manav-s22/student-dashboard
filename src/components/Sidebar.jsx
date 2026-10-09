const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'grades', label: 'GPA & Grades' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'materials', label: 'Study Materials' },
  { id: 'placements', label: 'Placement & Training' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'settings', label: 'Settings' },
]

function Sidebar({ view, onChange, userEmail, onLogout }) {
  return (
    <div className="w-56 shrink-0 bg-neutral-950 border-r border-white/10 min-h-screen py-6 px-3 hidden md:flex md:flex-col">
      <div className="px-3 mb-8">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Student<span className="text-indigo-500">Dash</span>
        </h1>
      </div>

      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              view === item.id
                ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 pt-4 border-t border-white/10">
        <p className="text-xs text-neutral-500 truncate mb-2">{userEmail}</p>
        <button
          onClick={onLogout}
          className="text-xs text-neutral-400 hover:text-indigo-400"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export default Sidebar