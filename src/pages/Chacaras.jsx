import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Pencil, Trash2, CheckCircle, AlertTriangle, X } from 'lucide-react'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function ChacaraForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    nome: '', locatario: '', telefone: '', valorMensal: '', dataInicio: '', observacoes: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, valorMensal: parseFloat(form.valorMensal) })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-600">Nome da Chácara</label>
        <input required className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Locatário</label>
        <input required className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={form.locatario} onChange={e => setForm(f => ({ ...f, locatario: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Telefone</label>
        <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Valor Mensal (R$)</label>
        <input required type="number" min="0" step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={form.valorMensal} onChange={e => setForm(f => ({ ...f, valorMensal: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Data de Início do Contrato</label>
        <input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Observações</label>
        <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700">
          Salvar
        </button>
      </div>
    </form>
  )
}

export default function Chacaras() {
  const { chacaras, addChacara, updateChacara, deleteChacara, getStatusChacara, getMesesEmAtraso } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chácaras</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          <Plus size={16} /> Nova Chácara
        </button>
      </div>

      {chacaras.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          <p className="text-lg">Nenhuma chácara cadastrada.</p>
          <p className="text-sm mt-1">Clique em "Nova Chácara" para começar.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {chacaras.map(c => {
            const status = getStatusChacara(c.id)
            const atraso = getMesesEmAtraso(c.id)
            return (
              <div key={c.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{c.nome}</h3>
                    <p className="text-sm text-gray-500">{c.locatario}</p>
                    {c.telefone && <p className="text-xs text-gray-400">{c.telefone}</p>}
                  </div>
                  {status === 'pago' ? (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <CheckCircle size={12} /> Pago
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      <AlertTriangle size={12} /> Pendente
                    </span>
                  )}
                </div>

                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-gray-500">Mensalidade</span>
                  <span className="font-semibold text-gray-800">
                    {c.valorMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {atraso > 0 && (
                  <div className="bg-red-50 rounded-lg px-3 py-2 text-xs text-red-700">
                    ⚠️ {atraso} {atraso === 1 ? 'mês em atraso' : 'meses em atraso'} —{' '}
                    <span className="font-semibold">
                      {(atraso * c.valorMensal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}

                {c.observacoes && (
                  <p className="text-xs text-gray-400 italic">{c.observacoes}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditando(c)}
                    className="flex-1 flex items-center justify-center gap-1 border rounded-lg py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                    <Pencil size={12} /> Editar
                  </button>
                  <button onClick={() => setConfirmDelete(c)}
                    className="flex-1 flex items-center justify-center gap-1 border border-red-200 rounded-lg py-1.5 text-xs text-red-600 hover:bg-red-50">
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Nova Chácara" onClose={() => setShowAdd(false)}>
          <ChacaraForm onSave={addChacara} onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {editando && (
        <Modal title="Editar Chácara" onClose={() => setEditando(null)}>
          <ChacaraForm
            initial={{ ...editando, valorMensal: String(editando.valorMensal) }}
            onSave={dados => updateChacara(editando.id, dados)}
            onClose={() => setEditando(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirmar exclusão" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Deseja excluir <strong>{confirmDelete.nome}</strong>? Todos os pagamentos também serão removidos.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(null)}
              className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={() => { deleteChacara(confirmDelete.id); setConfirmDelete(null) }}
              className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700">
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
