# 📚 Sistema de Notas

Sistema completo para gerenciamento de notas escolares com design Neumórfico e modo noturno.

## ✨ Funcionalidades

- ✅ Gerenciamento de múltiplas turmas
- ✅ Cadastro de alunos por turma
- ✅ 4 bimestres separados
- ✅ Notas: Tarefa Avaliativa, Prova (Peso 2) e Trabalhos
- ✅ Criação de tarefas em massa com notas individuais
- ✅ Tarefas normais (entram no conceito) ou extras (pontos de recuperação)
- ✅ Pontos extras de recuperação (máximo +2)
- ✅ Edição inline com TAB
- ✅ Estatísticas em tempo real
- ✅ Relatório completo para copiar
- ✅ Exportar/Importar dados em JSON
- ✅ Backup automático a cada 15 segundos
- ✅ Salvamento ao fechar a aba
- ✅ Modo noturno 🌙

## 📁 Estrutura

sistema-notas/
├── index.html
├── css/
│ └── style.css
├── js/
│ ├── storage.js
│ └── app.js
└── README.md

## 🚀 Como usar

1. Crie uma pasta e coloque os arquivos na estrutura acima
2. Abra o arquivo `index.html` no navegador
3. Crie uma turma
4. Adicione os alunos
5. Selecione o bimestre
6. Insira as notas (use TAB para navegar)
7. Crie tarefas em massa clicando em "+ Nova Tarefa para Turma"
8. Escolha entre Trabalho Normal (📚) ou Nota Extra (⭐)
9. Atribua notas individuais para cada aluno
10. Gere o relatório e copie para o Classroom

## 🎯 Teclas de atalho

- `TAB` - Navega entre os campos de nota
- `Enter` - Confirma/Adiciona

## 💾 Persistência

Os dados são salvos automaticamente no localStorage:

- A cada 15 segundos
- Ao fechar a aba/navegador
- Backup automático disponível

## 🌙 Modo Noturno

Clique no botão 🌙/☀️ no cabeçalho para alternar entre os temas.

---

Desenvolvido com ❤️
