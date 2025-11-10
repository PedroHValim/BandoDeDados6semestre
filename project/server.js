import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Quartos from './schemaQuartos.js';
import cors from 'cors';
import cassandra from 'cassandra-driver';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ===============================
// 🔹 Conexão com Cassandra
// ===============================
const clientCass = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'hotel_status',
});

export default clientCass;

async function run() {
  try {
    await clientCass.connect();
    console.log('✅ Conectado ao Cassandra!');

    const result = await clientCass.execute('SELECT * FROM system.local');
    console.log('Versão Cassandra:', result.rows[0].release_version);
  } catch (err) {
    console.error('❌ Erro de conexão com Cassandra:', err);
  }
}

run();

// ===============================
// 🔹 Conexão com MongoDB
// ===============================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB!');
  } catch (error) {
    console.log('❌ Erro ao conectar no MongoDB:', error);
  }
};
connectDB();

// ===============================
// 🔹 Funções MongoDB (CRUD)
// ===============================

// Inserir quarto
app.post('/inserirQuarto', async (req, res) => {
  try {
    const novoQuarto = await Quartos.create(req.body);
    const numero = novoQuarto.numero;
    const status = novoQuarto.disponibilidade || 'livre';
    await adicionarStatus(numero, status);
    res.json(novoQuarto);
  } catch (error) {
    console.error('❌ Erro ao inserir quarto:', error);
    res.status(500).send(error);
  }
});

app.delete("/excluirQuarto/:numero", async (req, res) => {
  const { numero } = req.params;

  try {
    // Exclui do MongoDB
    const deleted = await Quartos.findOneAndDelete({ numero });
    if (!deleted) {
      return res.status(404).json({ mensagem: "Quarto não encontrado no MongoDB" });
    }

    // Exclui também do Cassandra
    await clientCass.execute(
      "DELETE FROM quartos_status WHERE numero_quarto = ?",
      [Number(numero)],
      { prepare: true }
    );

    console.log(`🗑️ Quarto ${numero} excluído com sucesso (MongoDB + Cassandra)`);
    res.json({ mensagem: `Quarto ${numero} excluído com sucesso` });
  } catch (err) {
    console.error("❌ Erro ao excluir quarto:", err);
    res.status(500).json({ erro: "Erro ao excluir quarto" });
  }
});

app.put("/atualizarQuarto", async (req, res) => {
  try {
    const { numero, descricao, comodidades, preco_diaria, disponibilidade } = req.body;

    // 🔹 Busca o quarto atual no MongoDB
    const quartoExistente = await Quartos.findOne({ numero });
    if (!quartoExistente) {
      return res.status(404).json({ erro: "Quarto não encontrado" });
    }

    // 🔹 Atualiza apenas os campos enviados (sem sobrescrever os que vierem vazios)
    if (descricao) quartoExistente.descricao = descricao;
    if (comodidades) quartoExistente.comodidades = comodidades;
    if (preco_diaria) quartoExistente.preco_diaria = preco_diaria;
    if (disponibilidade) quartoExistente.disponibilidade = disponibilidade;

    await quartoExistente.save();

    // 🔹 Se enviou disponibilidade, atualiza também no Cassandra
    if (disponibilidade) {
      await atualizarStatus(numero, disponibilidade);
    }

    res.json({ mensagem: "✅ Quarto atualizado com sucesso!", quarto: quartoExistente });
  } catch (error) {
    console.error("❌ Erro ao atualizar quarto:", error);
    res.status(500).json({ erro: "Erro ao atualizar quarto" });
  }
});

