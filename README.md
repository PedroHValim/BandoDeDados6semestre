# BandoDeDados6semestre
# Projeto Banco de Dados 6° Semestre

Estrutura de como deve ser o projeto:

<img width="1246" height="820" alt="image" src="https://github.com/user-attachments/assets/ad032d70-6199-434d-a939-479ea6df14e5" />


## **Ideia para o Projeto: Sistema de Hotel/Pousada**

- Linguagem escolhida: Python;
- **RDB**: Hóspedes → MySQL;
- **DB1**: Quartos e Serviços → MongoDB;
- **DB2**: disponibilidade em tempo real → Cassandra;
- **S1**: requisita hóspedes, quartos e disponibilidade;
- **S2**: Node que conecta front-end com os bancos;

### RBD (SQL -Supabase)

- Tabelas:
1. **Hospede (id_hospede, nome, sobrenome, CPF e telefone);**  

### DB1 (Mongo - Prórpia interface do mongo)

- Tabelas:
1. **Quartos (numero, tipo, descrição, comodidades e preço_diaria);**
    
    Exemplo de como ficaria: 
    
    `{
    "numero": 101,
    "tipo": "Suíte Luxo",
    "descricao": "Quarto amplo com vista para o mar e varanda",
    "comodidades": ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Cofre"],
    "preco_diaria": 450.00
    }`
    
    

### DB2 (Cassandra - Docker)

- Tabela: Atualização em tempo real
    
    Exemplo:
    
    `quarto: 101 -> "ocupado"
    quarto: 102 -> "livre"
    quarto: 103 -> "manutenção"
    quarto: 104 -> "livre"`
    
    ou
    
    | data | numero_quarto | status | hora_atualizacao |
    | --- | --- | --- | --- |
    | 2025-09-09 | 101 | ocupado | 18:20 |
    | 2025-09-09 | 102 | livre | 18:20 |
    | 2025-09-09 | 103 | livre | 18:21 |

## Motivo de usar cada banco:

### **MySQL:**

- Dados de hóspedes, são altamente estruturados e possuem relacionamentos complexos;
- O relacional garante consistência e integridade (chaves primárias e estrangeiras);

### **MongoDB:**

- Os dados de quartos e serviços são variados e mudam bastante, por exemplo, um quarto pode ter diferentes comodidades, preços e descrições;
- O formato JSON do MongoDB permite flexibilidade, sem precisar alterar tabelas sempre que houver mudanças;
- Bom para consultas rápidas, como “Mostrar todos os quartos disponíveis com ar-condicionado”;

### **Cassandra:**

- A disponibilidade precisa ser consultada e atualizada em tempo real;
- O Cassandra é ótimo para grandes volumes de dados e consultas rápidas;
- Além de indicar se o quarto está livre ou ocupado, dá para guardar o histórico de disponibilidade;

Conexão com os Serviços (S1 e S2):

- S1: recebe as requisições dos clientes (reservas, consultas, etc) e chama os serviços corretos;
- S2: tem três partes, cada uma ligada a um banco:
    - S2 - RDB → já conecta com a geração do front-end
    - S2 - Mongo e Cassandra → utilizam node para se comunicar.

### ***RESUMINDO***

- Relacional para dados fixos e organizados.
- Mongo para dados flexíveis que mudam bastante.
- Cassandra para dados em tempo real e histórico de ocupação.

### ***COMO RODAR O PROJETO***

**Antes de tudo é necessário navegar até a pasta 'project'.**
-  Precisamos rodar os bancos de dados MongoDB e Cassandra.
    Para isso é necessário rodar em um terminal o seguinte comando -> **node .\server.js**  (arquivo responsável pelo funcionamento e funções do mongo e cassandra)
   
- Por fim precisa-se rodar o front-end juntamente com o SQL. Para isso é necessário abrir outro terminal, caminhar até a pasta 'project' e executar o seguinte comando: **npm run dev**
  
