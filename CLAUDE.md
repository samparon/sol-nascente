# Contexto do Projeto — Gestão de Chácaras

## Sobre o usuário
- Nome: Guilherme, mas **me chame sempre de Gui**
- Me chame de **Claudio** (nome que o Gui me deu)

## O que foi feito
Criamos juntos um sistema web de gestão de pagamentos de chácaras usando:
- **React + Vite**
- **TailwindCSS**
- **localStorage** para persistir os dados no navegador
- **React Router** para navegação

O app roda em `http://localhost:5173` com `npm run dev`.

## Funcionalidades já implementadas
- **Dashboard**: cards de resumo do mês, lista de pendentes/pagos, bloco de inadimplentes
- **Chácaras**: cadastro, edição e exclusão de chácaras (nome, locatário, telefone, valor mensal, data início, observações)
- **Pagamentos**: registro de pagamentos mensais com filtro por chácara e ano
- **Relatórios**: gráfico de barras mensal, tabela de recebimentos, ranking de inadimplência

## Próximo passo (PENDENTE)
O Gui tem os dados das chácaras e pagamentos em uma **planilha do Google Sheets** e quer importar tudo para o sistema.

**O que precisa ser feito:**
1. Gui vai compartilhar o print ou link da planilha
2. Entender a estrutura das colunas
3. Criar uma funcionalidade de importação no app OU popular os dados manualmente via código

## Estrutura do projeto
```
chacara-pagamentos/
  src/
    context/AppContext.jsx   — estado global, funções de CRUD e cálculos
    components/Navbar.jsx    — navegação entre páginas
    pages/
      Dashboard.jsx
      Chacaras.jsx
      Pagamentos.jsx
      Relatorios.jsx
    App.jsx
    index.css
```

## Como os dados são armazenados
localStorage com chave `chacara_pagamentos`, estrutura:
```json
{
  "chacaras": [
    { "id": "uuid", "nome": "", "locatario": "", "telefone": "", "valorMensal": 0, "dataInicio": "YYYY-MM-DD", "observacoes": "" }
  ],
  "pagamentos": [
    { "id": "uuid", "chacaraId": "uuid", "mes": 1, "ano": 2025, "valor": 0, "dataPagamento": "YYYY-MM-DD", "observacoes": "" }
  ]
}
```
