import { useApp } from '../context/AppContext'
import { Users, AlertTriangle, CheckCircle, DollarSign, BadgeCheck, CalendarClock } from 'lucide-react'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

export default function Dashboard() {
  const { clientes, getParcelasDoMes, getInadimplentes, getResumoMensal, marcarPago } = useApp()

  const hoje = new Date()
  const mes = hoje.getMonth() + 1
  const ano = hoje.getFullYear()
  const hojeStr = hoje.toISOString().split('T')[0]

  const resumo = getResumoMensal(mes, ano)
  const inadimplentes = getInadimplentes()
  const parcelasMes = getParcelasDoMes(mes, ano)
  const pendentes = parcelasMes.filter(p => !p.pago)
  const pagas = parcelasMes.filter(p => p.pago)
  const vencemHoje = parcelasMes.filter(p => p.parcela.dataVencimento === hojeStr && !p.pago)

  const cards = [
    { label: 'Total de Clientes', value: clientes.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Parcelas do Mês', value: resumo.total, icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Pagas este mês', value: resumo.pagas, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Inadimplentes', value: inadimplentes.length, icon: AlertTriangle, color: 'bg-red-500' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard — {MESES[mes - 1]}/{ano}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${color} text-white rounded-lg p-3`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vencem Hoje */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <h2 className="text-base font-semibold text-blue-700 mb-1 flex items-center gap-2">
          <CalendarClock size={16} /> Vencem hoje — {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </h2>
        {vencemHoje.length === 0 ? (
          <p className="text-sm text-blue-400 mt-2">Nenhuma parcela vence hoje.</p>
        ) : (
          <>
            <p className="text-xs text-blue-500 mb-3">{vencemHoje.length} parcela{vencemHoje.length !== 1 ? 's' : ''} a receber — {fmt(vencemHoje.reduce((acc, p) => acc + p.parcela.valor, 0))}</p>
            <ul className="divide-y divide-blue-100">
              {vencemHoje.map(({ cliente, parcela }) => (
                <li key={`${cliente.id}-${parcela.numero}`} className="py-2 flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-800 text-sm">{cliente.nome}</p>
                    <p className="text-xs text-blue-500">
                      {[cliente.numChacara && `Ch. ${cliente.numChacara}`, cliente.quadra && `Qd. ${cliente.quadra}`].filter(Boolean).join(' — ')}
                      {(cliente.numChacara || cliente.quadra) ? ' — ' : ''}Parcela {parcela.numero}
                      {cliente.telefone && ` — ${cliente.telefone}`}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-700 flex-shrink-0">{fmt(parcela.valor)}</span>
                  <button
                    onClick={() => marcarPago(cliente.id, 'parcela', String(parcela.numero), parcela.valor, hojeStr)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg flex-shrink-0 font-medium">
                    <BadgeCheck size={13} /> Pagar
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" /> Pendentes este mês
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            {pendentes.length} parcela{pendentes.length !== 1 ? 's' : ''} em aberto —{' '}
            {fmt(pendentes.reduce((acc, p) => acc + p.parcela.valor, 0))}
          </p>
          {pendentes.length === 0 ? (
            <p className="text-sm text-gray-400">Todos pagaram este mês!</p>
          ) : (
            <ul className="divide-y max-h-64 overflow-y-auto">
              {pendentes.map(({ cliente, parcela }) => (
                <li key={`${cliente.id}-${parcela.numero}`} className="py-2 flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 text-sm">{cliente.nome}</p>
                    <p className="text-xs text-gray-400">
                      {[cliente.numChacara && `Ch. ${cliente.numChacara}`, cliente.quadra && `Qd. ${cliente.quadra}`].filter(Boolean).join(' — ')}
                      {(cliente.numChacara || cliente.quadra) ? ' — ' : ''}Parcela {parcela.numero}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600 flex-shrink-0">{fmt(parcela.valor)}</span>
                  <button
                    onClick={() => marcarPago(cliente.id, 'parcela', String(parcela.numero), parcela.valor, new Date().toISOString().split('T')[0])}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg flex-shrink-0 font-medium">
                    <BadgeCheck size={13} /> Pagar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" /> Pagas este mês
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            {pagas.length} pagamento{pagas.length !== 1 ? 's' : ''} — {fmt(resumo.totalRecebido)}
          </p>
          {pagas.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum pagamento registrado ainda.</p>
          ) : (
            <ul className="divide-y max-h-64 overflow-y-auto">
              {pagas.map(({ cliente, parcela, dataPagamento }) => (
                <li key={`${cliente.id}-${parcela.numero}`} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{cliente.nome}</p>
                    <p className="text-xs text-gray-400">
                      {[cliente.numChacara && `Ch. ${cliente.numChacara}`, cliente.quadra && `Qd. ${cliente.quadra}`].filter(Boolean).join(' — ')}
                      {(cliente.numChacara || cliente.quadra) ? ' — ' : ''}Parcela {parcela.numero}
                      {dataPagamento && ` — pago em ${fmtDate(dataPagamento)}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{fmt(parcela.valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {inadimplentes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h2 className="text-base font-semibold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Inadimplentes
          </h2>
          <ul className="divide-y divide-red-100">
            {inadimplentes.map(({ cliente, parcelasVencidas, totalDevido }) => (
              <li key={cliente.id} className="py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium text-red-800">{cliente.nome}</p>
                  <p className="text-xs text-red-500">
                    {[cliente.numChacara && `Ch. ${cliente.numChacara}`, cliente.quadra && `Qd. ${cliente.quadra}`].filter(Boolean).join(' — ')}
                    {(cliente.numChacara || cliente.quadra) ? ' — ' : ''}
                    {parcelasVencidas} parcela{parcelasVencidas !== 1 ? 's' : ''} em atraso
                  </p>
                </div>
                <span className="text-sm font-bold text-red-700">{fmt(totalDevido)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabela do mês ordenada por dia de vencimento */}
      <div className="bg-white rounded-xl shadow mt-6 overflow-hidden">
        <div className="bg-green-500 px-5 py-3">
          <h2 className="text-base font-semibold text-white">Mês {MESES[mes - 1]}</h2>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left pb-2 font-semibold text-gray-700">Cliente</th>
                <th className="text-right pb-2 font-semibold text-gray-700">Valor</th>
                <th className="text-right pb-2 font-semibold text-gray-700">Vencimento</th>
                <th className="text-right pb-2 font-semibold text-gray-700">Pago</th>
              </tr>
            </thead>
            <tbody>
              {[...parcelasMes]
                .sort((a, b) => Number(a.parcela.dataVencimento.split('-')[2]) - Number(b.parcela.dataVencimento.split('-')[2]))
                .map(({ cliente, parcela, pago }) => (
                  <tr key={`${cliente.id}-${parcela.numero}`} className="border-b border-gray-100 last:border-0">
                    <td className={`py-2 ${pago ? 'text-gray-400' : 'text-gray-800'}`}>{cliente.nome}</td>
                    <td className={`py-2 text-right ${pago ? 'text-gray-400' : 'text-gray-800'}`}>{fmt(parcela.valor)}</td>
                    <td className={`py-2 text-right font-medium ${pago ? 'text-gray-400' : 'text-gray-600'}`}>
                      {Number(parcela.dataVencimento.split('-')[2])}
                    </td>
                    <td className={`py-2 text-right font-semibold ${pago ? 'text-green-600' : ''}`}>
                      {pago ? 'Sim' : ''}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
