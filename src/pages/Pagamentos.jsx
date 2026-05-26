import { useState } from 'react'
import { useApp, gerarParcelas } from '../context/AppContext'
import { CheckCircle, Clock, AlertCircle, X } from 'lucide-react'

const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

const FILTROS = ['Todos', 'Pendentes', 'Vencidos', 'Pagos']

export default function Pagamentos() {
  const { clientes, isPago, getDataPagamento, marcarPago, desmarcarPago } = useApp()
  const [clienteId, setClienteId] = useState('')
  const [filtro, setFiltro] = useState('Todos')
  const [pagandoId, setPagandoId] = useState(null)
  const [dataPag, setDataPag] = useState(new Date().toISOString().split('T')[0])

  const cliente = clientes.find(c => c.id === clienteId)
  const parcelas = cliente ? gerarParcelas(cliente) : []

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const parcelasFiltradas = parcelas.filter(p => {
    const pago = isPago(clienteId, 'parcela', String(p.numero))
    const venc = new Date(p.dataVencimento + 'T00:00:00')
    if (filtro === 'Pagos') return pago
    if (filtro === 'Pendentes') return !pago && venc >= hoje
    if (filtro === 'Vencidos') return !pago && venc < hoje
    return true
  })

  const totalPagos = parcelas.filter(p => isPago(clienteId, 'parcela', String(p.numero))).length
  const totalVencidos = parcelas.filter(p => {
    const pago = isPago(clienteId, 'parcela', String(p.numero))
    return !pago && new Date(p.dataVencimento + 'T00:00:00') < hoje
  }).length

  function confirmarPagamento() {
    if (!pagandoId) return
    if (pagandoId.tipo === 'parcela') {
      marcarPago(clienteId, 'parcela', String(pagandoId.numero), pagandoId.valor, dataPag)
    } else if (pagandoId.tipo === 'sinal') {
      marcarPago(clienteId, 'sinal', 'sinal', pagandoId.valor, dataPag)
    } else if (pagandoId.tipo === 'entrada') {
      marcarPago(clienteId, 'entrada', pagandoId.ref, pagandoId.valor, dataPag)
    }
    setPagandoId(null)
  }

  const entradasCliente = cliente ? [
    ...(cliente.sinal?.valor > 0 ? [{ tipo: 'sinal', ref: 'sinal', label: 'Sinal', valor: cliente.sinal.valor, data: cliente.sinal.data }] : []),
    ...(cliente.entradas?.filter(e => e.valor > 0).map((e, i) => ({ tipo: 'entrada', ref: e.id, label: `Entrada ${i + 1}`, valor: e.valor, data: e.data })) || []),
  ] : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pagamentos</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-52">
          <label className="text-xs text-gray-500 block mb-1">Cliente</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={clienteId}
            onChange={e => { setClienteId(e.target.value); setFiltro('Todos') }}
          >
            <option value="">Selecione um cliente...</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}{[c.numChacara && `Ch. ${c.numChacara}`, c.quadra && `Qd. ${c.quadra}`].filter(Boolean).length > 0 ? ` — ${[c.numChacara && `Ch. ${c.numChacara}`, c.quadra && `Qd. ${c.quadra}`].filter(Boolean).join(' ')}` : ''}
              </option>
            ))}
          </select>
        </div>

        {cliente && (
          <div className="flex gap-1 flex-wrap">
            {FILTROS.map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtro === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {cliente && (
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="bg-white rounded-lg shadow px-4 py-2 text-sm">
            <span className="text-gray-500">Total: </span>
            <span className="font-semibold">{parcelas.length} parcelas</span>
          </div>
          <div className="bg-green-50 rounded-lg shadow px-4 py-2 text-sm">
            <span className="text-gray-500">Pagas: </span>
            <span className="font-semibold text-green-700">{totalPagos}</span>
          </div>
          <div className="bg-red-50 rounded-lg shadow px-4 py-2 text-sm">
            <span className="text-gray-500">Vencidas: </span>
            <span className="font-semibold text-red-600">{totalVencidos}</span>
          </div>
          <div className="bg-blue-50 rounded-lg shadow px-4 py-2 text-sm">
            <span className="text-gray-500">Pendentes: </span>
            <span className="font-semibold text-blue-600">{parcelas.length - totalPagos - totalVencidos}</span>
          </div>
        </div>
      )}

      {cliente && entradasCliente.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden mb-4">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h2 className="text-sm font-semibold text-gray-700">Sinal e Entradas</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-xs uppercase bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Vencimento</th>
                <th className="text-right px-4 py-2">Valor</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Pago em</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entradasCliente.map(e => {
                const pago = isPago(clienteId, e.tipo, e.ref)
                const dataPagamento = getDataPagamento(clienteId, e.tipo, e.ref)
                return (
                  <tr key={e.ref} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{e.label}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(e.data)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(e.valor)}</td>
                    <td className="px-4 py-3">
                      {pago ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle size={13} /> Pago
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                          <Clock size={13} /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{dataPagamento ? fmtDate(dataPagamento) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {pago ? (
                        <button onClick={() => desmarcarPago(clienteId, e.tipo, e.ref)}
                          className="text-xs text-red-400 hover:text-red-600 hover:underline">
                          Desfazer
                        </button>
                      ) : (
                        <button onClick={() => { setPagandoId({ tipo: e.tipo, ref: e.ref, valor: e.valor, label: e.label }); setDataPag(new Date().toISOString().split('T')[0]) }}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">
                          Marcar pago
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!cliente ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          <p>Selecione um cliente para ver as parcelas.</p>
        </div>
      ) : parcelasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          <p>Nenhuma parcela neste filtro.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Parcela</th>
                <th className="text-left px-4 py-3">Vencimento</th>
                <th className="text-right px-4 py-3">Valor</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Pago em</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {parcelasFiltradas.map(p => {
                const pago = isPago(clienteId, 'parcela', String(p.numero))
                const venc = new Date(p.dataVencimento + 'T00:00:00')
                const vencida = !pago && venc < hoje
                const dataPagamento = getDataPagamento(clienteId, 'parcela', String(p.numero))

                return (
                  <tr key={p.numero} className={`hover:bg-gray-50 ${vencida ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-700">#{p.numero}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(p.dataVencimento)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(p.valor)}</td>
                    <td className="px-4 py-3">
                      {pago ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle size={13} /> Pago
                        </span>
                      ) : vencida ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                          <AlertCircle size={13} /> Vencido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock size={13} /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {dataPagamento ? fmtDate(dataPagamento) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pago ? (
                        <button
                          onClick={() => desmarcarPago(clienteId, 'parcela', String(p.numero))}
                          className="text-xs text-red-400 hover:text-red-600 hover:underline">
                          Desfazer
                        </button>
                      ) : (
                        <button
                          onClick={() => { setPagandoId({ ...p, tipo: 'parcela' }); setDataPag(new Date().toISOString().split('T')[0]) }}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">
                          Marcar pago
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagandoId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Confirmar pagamento</h3>
              <button onClick={() => setPagandoId(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{pagandoId.tipo === 'parcela' ? `Parcela #${pagandoId.numero}` : pagandoId.label}</strong> — <strong>{fmt(pagandoId.valor)}</strong>
            </p>
            <div className="mb-5">
              <label className="text-xs font-medium text-gray-600 block mb-1">Data do pagamento</label>
              <input type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                value={dataPag}
                onChange={e => setDataPag(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPagandoId(null)}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmarPagamento}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
