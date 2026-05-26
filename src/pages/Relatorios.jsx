import { useState } from 'react'
import { useApp, gerarParcelas } from '../context/AppContext'
import { TrendingUp, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MESES_CURTO = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Relatorios() {
  const { clientes, pagamentosRealizados, getInadimplentes, getResumoMensal, isPago } = useApp()
  const hoje = new Date()
  const [anoSel, setAnoSel] = useState(hoje.getFullYear())

  const inadimplentes = getInadimplentes()

  const resumoPorMes = MESES.map((nome, i) => {
    const mes = i + 1
    const r = getResumoMensal(mes, anoSel)
    return { nome, mes, ...r }
  })

  const totalAno = resumoPorMes.reduce((acc, m) => acc + m.totalRecebido, 0)
  const esperadoAno = resumoPorMes.reduce((acc, m) => acc + m.totalEsperado, 0)
  const maxBar = Math.max(...resumoPorMes.map(m => m.totalEsperado), 1)

  const resumoClientes = clientes.map(c => {
    const parcelas = gerarParcelas(c)
    const pagas = parcelas.filter(p => isPago(c.id, 'parcela', String(p.numero)))
    const totalPago = pagas.reduce((acc, p) => acc + p.valor, 0)
    const totalDevido = parcelas.reduce((acc, p) => acc + p.valor, 0)
    return {
      ...c,
      parcelasPagas: pagas.length,
      totalParcelas: parcelas.length,
      totalPago,
      saldoDevedor: totalDevido - totalPago,
    }
  }).sort((a, b) => b.saldoDevedor - a.saldoDevedor)

  const totalGeralDevido = resumoClientes.reduce((acc, c) => acc + c.saldoDevedor, 0)
  const totalParcelasPago = resumoClientes.reduce((acc, c) => acc + c.totalPago, 0)
  const totalEntradasPago = pagamentosRealizados
    .filter(p => p.tipo === 'sinal' || p.tipo === 'entrada')
    .reduce((acc, p) => acc + p.valor, 0)
  const totalGeralPago = totalParcelasPago + totalEntradasPago

  const anos = []
  for (let y = hoje.getFullYear() - 1; y <= hoje.getFullYear() + 5; y++) anos.push(y)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
        <select className="border rounded-lg px-3 py-2 text-sm"
          value={anoSel} onChange={e => setAnoSel(parseInt(e.target.value))}>
          {anos.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: `Recebido em ${anoSel}`, value: fmt(totalAno), icon: DollarSign, color: 'bg-green-500' },
          { label: 'Esperado no ano', value: fmt(esperadoAno), icon: TrendingUp, color: 'bg-blue-500' },
          {
            label: 'Taxa de recebimento',
            value: esperadoAno > 0 ? `${((totalAno / esperadoAno) * 100).toFixed(1)}%` : '—',
            icon: CheckCircle,
            color: 'bg-emerald-500',
          },
          { label: 'Inadimplentes', value: inadimplentes.length, icon: AlertTriangle, color: 'bg-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${color} text-white rounded-lg p-3`}><Icon size={20} /></div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-6">Recebimentos mensais — {anoSel}</h2>
        <div className="flex items-end gap-2 h-40">
          {resumoPorMes.map(m => (
            <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
              {m.totalRecebido > 0 && (
                <span className="text-xs text-gray-500 font-medium leading-none">
                  {(m.totalRecebido / 1000).toFixed(0)}k
                </span>
              )}
              <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-t-md transition-all ${m.totalRecebido > 0 ? 'bg-green-500' : 'bg-gray-100'}`}
                  style={{ height: `${(m.totalRecebido / maxBar) * 100}%`, minHeight: m.totalRecebido > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-xs text-gray-400">{MESES_CURTO[m.mes - 1]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Recebimentos por mês — {anoSel}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b">
                <th className="text-left pb-2">Mês</th>
                <th className="text-right pb-2">Recebido</th>
                <th className="text-right pb-2">Parcelas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {resumoPorMes.filter(m => m.total > 0).map(m => (
                <tr key={m.mes}>
                  <td className="py-2 text-gray-700">{m.nome}</td>
                  <td className="py-2 text-right font-semibold text-green-700">{fmt(m.totalRecebido)}</td>
                  <td className="py-2 text-right text-gray-500">{m.pagas}/{m.total}</td>
                </tr>
              ))}
              {resumoPorMes.every(m => m.total === 0) && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-400">
                    Sem parcelas em {anoSel}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Inadimplência atual
          </h2>
          {inadimplentes.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum inadimplente no momento.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b">
                  <th className="text-left pb-2">Cliente</th>
                  <th className="text-right pb-2">Parcelas</th>
                  <th className="text-right pb-2">Débito</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inadimplentes.map(({ cliente, parcelasVencidas, totalDevido }) => (
                  <tr key={cliente.id}>
                    <td className="py-2">
                      <p className="font-medium text-gray-700">{cliente.nome}</p>
                      {(cliente.numChacara || cliente.quadra) && (
                        <p className="text-xs text-gray-400">
                          {[cliente.numChacara && `Ch. ${cliente.numChacara}`, cliente.quadra && `Qd. ${cliente.quadra}`].filter(Boolean).join(' — ')}
                        </p>
                      )}
                    </td>
                    <td className="py-2 text-right text-red-600 font-semibold">{parcelasVencidas}</td>
                    <td className="py-2 text-right text-red-700 font-bold">{fmt(totalDevido)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <p className="text-xs text-orange-600 font-medium mb-1">Total a receber (todos os clientes)</p>
          <p className="text-3xl font-bold text-orange-700">{fmt(totalGeralDevido)}</p>
          <p className="text-xs text-gray-400 mt-1">{clientes.length} clientes — saldo devedor total das parcelas</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-xs text-green-600 font-medium mb-1">Total já recebido (parcelas)</p>
          <p className="text-3xl font-bold text-green-700">{fmt(totalGeralPago)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Parcelas: {fmt(totalParcelasPago)} + Entradas: {fmt(totalEntradasPago)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Resumo por cliente</h2>
        {clientes.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum cliente cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b">
                <th className="text-left pb-2">Cliente</th>
                <th className="text-right pb-2">Parcelas pagas</th>
                <th className="text-right pb-2">Total pago</th>
                <th className="text-right pb-2">Saldo devedor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {resumoClientes.map(c => (
                <tr key={c.id}>
                  <td className="py-2">
                    <p className="font-medium text-gray-700">{c.nome}</p>
                    {(c.numChacara || c.quadra) && (
                      <p className="text-xs text-gray-400">
                        {[c.numChacara && `Ch. ${c.numChacara}`, c.quadra && `Qd. ${c.quadra}`].filter(Boolean).join(' — ')}
                      </p>
                    )}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {c.parcelasPagas}/{c.totalParcelas}
                  </td>
                  <td className="py-2 text-right text-green-700 font-semibold">
                    {fmt(c.totalPago)}
                  </td>
                  <td className="py-2 text-right font-bold text-gray-800">
                    {fmt(c.saldoDevedor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
