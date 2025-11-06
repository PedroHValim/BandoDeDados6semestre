# Configuração do Banco de Dados - Sistema de Reservas de Hotel

## Banco de Dados RBD (Supabase - PostgreSQL)

Este documento contém as instruções para configurar o banco de dados relacional no Supabase.

### Passo 1: Acessar o Console do Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto: **zmftbprxcviwfqoexwgm**
4. No menu lateral, clique em **SQL Editor**

### Passo 2: Criar as Tabelas

Execute o seguinte script SQL no **SQL Editor** do Supabase:

```sql
-- Habilitar a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela Hospede
CREATE TABLE IF NOT EXISTS Hospede (
    id_hospede UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    sobrenome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Reserva
CREATE TABLE IF NOT EXISTS Reserva (
    id_reserva UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_hospede UUID NOT NULL REFERENCES Hospede(id_hospede) ON DELETE CASCADE,
    id_quarto INT NOT NULL,
    data_checkin DATE NOT NULL,
    data_checkout DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (data_checkout > data_checkin)
);

-- Tabela Pagamento
CREATE TABLE IF NOT EXISTS Pagamento (
    id_pagamento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_reserva UUID NOT NULL REFERENCES Reserva(id_reserva) ON DELETE CASCADE,
    valor DECIMAL(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_hospede_cpf ON Hospede(cpf);
CREATE INDEX IF NOT EXISTS idx_reserva_hospede ON Reserva(id_hospede);
CREATE INDEX IF NOT EXISTS idx_reserva_quarto ON Reserva(id_quarto);
CREATE INDEX IF NOT EXISTS idx_reserva_status ON Reserva(status);
CREATE INDEX IF NOT EXISTS idx_pagamento_reserva ON Pagamento(id_reserva);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_hospede_updated_at BEFORE UPDATE ON Hospede
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reserva_updated_at BEFORE UPDATE ON Reserva
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE Hospede IS 'Tabela de hóspedes do hotel';
COMMENT ON TABLE Reserva IS 'Tabela de reservas de quartos';
COMMENT ON TABLE Pagamento IS 'Tabela de pagamentos das reservas';
```

### Passo 3: Configurar Políticas de Segurança (RLS)

Por padrão, o Supabase habilita Row Level Security (RLS). Para permitir acesso público durante o desenvolvimento, execute:

```sql
-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE Hospede DISABLE ROW LEVEL SECURITY;
ALTER TABLE Reserva DISABLE ROW LEVEL SECURITY;
ALTER TABLE Pagamento DISABLE ROW LEVEL SECURITY;
```

**⚠️ IMPORTANTE:** Em produção, você deve habilitar o RLS e criar políticas adequadas de segurança.

### Passo 4: Inserir Dados de Teste (Opcional)

Para testar a aplicação, você pode inserir alguns dados de exemplo:

```sql
-- Inserir hóspedes de teste
INSERT INTO Hospede (nome, sobrenome, cpf, telefone) VALUES
('João', 'Silva', '123.456.789-00', '(11) 98765-4321'),
('Maria', 'Santos', '987.654.321-00', '(21) 91234-5678'),
('Pedro', 'Oliveira', '456.789.123-00', '(31) 99876-5432');

-- Inserir reservas de teste
INSERT INTO Reserva (id_hospede, id_quarto, data_checkin, data_checkout, status) 
SELECT 
    id_hospede, 
    101, 
    CURRENT_DATE + INTERVAL '7 days', 
    CURRENT_DATE + INTERVAL '10 days', 
    'confirmada'
FROM Hospede 
WHERE cpf = '123.456.789-00';

-- Inserir pagamento de teste
INSERT INTO Pagamento (id_reserva, valor, metodo_pagamento)
SELECT 
    id_reserva, 
    750.00, 
    'cartao_credito'
FROM Reserva 
WHERE id_quarto = 101 
LIMIT 1;
```

### Passo 5: Verificar as Tabelas

Execute a seguinte query para verificar se as tabelas foram criadas corretamente:

```sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Verificar estrutura da tabela Hospede
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Hospede';

-- Contar registros
SELECT 
    (SELECT COUNT(*) FROM Hospede) as total_hospedes,
    (SELECT COUNT(*) FROM Reserva) as total_reservas,
    (SELECT COUNT(*) FROM Pagamento) as total_pagamentos;
```

## Próximos Passos

Após executar esses comandos SQL no Supabase:

1. As tabelas estarão criadas e prontas para uso
2. O front-end já está configurado para se conectar ao banco
3. Você pode testar o cadastro e login de hóspedes na aplicação

## Estrutura das Tabelas

### Tabela: Hospede
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id_hospede | UUID | Identificador único do hóspede |
| nome | VARCHAR(255) | Nome do hóspede |
| sobrenome | VARCHAR(255) | Sobrenome do hóspede |
| cpf | VARCHAR(14) | CPF do hóspede (único) |
| telefone | VARCHAR(20) | Telefone de contato |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### Tabela: Reserva
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id_reserva | UUID | Identificador único da reserva |
| id_hospede | UUID | Referência ao hóspede |
| id_quarto | INT | Número do quarto (virá do MongoDB) |
| data_checkin | DATE | Data de entrada |
| data_checkout | DATE | Data de saída |
| status | VARCHAR(50) | Status da reserva |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### Tabela: Pagamento
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id_pagamento | UUID | Identificador único do pagamento |
| id_reserva | UUID | Referência à reserva |
| valor | DECIMAL(10,2) | Valor do pagamento |
| metodo_pagamento | VARCHAR(50) | Método de pagamento |
| data_pagamento | TIMESTAMP | Data do pagamento |
| created_at | TIMESTAMP | Data de criação do registro |

## Observações

- O campo `cpf` possui constraint UNIQUE para evitar duplicatas
- As tabelas possuem relacionamentos com CASCADE DELETE
- Índices foram criados para otimizar consultas frequentes
- Triggers atualizam automaticamente o campo `updated_at`

