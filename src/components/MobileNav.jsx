import { NAV_ITEMS } from './Sidebar'

function MobileNav({ view, onChange, onLogout }) {
  return (
    <div className="md:hidden flex items-center gap-2 border-b border-white/10 bg-neutral-950 px-4 py-3">
      <select
        value={view}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-neutral-900 text-white px-3 py-2 rounded-lg outline-none border border-white/10"
      >
        {NAV_ITEMS.map((item) => (
          <option key={item.id} value={item.id}>{item.label}</option>
        ))}
      </select>
      <button onClick={onLogout} className="text-xs text-neutral-400 hover:text-indigo-400">
        Log out
      </button>
    </div>
  )
}

export default MobileNav