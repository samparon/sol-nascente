import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()
const STORAGE_KEY = 'chacara_vendas'

const initialData = { clientes: [], pagamentosRealizados: [] }

export function gerarParcelas(cliente) {
  if (!cliente.dataInicioParcelas || !cliente.numParcelas) return []

  const [anoInicio, mesInicio, diaInicio] = cliente.dataInicioParcelas.split('-').map(Number)
  const parcelas = []

  for (let i = 1; i <= cliente.numParcelas; i++) {
    const anoOffset = Math.floor((i - 1) / 12)
    const isUltima = i === cliente.numParcelas && Number(cliente.ultimaParcelaValor) > 0
    const valor = isUltima
      ? Number(cliente.ultimaParcelaValor)
      : Number(cliente.valorParcelaInicial) + anoOffset * Number(cliente.reajusteAnual)

    const totalMeses = mesInicio + (i - 1)
    const ano = anoInicio + Math.floor((totalMeses - 1) / 12)
    const mes = ((totalMeses - 1) % 12) + 1
    const dataVencimento = `${ano}-${String(mes).padStart(2, '0')}-${String(diaInicio).padStart(2, '0')}`

    parcelas.push({ numero: i, valor, dataVencimento })
  }

  return parcelas
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : initialData
    } catch {
      return initialData
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  function addCliente(cliente) {
    setData(prev => ({
      ...prev,
      clientes: [...prev.clientes, { ...cliente, id: crypto.randomUUID() }],
    }))
  }

  function updateCliente(id, updates) {
    setData(prev => ({
      ...prev,
      clientes: prev.clientes.map(c => c.id === id ? { ...c, ...updates } : c),
    }))
  }

  function deleteCliente(id) {
    setData(prev => ({
      ...prev,
      clientes: prev.clientes.filter(c => c.id !== id),
      pagamentosRealizados: prev.pagamentosRealizados.filter(p => p.clienteId !== id),
    }))
  }

  function exportarBackup() {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const data_hoje = new Date().toISOString().split('T')[0]
    a.href = url
    a.download = `backup-sol-nascente-${data_hoje}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importarBackup(arquivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target.result)
          if (!parsed.clientes || !parsed.pagamentosRealizados) throw new Error('Arquivo inválido')
          setData(parsed)
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      reader.readAsText(arquivo)
    })
  }

  function importarCliente(dados) {
    const { parcelasPagas = [], entradasPagas = [], sinalPago = false, ...clienteInfo } = dados
    const clienteId = crypto.randomUUID()
    const cliente = { ...clienteInfo, id: clienteId }

    const novos = []

    if (sinalPago && clienteInfo.sinal) {
      novos.push({ id: crypto.randomUUID(), clienteId, tipo: 'sinal', referencia: 'sinal', valor: clienteInfo.sinal.valor, dataPagamento: clienteInfo.sinal.data })
    }

    for (const eid of entradasPagas) {
      const entrada = clienteInfo.entradas?.find(e => e.id === eid)
      if (entrada) novos.push({ id: crypto.randomUUID(), clienteId, tipo: 'entrada', referencia: eid, valor: entrada.valor, dataPagamento: entrada.data })
    }

    for (const p of parcelasPagas) {
      novos.push({ id: crypto.randomUUID(), clienteId, tipo: 'parcela', referencia: String(p.numero), valor: p.valor ?? 0, dataPagamento: p.dataPagamento })
    }

    setData(prev => ({
      ...prev,
      clientes: [...prev.clientes, cliente],
      pagamentosRealizados: [...prev.pagamentosRealizados, ...novos],
    }))
  }

  function marcarPago(clienteId, tipo, referencia, valor, dataPagamento) {
    setData(prev => ({
      ...prev,
      pagamentosRealizados: [
        ...prev.pagamentosRealizados,
        { id: crypto.randomUUID(), clienteId, tipo, referencia, valor, dataPagamento },
      ],
    }))
  }

  function desmarcarPago(clienteId, tipo, referencia) {
    setData(prev => ({
      ...prev,
      pagamentosRealizados: prev.pagamentosRealizados.filter(
        p => !(p.clienteId === clienteId && p.tipo === tipo && p.referencia === referencia)
      ),
    }))
  }

  function isPago(clienteId, tipo, referencia) {
    return data.pagamentosRealizados.some(
      p => p.clienteId === clienteId && p.tipo === tipo && p.referencia === referencia
    )
  }

  function getDataPagamento(clienteId, tipo, referencia) {
    const p = data.pagamentosRealizados.find(
      p => p.clienteId === clienteId && p.tipo === tipo && p.referencia === referencia
    )
    return p ? p.dataPagamento : null
  }

  function getResumoCliente(clienteId) {
    const cliente = data.clientes.find(c => c.id === clienteId)
    if (!cliente) return null

    const parcelas = gerarParcelas(cliente)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    let totalPago = 0
    let parcelasVencidas = 0
    let parcelasPagas = 0

    for (const p of parcelas) {
      const venc = new Date(p.dataVencimento + 'T00:00:00')
      const pago = isPago(clienteId, 'parcela', String(p.numero))
      if (pago) {
        totalPago += p.valor
        parcelasPagas++
      } else if (venc < hoje) {
        parcelasVencidas++
      }
    }

    const totalDevido = parcelas.reduce((acc, p) => acc + p.valor, 0)
    const saldoDevedor = totalDevido - totalPago

    return { totalPago, totalDevido, saldoDevedor, parcelasVencidas, parcelasPagas, totalParcelas: parcelas.length }
  }

  function getParcelasDoMes(mes, ano) {
    const resultado = []
    for (const cliente of data.clientes) {
      const parcelas = gerarParcelas(cliente)
      for (const parcela of parcelas) {
        const [pAno, pMes] = parcela.dataVencimento.split('-').map(Number)
        if (pMes === mes && pAno === ano) {
          resultado.push({
            cliente,
            parcela,
            pago: isPago(cliente.id, 'parcela', String(parcela.numero)),
            dataPagamento: getDataPagamento(cliente.id, 'parcela', String(parcela.numero)),
          })
        }
      }
    }
    return resultado.sort((a, b) => a.cliente.nome.localeCompare(b.cliente.nome))
  }

  function getInadimplentes() {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const resultado = []

    for (const cliente of data.clientes) {
      const parcelas = gerarParcelas(cliente)
      const vencidas = parcelas.filter(p => {
        const venc = new Date(p.dataVencimento + 'T00:00:00')
        return venc < hoje && !isPago(cliente.id, 'parcela', String(p.numero))
      })

      if (vencidas.length > 0) {
        resultado.push({
          cliente,
          parcelasVencidas: vencidas.length,
          totalDevido: vencidas.reduce((acc, p) => acc + p.valor, 0),
        })
      }
    }

    return resultado.sort((a, b) => b.parcelasVencidas - a.parcelasVencidas)
  }

  function getResumoMensal(mes, ano) {
    const parcelas = getParcelasDoMes(mes, ano)
    const pagas = parcelas.filter(p => p.pago)
    const totalRecebido = pagas.reduce((acc, p) => acc + p.parcela.valor, 0)
    const totalEsperado = parcelas.reduce((acc, p) => acc + p.parcela.valor, 0)
    return {
      total: parcelas.length,
      pagas: pagas.length,
      pendentes: parcelas.length - pagas.length,
      totalRecebido,
      totalEsperado,
    }
  }

  return (
    <AppContext.Provider value={{
      clientes: data.clientes,
      pagamentosRealizados: data.pagamentosRealizados,
      addCliente,
      updateCliente,
      deleteCliente,
      importarCliente,
      exportarBackup,
      importarBackup,
      marcarPago,
      desmarcarPago,
      isPago,
      getDataPagamento,
      getResumoCliente,
      getParcelasDoMes,
      getInadimplentes,
      getResumoMensal,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
