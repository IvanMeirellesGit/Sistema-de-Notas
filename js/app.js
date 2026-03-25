// App Principal
const App = {
    turmas: [],
    turmaSelecionada: null,
    bimestreAtual: 1,
    alunoEditando: null,
    isDarkMode: false,
    termoPesquisa: '',
    filtroStatus: 'todos',
    ordenacaoAtual: 'alfabetica',
    
    init() {
        console.log('Inicializando aplicação...');
        this.carregarDados();
        this.carregarTema();
        this.configurarEventos();
        this.atualizarListaTurmas();
        this.configurarSalvamentoAoFechar();
        this.mostrarStatusBackup();
        console.log('Aplicação inicializada com', this.turmas.length, 'turmas');
    },
    
    carregarTema() {
        this.isDarkMode = Storage.loadTheme();
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('btnToggleTheme').innerHTML = '☀️ Modo Claro';
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('btnToggleTheme').innerHTML = '🌙 Modo Noturno';
        }
    },
    
    alternarTema() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('btnToggleTheme').innerHTML = '☀️ Modo Claro';
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('btnToggleTheme').innerHTML = '🌙 Modo Noturno';
        }
        Storage.saveTheme(this.isDarkMode);
    },
    
    configurarSalvamentoAoFechar() {
        window.addEventListener('beforeunload', () => {
            if (this.turmas.length > 0) {
                Storage.save(this.turmas);
                console.log('Salvando antes de fechar a aba...');
            }
        });
        
        setInterval(() => {
            if (this.turmas.length > 0) {
                Storage.save(this.turmas);
                console.log('Backup automático realizado...');
            }
        }, 15000);
    },
    
    showNotification(message, isError = false) {
        const div = document.createElement('div');
        div.className = 'save-indicator';
        div.textContent = message;
        div.style.background = isError ? '#e74c3c' : '#27ae60';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    },
    
    mostrarStatusBackup() {
        const backupInfo = Storage.getBackupInfo();
        const statusDiv = document.getElementById('backupStatus');
        if (backupInfo) {
            statusDiv.innerHTML = `💾 Último backup: ${backupInfo} | Pesquise, filtre e organize seus alunos`;
        } else {
            statusDiv.innerHTML = `💾 Salvamento automático ativo | Pesquise, filtre e organize seus alunos`;
        }
    },
    
    carregarDados() {
        this.turmas = Storage.load();
        console.log('Dados carregados:', this.turmas.length, 'turmas');
    },
    
    salvarDados() {
        Storage.save(this.turmas);
        console.log('Dados salvos:', this.turmas.length, 'turmas');
        this.mostrarStatusBackup();
    },
    
    configurarEventos() {
        // Tema
        document.getElementById('btnToggleTheme').onclick = () => this.alternarTema();
        
        // Turmas
        document.getElementById('btnAdicionarTurma').onclick = () => this.adicionarTurma();
        document.getElementById('nomeTurma').onkeypress = (e) => {
            if (e.key === 'Enter') this.adicionarTurma();
        };
        
        // Alunos
        document.getElementById('btnAdicionarAluno').onclick = () => this.adicionarAluno();
        document.getElementById('nomeAluno').onkeypress = (e) => {
            if (e.key === 'Enter') this.adicionarAluno();
        };
        
        // Bimestre
        document.getElementById('selectBimestre').onchange = () => this.mudarBimestre();
        
        // Ordenação
        document.getElementById('selectOrdenacao').onchange = () => {
            this.ordenacaoAtual = document.getElementById('selectOrdenacao').value;
            this.atualizarTabelaAlunos();
        };
        
        // Pesquisa e Filtros
        document.getElementById('pesquisaAluno').oninput = (e) => {
            this.termoPesquisa = e.target.value.toLowerCase();
            this.atualizarTabelaAlunos();
            this.atualizarContadorPesquisa();
        };
        
        document.getElementById('filtroStatus').onchange = (e) => {
            this.filtroStatus = e.target.value;
            this.atualizarTabelaAlunos();
            this.atualizarContadorPesquisa();
        };
        
        document.getElementById('btnLimparFiltros').onclick = () => {
            this.termoPesquisa = '';
            this.filtroStatus = 'todos';
            document.getElementById('pesquisaAluno').value = '';
            document.getElementById('filtroStatus').value = 'todos';
            this.atualizarTabelaAlunos();
            this.atualizarContadorPesquisa();
            this.showNotification('Filtros limpos!');
        };
        
        // Relatório
        document.getElementById('btnGerarRelatorio').onclick = () => this.gerarRelatorio();
        document.getElementById('btnCopiarRelatorio').onclick = () => this.copiarRelatorio();
        
        // Exportar/Importar
        document.getElementById('btnExportarExcel').onclick = () => this.exportarParaExcel();
        document.getElementById('btnExportarJSON').onclick = () => this.exportarJSON();
        document.getElementById('btnImportarCSV').onclick = () => {
            document.getElementById('importCSV').click();
        };
        document.getElementById('btnImportarJSON').onclick = () => {
            document.getElementById('importJSON').click();
        };
        
        // Backup
        document.getElementById('btnBackup').onclick = () => this.recuperarBackup();
        
        // Eventos dos inputs de arquivo
        document.getElementById('importCSV').onchange = (e) => {
            if (e.target.files[0]) this.importarCSV(e.target.files[0]);
        };
        
        document.getElementById('importJSON').onchange = (e) => {
            if (e.target.files[0]) this.importarJSON(e.target.files[0]);
        };
        
        // Nova Tarefa
        document.getElementById('btnAbrirModalTarefa').onclick = () => this.abrirModalNovaTarefa();
        document.getElementById('fecharModalTarefa').onclick = () => this.fecharModalNovaTarefa();
        document.getElementById('btnCancelarTarefa').onclick = () => this.fecharModalNovaTarefa();
        document.getElementById('btnSalvarTarefa').onclick = () => this.salvarNovaTarefa();
        
        // Modal Trabalhos
        document.getElementById('fecharModal').onclick = () => this.fecharModal();
        document.getElementById('btnFecharModal').onclick = () => this.fecharModal();
        document.getElementById('btnAdicionarTrabalho').onclick = () => this.adicionarTrabalhoModal();
        
        window.onclick = (e) => {
            const modal = document.getElementById('modalTrabalhos');
            const modalTarefa = document.getElementById('modalNovaTarefa');
            if (e.target === modal) this.fecharModal();
            if (e.target === modalTarefa) this.fecharModalNovaTarefa();
        };
    },
    
    // ========== PESQUISA E FILTROS ==========
    filtrarAlunos(alunos) {
        let filtrados = [...alunos];
        
        // Filtro por nome
        if (this.termoPesquisa) {
            filtrados = filtrados.filter(aluno => 
                aluno.nome.toLowerCase().includes(this.termoPesquisa)
            );
        }
        
        // Filtro por status
        if (this.filtroStatus !== 'todos') {
            filtrados = filtrados.filter(aluno => {
                const media = this.calcularMediaFinal(aluno);
                if (this.filtroStatus === 'aprovado') return media >= 6;
                if (this.filtroStatus === 'recuperacao') return media >= 4 && media < 6;
                if (this.filtroStatus === 'reprovado') return media < 4;
                return true;
            });
        }
        
        return filtrados;
    },
    
    ordenarAlunos(alunos) {
        const ordenados = [...alunos];
        
        switch(this.ordenacaoAtual) {
            case 'alfabetica':
                ordenados.sort((a, b) => a.nome.localeCompare(b.nome));
                break;
            case 'media-crescente':
                ordenados.sort((a, b) => this.calcularMediaFinal(a) - this.calcularMediaFinal(b));
                break;
            case 'media-decrescente':
                ordenados.sort((a, b) => this.calcularMediaFinal(b) - this.calcularMediaFinal(a));
                break;
            case 'status':
                ordenados.sort((a, b) => {
                    const getStatusValue = (aluno) => {
                        const media = this.calcularMediaFinal(aluno);
                        if (media >= 6) return 3;
                        if (media >= 4) return 2;
                        return 1;
                    };
                    return getStatusValue(b) - getStatusValue(a);
                });
                break;
        }
        
        return ordenados;
    },
    
    atualizarContadorPesquisa() {
        const total = this.turmaSelecionada ? this.turmaSelecionada.alunos.length : 0;
        const filtrados = this.turmaSelecionada ? this.filtrarAlunos(this.turmaSelecionada.alunos).length : 0;
        const resultadoDiv = document.getElementById('resultadoPesquisa');
        
        if (this.termoPesquisa || this.filtroStatus !== 'todos') {
            resultadoDiv.innerHTML = `🔍 Mostrando ${filtrados} de ${total} alunos`;
            resultadoDiv.style.display = 'block';
        } else {
            resultadoDiv.style.display = 'none';
        }
    },
    
    // ========== EXPORTAR PARA EXCEL ==========
    exportarParaExcel() {
        if (!this.turmaSelecionada) {
            this.showNotification('Selecione uma turma!', true);
            return;
        }
        
        const alunos = this.turmaSelecionada.alunos;
        if (alunos.length === 0) {
            this.showNotification('Nenhum aluno na turma!', true);
            return;
        }
        
        // Preparar dados para CSV
        const cabecalho = [
            'Aluno',
            'Tarefa Avaliativa',
            'Prova',
            'Média do Conceito',
            'Pontos Extras',
            'Média Final',
            'Status'
        ];
        
        const linhas = alunos.map(aluno => {
            const bimestre = aluno.bimestres[this.bimestreAtual];
            const mediaConceito = this.calcularMediaConceito(aluno);
            const mediaFinal = this.calcularMediaFinal(aluno);
            const status = mediaFinal >= 6 ? 'Aprovado' : mediaFinal >= 4 ? 'Recuperação' : 'Reprovado';
            
            return [
                aluno.nome,
                bimestre.tarefa !== null ? bimestre.tarefa : '',
                bimestre.prova !== null ? bimestre.prova : '',
                mediaConceito.toFixed(2),
                (bimestre.recuperacao || 0).toFixed(1),
                mediaFinal.toFixed(2),
                status
            ];
        });
        
        const dadosCSV = [cabecalho, ...linhas]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        // Adicionar BOM para suporte a acentos
        const blob = new Blob(['\uFEFF' + dadosCSV], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `notas_${this.turmaSelecionada.nome}_${this.bimestreAtual}bim.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('✅ Arquivo Excel (CSV) exportado!');
    },
    
    // ========== EXPORTAR JSON ==========
    exportarJSON() {
        if (!this.turmaSelecionada) {
            this.showNotification('Selecione uma turma!', true);
            return;
        }
        
        const dadosExportar = {
            exportadoEm: new Date().toISOString(),
            versao: '6.0',
            turma: {
                nome: this.turmaSelecionada.nome,
                bimestre: this.bimestreAtual
            },
            alunos: this.turmaSelecionada.alunos.map(aluno => ({
                id: aluno.id,
                nome: aluno.nome,
                bimestres: aluno.bimestres
            }))
        };
        
        const jsonString = JSON.stringify(dadosExportar, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_turma_${this.turmaSelecionada.nome}_${this.bimestreAtual}bim.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('✅ JSON exportado!');
    },
    
    // ========== IMPORTAR CSV ==========
    importarCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const texto = e.target.result;
            const linhas = texto.split('\n').filter(l => l.trim());
            
            if (linhas.length < 2) {
                this.showNotification('Arquivo vazio!', true);
                return;
            }
            
            // Detectar separador (vírgula ou ponto e vírgula)
            const primeiraLinha = linhas[0];
            const separador = primeiraLinha.includes(';') ? ';' : ',';
            
            // Parse do cabeçalho
            const cabecalho = primeiraLinha.split(separador).map(c => c.replace(/["']/g, '').trim());
            
            // Encontrar índices das colunas
            const idxNome = cabecalho.findIndex(c => c.toLowerCase().includes('nome') || c.toLowerCase().includes('aluno'));
            const idxTarefa = cabecalho.findIndex(c => c.toLowerCase().includes('tarefa'));
            const idxProva = cabecalho.findIndex(c => c.toLowerCase().includes('prova'));
            const idxRecuperacao = cabecalho.findIndex(c => c.toLowerCase().includes('recuperacao') || c.toLowerCase().includes('extra'));
            
            if (idxNome === -1) {
                this.showNotification('Coluna "Nome" não encontrada!', true);
                return;
            }
            
            let alunosImportados = 0;
            let notasAtualizadas = 0;
            
            // Processar linhas
            for (let i = 1; i < linhas.length; i++) {
                const linha = linhas[i];
                if (!linha.trim()) continue;
                
                // Parse da linha respeitando aspas
                const valores = [];
                let dentroAspas = false;
                let valorAtual = '';
                
                for (let char of linha) {
                    if (char === '"') {
                        dentroAspas = !dentroAspas;
                    } else if (char === separador && !dentroAspas) {
                        valores.push(valorAtual.trim());
                        valorAtual = '';
                    } else {
                        valorAtual += char;
                    }
                }
                valores.push(valorAtual.trim());
                
                const nome = valores[idxNome]?.replace(/["']/g, '').trim();
                if (!nome) continue;
                
                // Buscar aluno
                let aluno = this.turmaSelecionada.alunos.find(a => a.nome === nome);
                
                if (!aluno) {
                    // Criar novo aluno
                    aluno = {
                        id: Date.now() + alunosImportados,
                        nome: nome,
                        bimestres: {
                            1: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                            2: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                            3: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                            4: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 }
                        }
                    };
                    this.turmaSelecionada.alunos.push(aluno);
                    alunosImportados++;
                }
                
                // Atualizar notas
                const bimestre = aluno.bimestres[this.bimestreAtual];
                
                if (idxTarefa !== -1 && valores[idxTarefa]) {
                    const tarefa = parseFloat(valores[idxTarefa].replace(/["']/g, ''));
                    if (!isNaN(tarefa) && tarefa >= 0 && tarefa <= 10) {
                        bimestre.tarefa = tarefa;
                        notasAtualizadas++;
                    }
                }
                
                if (idxProva !== -1 && valores[idxProva]) {
                    const prova = parseFloat(valores[idxProva].replace(/["']/g, ''));
                    if (!isNaN(prova) && prova >= 0 && prova <= 10) {
                        bimestre.prova = prova;
                        notasAtualizadas++;
                    }
                }
                
                if (idxRecuperacao !== -1 && valores[idxRecuperacao]) {
                    const recuperacao = parseFloat(valores[idxRecuperacao].replace(/["']/g, ''));
                    if (!isNaN(recuperacao) && recuperacao >= 0 && recuperacao <= 2) {
                        bimestre.recuperacao = recuperacao;
                    }
                }
            }
            
            if (alunosImportados > 0 || notasAtualizadas > 0) {
                this.salvarDados();
                this.atualizarTabelaAlunos();
                this.atualizarEstatisticas();
                this.showNotification(`✅ Importados ${alunosImportados} novos alunos e ${notasAtualizadas} notas atualizadas!`);
            } else {
                this.showNotification('Nenhum dado válido encontrado!', true);
            }
        };
        reader.readAsText(file, 'UTF-8');
        document.getElementById('importCSV').value = '';
    },
    
    // ========== IMPORTAR JSON ==========
    importarJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const dados = JSON.parse(e.target.result);
                
                // Verificar se é um backup completo ou exportação de turma
                if (dados.dados && Array.isArray(dados.dados)) {
                    // Backup completo do sistema
                    this.turmas = dados.dados;
                    Storage.save(this.turmas);
                    this.atualizarListaTurmas();
                    this.showNotification('✅ Backup JSON importado com sucesso!');
                    this.turmaSelecionada = null;
                    document.getElementById('alunosHeader').style.display = 'none';
                    document.getElementById('bimestreSelector').style.display = 'none';
                    document.getElementById('pesquisaArea').style.display = 'none';
                    document.getElementById('ordenacaoSelector').style.display = 'none';
                    document.getElementById('btnNovaTarefaArea').style.display = 'none';
                    this.atualizarTabelaAlunos();
                } 
                else if (dados.alunos && Array.isArray(dados.alunos)) {
                    // Exportação de uma turma específica
                    if (!this.turmaSelecionada) {
                        this.showNotification('Selecione uma turma para importar os dados!', true);
                        return;
                    }
                    
                    let alunosImportados = 0;
                    dados.alunos.forEach(alunoImportado => {
                        // Verificar se aluno já existe
                        let alunoExistente = this.turmaSelecionada.alunos.find(a => a.nome === alunoImportado.nome);
                        
                        if (!alunoExistente) {
                            // Criar novo aluno
                            alunoExistente = {
                                id: Date.now() + alunosImportados,
                                nome: alunoImportado.nome,
                                bimestres: {
                                    1: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                                    2: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                                    3: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                                    4: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 }
                                }
                            };
                            this.turmaSelecionada.alunos.push(alunoExistente);
                            alunosImportados++;
                        }
                        
                        // Atualizar bimestres
                        if (alunoImportado.bimestres) {
                            for (let bim = 1; bim <= 4; bim++) {
                                if (alunoImportado.bimestres[bim]) {
                                    const bImportado = alunoImportado.bimestres[bim];
                                    const bExistente = alunoExistente.bimestres[bim];
                                    
                                    if (bImportado.tarefa !== undefined && bImportado.tarefa !== null) {
                                        bExistente.tarefa = bImportado.tarefa;
                                    }
                                    if (bImportado.prova !== undefined && bImportado.prova !== null) {
                                        bExistente.prova = bImportado.prova;
                                    }
                                    if (bImportado.recuperacao !== undefined) {
                                        bExistente.recuperacao = Math.min(2, bImportado.recuperacao);
                                    }
                                    if (bImportado.trabalhos && bImportado.trabalhos.length > 0) {
                                        bExistente.trabalhos = [...bImportado.trabalhos];
                                    }
                                }
                            }
                        }
                    });
                    
                    this.salvarDados();
                    this.atualizarTabelaAlunos();
                    this.atualizarEstatisticas();
                    this.showNotification(`✅ JSON importado! ${alunosImportados} novos alunos adicionados.`);
                }
                else {
                    this.showNotification('Formato JSON inválido!', true);
                }
            } catch (error) {
                console.error('Erro ao importar JSON:', error);
                this.showNotification('Erro ao importar JSON! Verifique o formato.', true);
            }
        };
        reader.readAsText(file, 'UTF-8');
        document.getElementById('importJSON').value = '';
    },
    
    // ========== TAREFA EM MASSA ==========
    abrirModalNovaTarefa() {
        if (!this.turmaSelecionada) {
            this.showNotification('Selecione uma turma primeiro!', true);
            return;
        }
        
        if (this.turmaSelecionada.alunos.length === 0) {
            this.showNotification('Nenhum aluno na turma!', true);
            return;
        }
        
        const container = document.getElementById('listaAlunosParaTarefa');
        let html = '';
        
        this.turmaSelecionada.alunos.forEach(aluno => {
            html += `
                <div class="aluno-tarefa-item">
                    <div class="aluno-tarefa-nome">${this.escapeHtml(aluno.nome)}</div>
                    <div class="aluno-tarefa-nota">
                        <input type="number" id="nota_aluno_${aluno.id}" placeholder="Nota" step="0.1" min="0" max="10" value="">
                    </div>
                    <div class="aluno-tarefa-status" id="status_aluno_${aluno.id}">⏳</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        document.getElementById('novaTarefaNome').value = '';
        document.querySelector('input[name="tipoTarefa"][value="normal"]').checked = true;
        document.getElementById('modalNovaTarefa').style.display = 'block';
        
        this.turmaSelecionada.alunos.forEach(aluno => {
            const input = document.getElementById(`nota_aluno_${aluno.id}`);
            if (input) {
                input.onchange = () => {
                    const nota = parseFloat(input.value);
                    const statusSpan = document.getElementById(`status_aluno_${aluno.id}`);
                    if (!isNaN(nota) && nota >= 0 && nota <= 10) {
                        statusSpan.innerHTML = '✓';
                        statusSpan.style.color = '#27ae60';
                    } else if (input.value === '') {
                        statusSpan.innerHTML = '⏳';
                        statusSpan.style.color = '#5a6e7c';
                    } else {
                        statusSpan.innerHTML = '❌';
                        statusSpan.style.color = '#e74c3c';
                    }
                };
            }
        });
    },
    
    salvarNovaTarefa() {
        const nomeTarefa = document.getElementById('novaTarefaNome').value.trim();
        const tipoTarefa = document.querySelector('input[name="tipoTarefa"]:checked').value;
        
        if (!nomeTarefa) {
            this.showNotification('Digite o nome da tarefa!', true);
            return;
        }
        
        let tarefasAdicionadas = 0;
        
        this.turmaSelecionada.alunos.forEach(aluno => {
            const inputNota = document.getElementById(`nota_aluno_${aluno.id}`);
            const nota = parseFloat(inputNota.value);
            
            if (!isNaN(nota) && nota >= 0 && nota <= 10) {
                if (tipoTarefa === 'normal') {
                    aluno.bimestres[this.bimestreAtual].trabalhos.push({
                        nome: nomeTarefa,
                        nota: nota,
                        tipo: 'normal'
                    });
                    tarefasAdicionadas++;
                } else {
                    const recuperacaoAtual = aluno.bimestres[this.bimestreAtual].recuperacao || 0;
                    let novaRecuperacao = Math.min(2, recuperacaoAtual + nota);
                    
                    aluno.bimestres[this.bimestreAtual].trabalhos.push({
                        nome: nomeTarefa + ' ⭐',
                        nota: nota,
                        tipo: 'extra'
                    });
                    
                    aluno.bimestres[this.bimestreAtual].recuperacao = novaRecuperacao;
                    tarefasAdicionadas++;
                }
            }
        });
        
        if (tarefasAdicionadas === 0) {
            this.showNotification('Nenhuma nota válida foi inserida!', true);
            return;
        }
        
        this.salvarDados();
        this.atualizarTabelaAlunos();
        this.atualizarEstatisticas();
        this.fecharModalNovaTarefa();
        
        if (tipoTarefa === 'normal') {
            this.showNotification(`✅ Tarefa "${nomeTarefa}" adicionada para ${tarefasAdicionadas} alunos!`);
        } else {
            this.showNotification(`⭐ Nota Extra "${nomeTarefa}" adicionada para ${tarefasAdicionadas} alunos!`);
        }
    },
    
    fecharModalNovaTarefa() {
        document.getElementById('modalNovaTarefa').style.display = 'none';
        document.getElementById('novaTarefaNome').value = '';
    },
    
    // ========== PONTOS DE RECUPERAÇÃO ==========
    salvarRecuperacao(alunoId, valor) {
        const aluno = this.turmaSelecionada.alunos.find(a => a.id === alunoId);
        if (!aluno) return;
        
        let pontos = valor === '' ? 0 : parseFloat(valor);
        if (isNaN(pontos)) pontos = 0;
        if (pontos < 0) pontos = 0;
        if (pontos > 2) {
            this.showNotification('Máximo de 2 pontos extras!', true);
            pontos = 2;
            document.getElementById(`recuperacao_${alunoId}`).value = pontos;
        }
        
        aluno.bimestres[this.bimestreAtual].recuperacao = pontos;
        this.salvarDados();
        this.atualizarTabelaAlunos();
        this.atualizarEstatisticas();
        
        if (pontos > 0) {
            this.showNotification(`+${pontos} ponto(s) extra(s) para ${aluno.nome}! ✨`);
        }
    },
    
    // ========== MÉDIA COM RECUPERAÇÃO ==========
    calcularMediaFinal(aluno) {
        const b = aluno.bimestres[this.bimestreAtual];
        const tarefa = b.tarefa || 0;
        const prova = (b.prova || 0) * 2;
        const conceito = this.calcularMediaConceito(aluno);
        let media = (tarefa + prova + conceito) / 4;
        
        const recuperacao = b.recuperacao || 0;
        media = Math.min(10, media + recuperacao);
        
        return media;
    },
    
    calcularMediaConceito(aluno) {
        const trabalhos = aluno.bimestres[this.bimestreAtual].trabalhos;
        const trabalhosNormais = trabalhos.filter(t => t.tipo !== 'extra');
        if (!trabalhosNormais.length) return 0;
        return trabalhosNormais.reduce((acc, t) => acc + t.nota, 0) / trabalhosNormais.length;
    },
    
    // ========== FUNÇÕES DE BACKUP ==========
    recuperarBackup() {
        if (confirm('Recuperar último backup? Isso pode desfazer alterações recentes.')) {
            const backupData = Storage.recuperarBackup();
            if (backupData && backupData.length > 0) {
                this.turmas = backupData;
                Storage.save(this.turmas);
                this.atualizarListaTurmas();
                this.showNotification('✅ Backup recuperado!');
                this.turmaSelecionada = null;
                document.getElementById('alunosHeader').style.display = 'none';
                document.getElementById('bimestreSelector').style.display = 'none';
                document.getElementById('pesquisaArea').style.display = 'none';
                document.getElementById('ordenacaoSelector').style.display = 'none';
                document.getElementById('btnNovaTarefaArea').style.display = 'none';
                this.atualizarTabelaAlunos();
            } else {
                this.showNotification('Nenhum backup encontrado!', true);
            }
        }
    },
    
    // ========== FUNÇÕES DE TURMAS ==========
    adicionarTurma() {
        const nome = document.getElementById('nomeTurma').value.trim();
        if (!nome) {
            this.showNotification('Digite o nome da turma!', true);
            return;
        }
        
        this.turmas.push({
            id: Date.now(),
            nome: nome,
            alunos: []
        });
        
        document.getElementById('nomeTurma').value = '';
        this.salvarDados();
        this.atualizarListaTurmas();
        this.showNotification('Turma adicionada!');
    },
    
    excluirTurma(id) {
        if (confirm('Excluir esta turma e todos os alunos?')) {
            this.turmas = this.turmas.filter(t => t.id !== id);
            if (this.turmaSelecionada && this.turmaSelecionada.id === id) {
                this.turmaSelecionada = null;
                document.getElementById('alunosHeader').style.display = 'none';
                document.getElementById('bimestreSelector').style.display = 'none';
                document.getElementById('pesquisaArea').style.display = 'none';
                document.getElementById('ordenacaoSelector').style.display = 'none';
                document.getElementById('btnNovaTarefaArea').style.display = 'none';
                this.atualizarTabelaAlunos();
            }
            this.salvarDados();
            this.atualizarListaTurmas();
            this.showNotification('Turma excluída!');
        }
    },
    
    selecionarTurma(id) {
        this.turmaSelecionada = this.turmas.find(t => t.id === id);
        if (this.turmaSelecionada) {
            document.getElementById('alunosHeader').style.display = 'block';
            document.getElementById('bimestreSelector').style.display = 'flex';
            document.getElementById('pesquisaArea').style.display = 'block';
            document.getElementById('ordenacaoSelector').style.display = 'flex';
            document.getElementById('btnNovaTarefaArea').style.display = 'block';
            
            // Resetar filtros
            this.termoPesquisa = '';
            this.filtroStatus = 'todos';
            document.getElementById('pesquisaAluno').value = '';
            document.getElementById('filtroStatus').value = 'todos';
            document.getElementById('resultadoPesquisa').style.display = 'none';
            
            this.atualizarTabelaAlunos();
            this.atualizarEstatisticas();
        }
    },
    
    atualizarListaTurmas() {
        const container = document.getElementById('listaTurmas');
        if (this.turmas.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhuma turma cadastrada</div>';
            return;
        }
        
        let html = '';
        this.turmas.forEach(turma => {
            const isActive = this.turmaSelecionada && this.turmaSelecionada.id === turma.id;
            html += `
                <div class="turma-item neumorphic ${isActive ? 'active' : ''}" onclick="App.selecionarTurma(${turma.id})">
                    <div class="turma-nome">${this.escapeHtml(turma.nome)}</div>
                    <div class="turma-info">
                        <span>👨‍🎓 ${turma.alunos.length} alunos</span>
                        <button class="neumorphic-btn btn-danger" onclick="event.stopPropagation(); App.excluirTurma(${turma.id})">Excluir</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },
    
    // ========== FUNÇÕES DE ALUNOS ==========
    adicionarAluno() {
        if (!this.turmaSelecionada) {
            this.showNotification('Selecione uma turma!', true);
            return;
        }
        
        const nome = document.getElementById('nomeAluno').value.trim();
        if (!nome) {
            this.showNotification('Digite o nome do aluno!', true);
            return;
        }
        
        this.turmaSelecionada.alunos.push({
            id: Date.now(),
            nome: nome,
            bimestres: {
                1: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                2: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                3: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 },
                4: { tarefa: null, prova: null, trabalhos: [], recuperacao: 0 }
            }
        });
        
        document.getElementById('nomeAluno').value = '';
        this.salvarDados();
        this.atualizarTabelaAlunos();
        this.atualizarEstatisticas();
        this.showNotification('Aluno adicionado!');
    },
    
    excluirAluno(id) {
        if (confirm('Excluir este aluno?')) {
            this.turmaSelecionada.alunos = this.turmaSelecionada.alunos.filter(a => a.id !== id);
            this.salvarDados();
            this.atualizarTabelaAlunos();
            this.atualizarEstatisticas();
            this.showNotification('Aluno excluído!');
        }
    },
    
    mudarBimestre() {
        this.bimestreAtual = parseInt(document.getElementById('selectBimestre').value);
        this.atualizarTabelaAlunos();
        this.atualizarEstatisticas();
    },
    
    // ========== TABELA DE ALUNOS E NOTAS ==========
    atualizarTabelaAlunos() {
        const tbody = document.getElementById('corpoTabela');
        if (!this.turmaSelecionada || this.turmaSelecionada.alunos.length === 0) {
            tbody.innerHTML = '骨 oste<td colspan="8" class="empty-state">Nenhum aluno cadastrado</td> </tr>';
            return;
        }
        
        // Filtrar e ordenar alunos
        let alunosFiltrados = this.filtrarAlunos(this.turmaSelecionada.alunos);
        alunosFiltrados = this.ordenarAlunos(alunosFiltrados);
        
        let html = '';
        alunosFiltrados.forEach(aluno => {
            const bimestre = aluno.bimestres[this.bimestreAtual];
            const media = this.calcularMediaFinal(aluno);
            const status = media >= 6 ? 'aprovado' : media >= 4 ? 'recuperacao' : 'reprovado';
            const statusText = media >= 6 ? '✅ Aprovado' : media >= 4 ? '⚠️ Recuperação' : '❌ Reprovado';
            const recuperacao = bimestre.recuperacao || 0;
            
            const trabalhosNormais = bimestre.trabalhos.filter(t => t.tipo !== 'extra').length;
            const trabalhosExtras = bimestre.trabalhos.filter(t => t.tipo === 'extra').length;
            let trabalhosTexto = `${trabalhosNormais} trab`;
            if (trabalhosExtras > 0) {
                trabalhosTexto += ` +${trabalhosExtras}⭐`;
            }
            
            html += `
                <tr>
                    <td class="aluno-nome">${this.escapeHtml(aluno.nome)}</td>
                    <td><input type="number" class="nota-input" id="tarefa_${aluno.id}" value="${bimestre.tarefa !== null ? bimestre.tarefa : ''}" step="0.1" min="0" max="10" onchange="App.salvarNotaInline(${aluno.id}, 'tarefa', this.value)"></td>
                    <td><input type="number" class="nota-input" id="prova_${aluno.id}" value="${bimestre.prova !== null ? bimestre.prova : ''}" step="0.1" min="0" max="10" onchange="App.salvarNotaInline(${aluno.id}, 'prova', this.value)"></td>
                    <td><button class="neumorphic-btn btn-primary btn-acao" onclick="App.abrirModalTrabalhos(${aluno.id}, '${this.escapeHtml(aluno.nome)}')">📚 ${trabalhosTexto}</button></td>
                    <td><input type="number" class="recuperacao-input" id="recuperacao_${aluno.id}" placeholder="+0 a +2" value="${recuperacao}" step="0.5" min="0" max="2" onchange="App.salvarRecuperacao(${aluno.id}, this.value)"></td>
                    <td class="media-cell" id="media_${aluno.id}">${media.toFixed(2)}</td>
                    <td><span class="status-badge status-${status}">${statusText}</span></td>
                    <td><button class="neumorphic-btn btn-danger btn-acao" onclick="App.excluirAluno(${aluno.id})">🗑️</button></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        this.atualizarContadorPesquisa();
    },
    
    salvarNotaInline(alunoId, campo, valor) {
        const aluno = this.turmaSelecionada.alunos.find(a => a.id === alunoId);
        if (!aluno) return;
        
        const nota = valor === '' ? null : parseFloat(valor);
        if (nota !== null && (isNaN(nota) || nota < 0 || nota > 10)) {
            this.showNotification('Nota inválida!', true);
            this.atualizarTabelaAlunos();
            return;
        }
        
        aluno.bimestres[this.bimestreAtual][campo] = nota;
        this.salvarDados();
        
        const media = this.calcularMediaFinal(aluno);
        document.getElementById(`media_${aluno.id}`).textContent = media.toFixed(2);
        
        this.atualizarEstatisticas();
        this.atualizarTabelaAlunos(); // Para atualizar ordenação se necessário
        this.showNotification(`${campo === 'tarefa' ? 'Tarefa Avaliativa' : 'Prova'} salva! ✓`);
    },
    
    // ========== MODAL DE TRABALHOS ==========
    abrirModalTrabalhos(alunoId, alunoNome) {
        this.alunoEditando = this.turmaSelecionada.alunos.find(a => a.id === alunoId);
        if (!this.alunoEditando) return;
        
        document.getElementById('modalAlunoNome').textContent = `${alunoNome} - ${this.bimestreAtual}° Bimestre`;
        this.atualizarModalTrabalhos();
        document.getElementById('modalTrabalhos').style.display = 'block';
    },
    
    atualizarModalTrabalhos() {
        const bimestre = this.alunoEditando.bimestres[this.bimestreAtual];
        const container = document.getElementById('modalListaTrabalhos');
        
        if (bimestre.trabalhos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum trabalho cadastrado</p>';
        } else {
            let html = '';
            bimestre.trabalhos.forEach((trab, index) => {
                const tipoClass = trab.tipo === 'extra' ? 'trabalho-tipo-extra' : 'trabalho-tipo-normal';
                const tipoTexto = trab.tipo === 'extra' ? '⭐ Extra' : '📚 Normal';
                
                html += `
                    <div class="trabalho-item-modal">
                        <div class="trabalho-info">
                            <span class="trabalho-nome">${this.escapeHtml(trab.nome)}</span>
                            <span class="trabalho-tipo ${tipoClass}">${tipoTexto}</span>
                        </div>
                        <span class="trabalho-nota">${trab.nota.toFixed(1)}</span>
                        <button class="neumorphic-btn btn-danger btn-remover-trabalho" onclick="App.removerTrabalhoModal(${index})">✖</button>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
        
        const mediaConceito = this.calcularMediaConceito(this.alunoEditando);
        const recuperacao = bimestre.recuperacao || 0;
        
        document.getElementById('modalMediaConceito').innerHTML = `
            📊 Média do Conceito: <strong>${mediaConceito.toFixed(2)}</strong>
            ${recuperacao > 0 ? `<br>⭐ Pontos Extras: +${recuperacao.toFixed(1)}` : ''}
        `;
    },
    
    adicionarTrabalhoModal() {
        const nome = document.getElementById('modalNomeTrabalho').value.trim();
        const nota = parseFloat(document.getElementById('modalNotaTrabalho').value);
        
        if (!nome) {
            this.showNotification('Digite o nome do trabalho!', true);
            return;
        }
        if (isNaN(nota) || nota < 0 || nota > 10) {
            this.showNotification('Nota entre 0 e 10!', true);
            return;
        }
        
        const bimestre = this.alunoEditando.bimestres[this.bimestreAtual];
        bimestre.trabalhos.push({ 
            nome: nome, 
            nota: nota, 
            tipo: 'normal' 
        });
        
        document.getElementById('modalNomeTrabalho').value = '';
        document.getElementById('modalNotaTrabalho').value = '';
        
        this.atualizarModalTrabalhos();
        this.salvarDados();
        this.atualizarTabelaAlunos();
        this.atualizarEstatisticas();
        this.showNotification('Trabalho adicionado!');
    },
    
    removerTrabalhoModal(index) {
        if (confirm('Remover este trabalho?')) {
            const bimestre = this.alunoEditando.bimestres[this.bimestreAtual];
            const trabalhoRemovido = bimestre.trabalhos[index];
            
            if (trabalhoRemovido.tipo === 'extra') {
                let novaRecuperacao = (bimestre.recuperacao || 0) - trabalhoRemovido.nota;
                if (novaRecuperacao < 0) novaRecuperacao = 0;
                bimestre.recuperacao = novaRecuperacao;
            }
            
            bimestre.trabalhos.splice(index, 1);
            this.atualizarModalTrabalhos();
            this.salvarDados();
            this.atualizarTabelaAlunos();
            this.atualizarEstatisticas();
            this.showNotification('Trabalho removido!');
        }
    },
    
    fecharModal() {
        document.getElementById('modalTrabalhos').style.display = 'none';
        this.alunoEditando = null;
    },
    
    // ========== ESTATÍSTICAS ==========
    atualizarEstatisticas() {
        if (!this.turmaSelecionada || this.turmaSelecionada.alunos.length === 0) {
            document.getElementById('totalAlunos').textContent = '0';
            document.getElementById('mediaTurma').textContent = '0.00';
            document.getElementById('aprovados').textContent = '0';
            document.getElementById('recuperacao').textContent = '0';
            document.getElementById('reprovados').textContent = '0';
            return;
        }
        
        const alunos = this.turmaSelecionada.alunos;
        const total = alunos.length;
        let somaMedias = 0;
        let aprovados = 0, recuperacao = 0, reprovados = 0;
        
        alunos.forEach(aluno => {
            const media = this.calcularMediaFinal(aluno);
            somaMedias += media;
            if (media >= 6) aprovados++;
            else if (media >= 4) recuperacao++;
            else reprovados++;
        });
        
        document.getElementById('totalAlunos').textContent = total;
        document.getElementById('mediaTurma').textContent = (somaMedias / total).toFixed(2);
        document.getElementById('aprovados').textContent = aprovados;
        document.getElementById('recuperacao').textContent = recuperacao;
        document.getElementById('reprovados').textContent = reprovados;
    },
    
    // ========== RELATÓRIO ==========
    gerarRelatorio() {
        if (!this.turmaSelecionada) {
            this.showNotification('Selecione uma turma!', true);
            return;
        }
        
        if (this.turmaSelecionada.alunos.length === 0) {
            this.showNotification('Nenhum aluno na turma!', true);
            return;
        }
        
        let relatorio = `📊 RELATÓRIO DE NOTAS\n`;
        relatorio += `${'='.repeat(55)}\n`;
        relatorio += `🏫 ${this.turmaSelecionada.nome}\n`;
        relatorio += `📅 ${new Date().toLocaleDateString('pt-BR')} - ${this.bimestreAtual}° BIMESTRE\n`;
        relatorio += `${'='.repeat(55)}\n\n`;
        
        const alunosOrdenados = this.ordenarAlunos(this.turmaSelecionada.alunos);
        
        alunosOrdenados.forEach((aluno, idx) => {
            const b = aluno.bimestres[this.bimestreAtual];
            const media = this.calcularMediaFinal(aluno);
            const status = media >= 6 ? 'APROVADO' : media >= 4 ? 'RECUPERAÇÃO' : 'REPROVADO';
            const recuperacao = b.recuperacao || 0;
            
            const trabalhosNormais = b.trabalhos.filter(t => t.tipo !== 'extra');
            const trabalhosExtras = b.trabalhos.filter(t => t.tipo === 'extra');
            
            relatorio += `${idx + 1}. ${aluno.nome}\n`;
            relatorio += `   📖 Tarefa Avaliativa: ${b.tarefa !== null ? b.tarefa.toFixed(1) : '—'}\n`;
            relatorio += `   📝 Prova: ${b.prova !== null ? b.prova.toFixed(1) : '—'} (Peso 2)\n`;
            
            if (trabalhosNormais.length > 0) {
                relatorio += `   📚 Trabalhos:\n`;
                trabalhosNormais.forEach(t => {
                    relatorio += `      • ${t.nome}: ${t.nota.toFixed(1)}\n`;
                });
                relatorio += `      Média do Conceito: ${this.calcularMediaConceito(aluno).toFixed(2)}\n`;
            } else {
                relatorio += `   📚 Conceito: Sem trabalhos\n`;
            }
            
            if (trabalhosExtras.length > 0) {
                relatorio += `   ⭐ Atividades Extras (Pontos de Recuperação):\n`;
                trabalhosExtras.forEach(t => {
                    relatorio += `      • ${t.nome.replace(' ⭐', '')}: +${t.nota.toFixed(1)}\n`;
                });
                relatorio += `      Total de Pontos Extras: +${recuperacao.toFixed(1)}\n`;
            }
            
            relatorio += `   🎯 MÉDIA FINAL: ${media.toFixed(2)} - ${status}\n`;
            relatorio += `${'-'.repeat(45)}\n`;
        });
        
        document.getElementById('relatorio').textContent = relatorio;
        this.showNotification('Relatório gerado!');
    },
    
    copiarRelatorio() {
        const relatorio = document.getElementById('relatorio').textContent;
        if (!relatorio || relatorio.includes('Selecione')) {
            this.showNotification('Gere um relatório primeiro!', true);
            return;
        }
        
        navigator.clipboard.writeText(relatorio).then(() => {
            this.showNotification('✅ Relatório copiado!');
        });
    },
    
    // ========== UTILITÁRIOS ==========
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});