import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import Quartos from  "./schemaQuartos.js"
import cors from 'cors';
import cassandra from "cassandra-driver";


dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

  

const clientCass = new cassandra.Client({
  contactPoints: ["127.0.0.1"], 
  localDataCenter: "datacenter1", 
  keyspace: "hotel_status" 
});

export default clientCass;

async function run() {
  try {
    await clientCass.connect();
    console.log("✅ Conectado ao Cassandra!");

    const result = await clientCass.execute("SELECT * FROM system.local");
    console.log("Versão Cassandra:", result.rows[0].release_version);
  } catch (err) {
    console.error("❌ Erro de conexão:", err);
  } finally {

  }
}

run();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conectado ao mongoDB");
    }catch(error){
        console.log("Não conectado ao mongoDB",error);

    }
};
connectDB();

//funções do mongo (add e ler)

app.post("/inserirQuarto",async (req,res) => {
    try{
        const novoQuarto = await Quartos.create(req.body);
        res.json(novoQuarto);
    }catch(error){
        res.send(error);
    }
});

app.get("/quartos", async (req, res) => {
  try {
    // 1️⃣ Busca todos os quartos no MongoDB
    const quartosMongo = await Quartos.find();

    // 2️⃣ Para cada quarto, busca o status correspondente no Cassandra
    const quartosComStatus = await Promise.all(
      quartosMongo.map(async (q) => {
        try {
          const result = await clientCass.execute(
            "SELECT status FROM quartos_status WHERE numero_quarto = ?",
            [q.numero],
            { prepare: true }
          );

          // Se encontrou no Cassandra, usa o status; senão, define como "indisponível"
          const status =
            result.rowLength > 0 ? result.rows[0].status : "indisponível";

          // Retorna o quarto com a disponibilidade atualizada
          return {
            ...q.toObject(),
            disponibilidade: status,
          };
        } catch (err) {
          console.error(`Erro ao buscar status do quarto ${q.numero}:`, err);
          return {
            ...q.toObject(),
            disponibilidade: "erro",
          };
        }
      })
    );

    // 3️⃣ Retorna tudo pro front
    res.json(quartosComStatus);
  } catch (error) {
    console.error("Erro ao listar quartos:", error);
    res.status(500).json({ error: "Erro ao listar quartos" });
  }
});
//aqui teremos as funções do cassandra (CRUD)

async function listarQuartos(numero_quarto) {
  await clientCass.connect();
  const result = await clientCass.execute("SELECT status FROM quartos_status WHERE numero_quarto = ?",[numero_quarto],{prepare: true});
  console.log(result.rows);
  return result.rows;
}

app.get('/disponibilidade', async (req, res) => {
  const { numero_quarto} = req.body;
  await listarQuartos(numero_quarto);
  res.send('Status sucesso');
});

//listarQuartos();

async function atualizarStatus(numero_quarto, status) {
  try {

    const agora = new Date();
    const data = agora.toISOString().split('T')[0]; // "2025-11-06"
    const hora = agora.toLocaleTimeString('pt-BR', { hour12: false }); // "22:00:00"

    const query = `
      UPDATE quartos_status 
      SET status = ?, data = ?, hora_atualizacao = ?
      WHERE numero_quarto = ?;
    `;

    const params = [status, data, hora, numero_quarto];

    await clientCass.execute(query, params, { prepare: true });
    console.log(`✅ Quarto ${numero_quarto} atualizado para "${status}" às ${hora} (${data})`);
  } catch (err) {
    console.error('❌ Erro ao atualizar:', err);
  }
}

app.post('/atualizar-status', async (req, res) => {
  const { numero_quarto, status } = req.body;
  await atualizarStatus(numero_quarto, status);
  res.status(200).json({ 
        mensagem: "Status atualizado com sucesso" 
    });
});




async function adicionarStatus(numero_quarto, status) {
  try {
    // Data e hora atuais
    const agora = new Date();
    const data = agora.toISOString().split('T')[0]; // "2025-11-06"
    const hora = agora.toLocaleTimeString('pt-BR', { hour12: false }); // "22:00:00"

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

//adicionarStatus(305, 'manutenção');

async function excluirStatus(numero_quarto) {
  try {
    const query = `
      DELETE FROM quartos_status 
      WHERE numero_quarto = ?;
    `;

    await clientCass.execute(query, [numero_quarto], { prepare: true });
    console.log(`🗑️  Registro do quarto ${numero_quarto} excluído com sucesso.`);
  } catch (err) {
    console.error('❌ Erro ao excluir status:', err);
  }
}

//excluirStatus(305);


app.listen(port,() => console.log(`O servidor está rodando na porta ${port}`));