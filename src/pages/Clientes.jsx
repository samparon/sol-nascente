import { useState } from 'react'
import { useApp, gerarParcelas } from '../context/AppContext'
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronUp, User, Upload } from 'lucide-react'

const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'
const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'

function Campo({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

const FORM_INICIAL = {
  nome: '',
  telefone: '',
  numChacara: '',
  quadra: '',
  cpf: '',
  valorTotal: '',
  sinalValor: '',
  sinalData: '',
  entradas: [{ id: '1', valor: '', data: '' }],
  numParcelas: '',
  valorParcelaInicial: '',
  ultimaParcelaValor: '',
  reajusteAnual: '30',
  diaVencimento: '7',
  dataInicioParcelas: '',
}

export default function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente, importarCliente, getResumoCliente } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [editingId, setEditingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importErro, setImportErro] = useState('')

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function abrirAdd() {
    setForm(FORM_INICIAL)
    setEditingId(null)
    setShowForm(true)
  }

  function abrirEdit(cliente) {
    setForm({
      nome: cliente.nome || '',
      telefone: cliente.telefone || '',
      numChacara: cliente.numChacara || '',
      quadra: cliente.quadra || '',
      cpf: cliente.cpf || '',
      valorTotal: cliente.valorTotal || '',
      sinalValor: cliente.sinal?.valor || '',
      sinalData: cliente.sinal?.data || '',
      entradas: cliente.entradas?.length
        ? cliente.entradas.map((e, i) => ({ id: String(i + 1), valor: e.valor, data: e.data }))
        : [{ id: '1', valor: '', data: '' }],
      numParcelas: cliente.numParcelas || '',
      valorParcelaInicial: cliente.valorParcelaInicial || '',
      ultimaParcelaValor: cliente.ultimaParcelaValor || '',
      reajusteAnual: cliente.reajusteAnual ?? 30,
      diaVencimento: cliente.diaVencimento ?? 7,
      dataInicioParcelas: cliente.dataInicioParcelas || '',
    })
    setEditingId(cliente.id)
    setShowForm(true)
  }

  function salvar(e) {
    e.preventDefault()
    const cliente = {
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
      numChacara: form.numChacara.trim(),
      quadra: form.quadra.trim(),
      cpf: form.cpf.trim(),
      valorTotal: parseFloat(form.valorTotal) || 0,
      sinal: form.sinalValor ? { valor: parseFloat(form.sinalValor), data: form.sinalData } : null,
      entradas: form.entradas
        .filter(e => e.valor && e.data)
        .map(e => ({ id: e.id, valor: parseFloat(e.valor), data: e.data })),
      numParcelas: parseInt(form.numParcelas) || 0,
      valorParcelaInicial: parseFloat(form.valorParcelaInicial) || 0,
      ultimaParcelaValor: form.ultimaParcelaValor ? parseFloat(form.ultimaParcelaValor) : 0,
      reajusteAnual: parseFloat(form.reajusteAnual) || 0,
      diaVencimento: parseInt(form.diaVencimento) || 7,
      dataInicioParcelas: form.dataInicioParcelas,
    }
    if (editingId) updateCliente(editingId, cliente)
    else addCliente(cliente)
    setShowForm(false)
  }

  function addEntrada() {
    setForm(prev => ({
      ...prev,
      entradas: [...prev.entradas, { id: String(Date.now()), valor: '', data: '' }],
    }))
  }

  function removeEntrada(id) {
    setForm(prev => ({ ...prev, entradas: prev.entradas.filter(e => e.id !== id) }))
  }

  function updateEntrada(id, field, value) {
    setForm(prev => ({
      ...prev,
      entradas: prev.entradas.map(e => e.id === id ? { ...e, [field]: value } : e),
    }))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <div className="flex gap-2">
          <button onClick={() => { setShowImport(true); setImportJson(''); setImportErro('') }}
            className="flex items-center gap-2 border border-green-600 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50">
            <Upload size={16} /> Importar JSON
          </button>
          <button onClick={abrirAdd}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            <Plus size={16} /> Novo Cliente
          </button>
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientes.map(cliente => {
            const resumo = getResumoCliente(cliente.id)
            const isExpanded = expandido === cliente.id
            const status = resumo?.parcelasVencidas > 0
              ? 'inadimplente'
              : resumo?.parcelasPagas === resumo?.totalParcelas && resumo?.totalParcelas > 0
              ? 'quitado'
              : 'em dia'

            return (
              <div key={cliente.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{cliente.nome}</h3>
                      {(cliente.numChacara || cliente.quadra) && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {[cliente.numChacara && `Ch. ${cliente.numChacara}`, cliente.quadra && `Qd. ${cliente.quadra}`].filter(Boolean).join(' — ')}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        status === 'inadimplente' ? 'bg-red-100 text-red-700' :
                        status === 'quitado' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {status === 'inadimplente'
                          ? `${resumo.parcelasVencidas} parcela${resumo.parcelasVencidas > 1 ? 's' : ''} em atraso`
                          : status === 'quitado' ? 'Quitado' : 'Em dia'}
                      </span>
                    </div>
                    {cliente.telefone && (
                      <p className="text-xs text-gray-400 mt-0.5">{cliente.telefone}</p>
                    )}

                  </div>

                  {resumo && (
                    <div className="hidden md:flex gap-6 text-right flex-shrink-0">
                      <div>
                        <p className="text-xs text-gray-400">Parcelas</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {resumo.parcelasPagas}/{resumo.totalParcelas}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Saldo devedor</p>
                        <p className="text-sm font-semibold text-gray-800">{fmt(resumo.saldoDevedor)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button onClick={() => abrirEdit(cliente)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setConfirmDelete(cliente)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 size={15} />
                    </button>
                    <button onClick={() => setExpandido(isExpanded ? null : cliente.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    <ClienteDetalhe cliente={cliente} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvar} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Campo label="Nome completo *">
                    <input required className={inputClass} value={form.nome}
                      onChange={e => set('nome', e.target.value)} />
                  </Campo>
                </div>
                <Campo label="Telefone">
                  <input className={inputClass} value={form.telefone}
                    onChange={e => set('telefone', e.target.value)} />
                </Campo>
                <Campo label="CPF">
                  <input className={inputClass} value={form.cpf}
                    onChange={e => set('cpf', e.target.value)} />
                </Campo>
                <Campo label="Nº da Chácara">
                  <input className={inputClass} value={form.numChacara} placeholder="ex: 5"
                    onChange={e => set('numChacara', e.target.value)} />
                </Campo>
                <Campo label="Quadra">
                  <input className={inputClass} value={form.quadra} placeholder="ex: A"
                    onChange={e => set('quadra', e.target.value)} />
                </Campo>
                <Campo label="Valor Total do Contrato (R$)">
                  <input type="number" step="0.01" className={inputClass} value={form.valorTotal}
                    onChange={e => set('valorTotal', e.target.value)} />
                </Campo>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sinal</p>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Valor do Sinal (R$)">
                    <input type="number" step="0.01" className={inputClass} value={form.sinalValor}
                      onChange={e => set('sinalValor', e.target.value)} />
                  </Campo>
                  <Campo label="Data do Sinal">
                    <input type="date" className={inputClass} value={form.sinalData}
                      onChange={e => set('sinalData', e.target.value)} />
                  </Campo>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entradas</p>
                  <button type="button" onClick={addEntrada}
                    className="text-xs text-green-600 hover:text-green-700 font-medium">
                    + Adicionar entrada
                  </button>
                </div>
                <div className="space-y-2">
                  {form.entradas.map((entrada, idx) => (
                    <div key={entrada.id} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Campo label={`Valor ${idx + 1} (R$)`}>
                          <input type="number" step="0.01" className={inputClass} value={entrada.valor}
                            onChange={e => updateEntrada(entrada.id, 'valor', e.target.value)} />
                        </Campo>
                      </div>
                      <div className="flex-1">
                        <Campo label="Data">
                          <input type="date" className={inputClass} value={entrada.data}
                            onChange={e => updateEntrada(entrada.id, 'data', e.target.value)} />
                        </Campo>
                      </div>
                      {form.entradas.length > 1 && (
                        <button type="button" onClick={() => removeEntrada(entrada.id)}
                          className="mb-0.5 p-2 text-red-400 hover:text-red-600">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Parcelas Mensais</p>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Nº de Parcelas *">
                    <input required type="number" min="1" className={inputClass} value={form.numParcelas}
                      onChange={e => set('numParcelas', e.target.value)} />
                  </Campo>
                  <Campo label="Valor da 1ª Parcela (R$) *">
                    <input required type="number" step="0.01" className={inputClass} value={form.valorParcelaInicial}
                      onChange={e => set('valorParcelaInicial', e.target.value)} />
                  </Campo>
                  <Campo label="Reajuste Anual (R$)">
                    <input type="number" step="0.01" className={inputClass} value={form.reajusteAnual}
                      onChange={e => set('reajusteAnual', e.target.value)} />
                  </Campo>
                  <Campo label="Valor da Última Parcela (R$)">
                    <input type="number" step="0.01" className={inputClass} value={form.ultimaParcelaValor}
                      placeholder="Deixe em branco se igual"
                      onChange={e => set('ultimaParcelaValor', e.target.value)} />
                  </Campo>
                  <Campo label="Data da 1ª Parcela *">
                    <input required type="date" className={inputClass} value={form.dataInicioParcelas}
                      onChange={e => set('dataInicioParcelas', e.target.value)} />
                  </Campo>
                  <Campo label="Dia de Vencimento">
                    <input type="number" min="1" max="31" className={inputClass} value={form.diaVencimento}
                      onChange={e => set('diaVencimento', e.target.value)} />
                  </Campo>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700">
                  {editingId ? 'Salvar alterações' : 'Cadastrar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Importar cliente via JSON</h3>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Cole o JSON gerado pelo Claudio para cadastrar o cliente com os pagamentos já marcados.</p>
            <textarea
              rows={12}
              className="w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder='{ "nome": "...", "numParcelas": 109, ... }'
              value={importJson}
              onChange={e => { setImportJson(e.target.value); setImportErro('') }}
            />
            {importErro && <p className="text-xs text-red-600 mt-1">{importErro}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowImport(false)}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => {
                try {
                  const dados = JSON.parse(importJson)
                  if (!dados.nome) throw new Error('Campo "nome" obrigatório')
                  if (!dados.numParcelas) throw new Error('Campo "numParcelas" obrigatório')
                  importarCliente(dados)
                  setShowImport(false)
                } catch (e) {
                  setImportErro('JSON inválido: ' + e.message)
                }
              }} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700">
                Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Excluir cliente?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Todos os pagamentos de <strong>{confirmDelete.nome}</strong> também serão excluídos. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => { deleteCliente(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClienteDetalhe({ cliente }) {
  const { isPago } = useApp()
  const parcelas = gerarParcelas(cliente)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dados do Contrato</p>
        <dl className="space-y-1.5 text-sm">
          {cliente.valorTotal > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Valor total</dt>
              <dd className="font-medium">{fmt(cliente.valorTotal)}</dd>
            </div>
          )}
          {cliente.sinal?.valor > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Sinal</dt>
              <dd className="font-medium">{fmt(cliente.sinal.valor)} em {fmtDate(cliente.sinal.data)}</dd>
            </div>
          )}
          {cliente.entradas?.filter(e => e.valor).map((e, i) => (
            <div key={i} className="flex justify-between">
              <dt className="text-gray-500">Entrada {i + 1}</dt>
              <dd className="font-medium">{fmt(e.valor)} em {fmtDate(e.data)}</dd>
            </div>
          ))}
          {(cliente.numChacara || cliente.quadra) && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Chácara / Quadra</dt>
              <dd className="font-medium">
                {[cliente.numChacara && `Ch. ${cliente.numChacara}`, cliente.quadra && `Qd. ${cliente.quadra}`].filter(Boolean).join(' — ')}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">Parcelas</dt>
            <dd className="font-medium">{cliente.numParcelas}x de {fmt(cliente.valorParcelaInicial)}</dd>
          </div>
          {cliente.reajusteAnual > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Reajuste anual</dt>
              <dd className="font-medium">+{fmt(cliente.reajusteAnual)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">Início das parcelas</dt>
            <dd className="font-medium">{fmtDate(cliente.dataInicioParcelas)}</dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Primeiras Parcelas
        </p>
        <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
          {parcelas.slice(0, 15).map(p => {
            const pago = isPago(cliente.id, 'parcela', String(p.numero))
            const vencida = !pago && new Date(p.dataVencimento + 'T00:00:00') < hoje
            return (
              <li key={p.numero} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  pago ? 'bg-green-400' : vencida ? 'bg-red-400' : 'bg-gray-300'
                }`} />
                <span className="text-gray-400 w-8 flex-shrink-0 text-xs">#{p.numero}</span>
                <span className="text-gray-500 text-xs">{fmtDate(p.dataVencimento)}</span>
                <span className="font-medium ml-auto text-xs">{fmt(p.valor)}</span>
              </li>
            )
          })}
          {parcelas.length > 15 && (
            <li className="text-xs text-gray-400 pl-4">... e mais {parcelas.length - 15} parcelas</li>
          )}
        </ul>
      </div>
    </div>
  )
}