// Listar quartos (com status integrado)
app.get('/quartos', async (req, res) => {
  try {
    // 1️⃣ Busca todos os quartos no MongoDB
    const quartosMongo = await Quartos.find();

    // 2️⃣ Para cada quarto, busca o status no Cassandra
    const quartosComStatus = await Promise.all(
      quartosMongo.map(async (q) => {
        try {
          const result = await clientCass.execute(
            'SELECT status, data, hora_atualizacao FROM quartos_status WHERE numero_quarto = ?',
            [q.numero],
            { prepare: true }
          );

          const status =
            result.rowLength > 0 ? result.rows[0].status : 'indisponível';
          const data =
            result.rowLength > 0 ? result.rows[0].data : '---';
          const hora =
            result.rowLength > 0 ? result.rows[0].hora_atualizacao : '---';

          return {
            ...q.toObject(),
            disponibilidade: status,
            ultima_atualizacao: `${data} às ${hora}`,
          };
        } catch (err) {
          console.error(`Erro ao buscar status do quarto ${q.numero}:`, err);
          return {
            ...q.toObject(),
            disponibilidade: 'erro',
          };
        }
      })
    );

    // 3️⃣ Retorna a junção Mongo + Cassandra
    res.json(quartosComStatus);
  } catch (error) {
    console.error('❌ Erro ao listar quartos:', error);
    res.status(500).json({ error: 'Erro ao listar quartos' });
  }
});

// ===============================
// 🔹 Funções Cassandra (CRUD)
// ===============================

// Listar status por número de quarto
async function listarQuartos(numero_quarto) {
  try {
    const result = await clientCass.execute(
      'SELECT * FROM quartos_status WHERE numero_quarto = ?',
      [numero_quarto],
      { prepare: true }
    );
    console.log(`📋 Status do quarto ${numero_quarto}:`, result.rows);
    return result.rows;
  } catch (err) {
    console.error('❌ Erro ao listar quartos:', err);
  }
}

// Rota para listar status individual
app.get('/disponibilidade', async (req, res) => {
  const { numero_quarto } = req.body;
  try {
    const result = await listarQuartos(numero_quarto);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro na rota /disponibilidade:', error);
    res.status(500).send('Erro ao buscar disponibilidade');
  }
});

// Atualizar status de um quarto
async function atualizarStatus(numero_quarto, status) {
  try {
    const agora = new Date();
    const data = agora.toISOString().split('T')[0];
    const hora = agora.toLocaleTimeString('pt-BR', { hour12: false });

    const query = `
      UPDATE quartos_status 
      SET status = ?, data = ?, hora_atualizacao = ?
      WHERE numero_quarto = ?;
    `;

    const params = [status, data, hora, numero_quarto];
    await clientCass.execute(query, params, { prepare: true });

    console.log(`✅ Quarto ${numero_quarto} atualizado para "${status}" às ${hora} (${data})`);
  } catch (err) {
    console.error('❌ Erro ao atualizar status:', err);
  }
}


// Rota para atualizar status
app.post('/atualizar-status', async (req, res) => {
  const { numero_quarto, status } = req.body;
  try {
    await atualizarStatus(numero_quarto, status);
    res.status(200).json({ mensagem: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('❌ Erro na rota /atualizar-status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Inserir novo status manualmente
async function adicionarStatus(numero_quarto, status) {
  try {
    const agora = new Date();
    const data = agora.toISOString().split('T')[0];
    const hora = agora.toLocaleTimeString('pt-BR', { hour12: false });

    const query = `
      INSERT INTO quartos_status (numero_quarto, data, hora_atualizacao, status)
      VALUES (?, ?, ?, ?);
    `;

    const params = [numero_quarto, data, hora, status];
    await clientCass.execute(query, params, { prepare: true });

    console.log(`✅ Novo status inserido: quarto ${numero_quarto} → "${status}" (${data} às ${hora})`);
  } catch (err) {
    console.error('❌ Erro ao inserir novo status:', err);
  }
}

// Excluir status de um quarto
async function excluirStatus(numero_quarto) {
  try {
    const query = `
      DELETE FROM quartos_status 
      WHERE numero_quarto = ?;
    `;
    await clientCass.execute(query, [numero_quarto], { prepare: true });
    console.log(`🗑️ Registro do quarto ${numero_quarto} excluído com sucesso.`);
  } catch (err) {
    console.error('❌ Erro ao excluir status:', err);
  }
}


// ===============================
// 🔹 Inicialização do servidor
// ===============================
app.listen(port, () =>
  console.log(`🚀 Servidor rodando na porta ${port}`)
);
