import { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, DollarSign, BarChart2, Download, Upload } from 'lucide-react'
import { useApp } from '../context/AppContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/pagamentos', label: 'Pagamentos', icon: DollarSign },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart2 },
]

export default function Navbar() {
  const { exportarBackup, importarBackup } = useApp()
  const inputRef = useRef(null)
  const [importando, setImportando] = useState(false)

  async function handleImport(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return
    setImportando(true)
    try {
      await importarBackup(arquivo)
      alert('Backup restaurado com sucesso!')
    } catch {
      alert('Erro ao importar: arquivo inválido.')
    } finally {
      setImportando(false)
      e.target.value = ''
    }
  }

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-xl font-bold tracking-tight">🌿 Chacreamento Sol Nascente</span>
          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-green-700'
                      : 'text-green-100 hover:bg-green-600'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}

            <div className="w-px h-6 bg-green-500 mx-1" />

            <button
              onClick={exportarBackup}
              title="Exportar backup"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-green-100 hover:bg-green-600 transition-colors">
              <Download size={15} /> Backup
            </button>

            <button
              onClick={() => inputRef.current.click()}
              title="Importar backup"
              disabled={importando}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-green-100 hover:bg-green-600 transition-colors">
              <Upload size={15} /> Restaurar
            </button>
            <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </div>
      </div>
    </nav>
  )
}
