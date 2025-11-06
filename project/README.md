# Sistema de Reservas de Hotel

Sistema completo de gerenciamento de reservas de hotel com integração a múltiplos bancos de dados.

## 🏗️ Arquitetura de Bancos de Dados

Este sistema utiliza 3 bancos de dados diferentes, cada um com sua especialidade:

### 1. **RBD - Supabase (PostgreSQL)**
- **Propósito:** Dados relacionais e transacionais
- **Tabelas:**
  - `Hospede`: Cadastro de hóspedes
  - `Reserva`: Reservas de quartos
  - `Pagamento`: Pagamentos das reservas
- **Status:** ✅ Implementado

### 2. **DB1 - MongoDB**
- **Propósito:** Dados não-estruturados e flexíveis
- **Collections:**
  - `Quartos`: Informações dos quartos (tipo, comodidades, preços)
  - `Serviços`: Serviços do hotel
- **Status:** 🔄 A implementar

### 3. **DB2 - Cassandra**
- **Propósito:** Dados em tempo real e alta disponibilidade
- **Tabelas:**
  - `StatusQuartos`: Status em tempo real dos quartos (livre, ocupado, manutenção)
- **Status:** 🔄 A implementar

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 18 + TypeScript + Vite
- **Roteamento:** React Router DOM v6
- **Banco de Dados:**
  - Supabase (PostgreSQL) - RBD
  - MongoDB - DB1 (a implementar)
  - Cassandra - DB2 (a implementar)
- **Estilização:** CSS puro com design moderno

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Supabase (para RBD)
- Conta no MongoDB Atlas (para DB1 - futuro)
- Cluster Cassandra (para DB2 - futuro)

## 🔧 Instalação

### 1. Clone ou extraia o projeto

```bash
cd project
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

O arquivo `.env` já está configurado com as credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://zmftbprxcviwfqoexwgm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZnRicHJ4Y3Zpd2Zxb2V4d2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNDQ3NzIsImV4cCI6MjA3NTgyMDc3Mn0.xzhsXjgqwjtQKqdET8w0iQhj4-_M4HjSY6e2Ngfjsb0
```

### 4. Configure o banco de dados

Siga as instruções no arquivo `SETUP_DATABASE.md` para criar as tabelas no Supabase.

### 5. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
project/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── RoomCard.tsx     # Card de quarto
│   │   └── ServiceCard.tsx  # Card de serviço
│   ├── pages/               # Páginas da aplicação
│   │   ├── LoginPage.tsx    # Página de login/cadastro
│   │   └── RoomsPage.tsx    # Página de quartos e serviços
│   ├── services/            # Serviços de API
│   │   └── hospedeService.ts # CRUD de hóspedes
│   ├── lib/                 # Configurações e utilitários
│   │   └── supabase.ts      # Cliente Supabase
│   ├── styles/              # Arquivos CSS
│   │   ├── LoginPage.css
│   │   ├── RoomsPage.css
│   │   ├── RoomCard.css
│   │   └── ServiceCard.css
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── .env                     # Variáveis de ambiente
├── package.json             # Dependências
├── vite.config.ts           # Configuração Vite
├── tsconfig.json            # Configuração TypeScript
├── README.md                # Este arquivo
└── SETUP_DATABASE.md        # Instruções de setup do banco
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação de Hóspedes
- Cadastro de novos hóspedes com validação de CPF único
- Login de hóspedes existentes
- Formatação automática de CPF e telefone
- Mensagens de erro e sucesso
- Armazenamento de sessão no localStorage

### ✅ Integração com Supabase (RBD)
- Conexão configurada e testada
- CRUD completo para hóspedes:
  - `cadastrarHospede()` - Criar novo hóspede
  - `loginHospede()` - Autenticar hóspede
  - `buscarHospedePorCPF()` - Buscar por CPF
  - `listarHospedes()` - Listar todos
  - `atualizarHospede()` - Atualizar dados
  - `deletarHospede()` - Remover hóspede

### ✅ Interface de Usuário
- Design moderno e responsivo
- Animações suaves
- Feedback visual para ações do usuário
- Tabs para navegação entre login e cadastro
- Indicadores de loading

### 🔄 Em Desenvolvimento
- Integração com MongoDB (DB1) para quartos e serviços
- Integração com Cassandra (DB2) para status em tempo real
- Sistema de reservas completo
- Sistema de pagamentos
- Dashboard administrativo

## 🔐 Segurança

**⚠️ IMPORTANTE:** 
- O RLS (Row Level Security) está desabilitado para desenvolvimento
- Em produção, habilite o RLS e configure políticas adequadas
- Implemente hash de senhas (bcrypt/argon2) antes de produção
- Nunca exponha a `service_role_key` no frontend

## 📝 Próximos Passos

1. **Configurar MongoDB (DB1)**
   - Criar cluster no MongoDB Atlas
   - Configurar collections de Quartos e Serviços
   - Implementar serviço de API para MongoDB
   - Integrar com o frontend

2. **Configurar Cassandra (DB2)**
   - Configurar cluster Cassandra
   - Criar keyspace e tabela de status
   - Implementar atualização em tempo real
   - Integrar com o frontend

3. **Implementar Sistema de Reservas**
   - Criar interface de reserva
   - Validar disponibilidade de quartos
   - Integrar com tabela Reserva do Supabase

4. **Implementar Sistema de Pagamentos**
   - Criar interface de pagamento
   - Integrar com tabela Pagamento do Supabase
   - Adicionar métodos de pagamento

## 🐛 Troubleshooting

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme que as tabelas foram criadas no Supabase
- Verifique se o RLS está desabilitado para desenvolvimento

### CPF já cadastrado
- Cada CPF pode ser cadastrado apenas uma vez
- Use CPFs diferentes para testes ou limpe a tabela

### Erro ao fazer login
- Certifique-se de que o hóspede está cadastrado
- Verifique se o CPF está formatado corretamente

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação:
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

## 📄 Licença

Este projeto é para fins educacionais e demonstração de integração com múltiplos bancos de dados.

