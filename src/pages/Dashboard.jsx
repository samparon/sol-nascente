import { useApp } from '../context/AppContext'
import { Users, AlertTriangle, CheckCircle, DollarSign, BadgeCheck } from 'lucide-react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Dashboard() {
  const { clientes, getParcelasDoMes, getInadimplentes, getResumoMensal, marcarPago } = useApp()

  const hoje = new Date()
  const mes = hoje.getMonth() + 1
  const ano = hoje.getFullYear()
  const hojeStr = hoje.toISOString().split('T')[0]

  const resumo = getResumoMensal(mes, ano)
  const inadimplentes = getInadimplentes()
  const parcelasMes = getParcelasDoMes(mes, ano)

  const cards = [
    { label: 'Total de Clientes', value: clientes.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Parcelas do Mês', value: resumo.total, icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Pagas este mês', value: resumo.pagas, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Inadimplentes', value: inadimplentes.length, icon: AlertTriangle, color: 'bg-red-500' },
  ]

  const tabelaOrdenada = [...parcelasMes].sort(
    (a, b) => Number(a.parcela.dataVencimento.split('-')[2]) - Number(b.parcela.dataVencimento.split('-')[2])
  )

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

      <div className="bg-white rounded-xl shadow overflow-hidden">
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
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {tabelaOrdenada.map(({ cliente, parcela, pago }) => (
                <tr key={`${cliente.id}-${parcela.numero}`} className="border-b border-gray-100 last:border-0">
                  <td className={`py-2 ${pago ? 'text-gray-400' : 'text-gray-800'}`}>{cliente.nome}</td>
                  <td className={`py-2 text-right ${pago ? 'text-gray-400' : 'text-gray-800'}`}>{fmt(parcela.valor)}</td>
                  <td className={`py-2 text-right font-medium ${pago ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Number(parcela.dataVencimento.split('-')[2])}
                  </td>
                  <td className={`py-2 text-right font-semibold ${pago ? 'text-green-600' : 'text-gray-300'}`}>
                    {pago ? 'Sim' : '—'}
                  </td>
                  <td className="py-2 text-right">
                    {!pago && (
                      <button
                        onClick={() => marcarPago(cliente.id, 'parcela', String(parcela.numero), parcela.valor, hojeStr)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium ml-auto">
                        <BadgeCheck size={13} /> Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-end gap-8 items-center">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Total Recebido</span>
              <span className="text-lg font-bold text-green-600">
                {fmt(tabelaOrdenada.filter(p => p.pago).reduce((acc, p) => acc + p.parcela.valor, 0))}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">A Receber</span>
              <span className="text-lg font-bold text-red-500">
                {fmt(tabelaOrdenada.filter(p => !p.pago).reduce((acc, p) => acc + p.parcela.valor, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
