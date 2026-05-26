import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Pagamentos from './pages/Pagamentos'
import Relatorios from './pages/Relatorios'
import './index.css'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pagamentos" element={<Pagamentos />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
