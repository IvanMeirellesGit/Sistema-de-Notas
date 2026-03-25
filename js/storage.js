// Storage Manager com Salvamento Automático ao Fechar
const Storage = {
    STORAGE_KEY: 'sistemaNotas_v6',
    BACKUP_KEY: 'sistemaNotas_backup_v6',
    THEME_KEY: 'sistemaNotas_theme',
    
    save(data) {
        try {
            console.log('Salvando dados:', data.length, 'turmas');
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            this.criarBackup(data);
            return true;
        } catch (error) {
            console.error('Erro ao salvar:', error);
            return false;
        }
    },
    
    criarBackup(data) {
        try {
            const backup = {
                dados: data,
                timestamp: new Date().toISOString(),
                versao: '6.0'
            };
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
            console.log('Backup criado:', backup.timestamp);
            return true;
        } catch (error) {
            console.error('Erro no backup:', error);
            return false;
        }
    },
    
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            console.log('Carregando dados, saved existe?', !!saved);
            
            if (saved) {
                const dados = JSON.parse(saved);
                console.log('Dados carregados com sucesso:', dados.length, 'turmas');
                return dados;
            }
            
            const backup = this.recuperarBackup();
            console.log('Recuperando do backup:', backup.length, 'turmas');
            return backup;
        } catch (error) {
            console.error('Erro ao carregar:', error);
            return [];
        }
    },
    
    recuperarBackup() {
        try {
            const backup = localStorage.getItem(this.BACKUP_KEY);
            if (backup) {
                const data = JSON.parse(backup);
                console.log('Backup encontrado de:', data.timestamp);
                return data.dados || [];
            }
            console.log('Nenhum backup encontrado');
            return [];
        } catch (error) {
            console.error('Erro ao recuperar backup:', error);
            return [];
        }
    },
    
    exportar() {
        try {
            const dados = localStorage.getItem(this.STORAGE_KEY);
            if (!dados) return null;
            return JSON.stringify({
                exportadoEm: new Date().toISOString(),
                versao: '6.0',
                dados: JSON.parse(dados)
            }, null, 2);
        } catch (error) {
            console.error('Erro ao exportar:', error);
            return null;
        }
    },
    
    importar(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            const dados = importData.dados || importData;
            if (!Array.isArray(dados)) throw new Error('Formato inválido');
            console.log('Importando dados:', dados.length, 'turmas');
            this.save(dados);
            return true;
        } catch (error) {
            console.error('Erro ao importar:', error);
            return false;
        }
    },
    
    getBackupInfo() {
        try {
            const backup = localStorage.getItem(this.BACKUP_KEY);
            if (backup) {
                const data = JSON.parse(backup);
                return new Date(data.timestamp).toLocaleString('pt-BR');
            }
            return null;
        } catch (error) {
            console.error('Erro ao obter info backup:', error);
            return null;
        }
    },
    
    saveTheme(isDark) {
        try {
            localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
            return true;
        } catch (error) {
            return false;
        }
    },
    
    loadTheme() {
        try {
            const theme = localStorage.getItem(this.THEME_KEY);
            return theme === 'dark';
        } catch (error) {
            return false;
        }
    },
    
    limpar() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.BACKUP_KEY);
            localStorage.removeItem(this.THEME_KEY);
            console.log('Todos os dados foram limpos');
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    }
};