import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import Quartos from  "./schemaQuartos.js"
import cors from 'cors';
import { DataAPIClient } from "@datastax/astra-db-ts";


dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

  
// Initialize the client
const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, { keyspace: "default_keyspace" });


const connectCass = async () => {
    try{
        const colls = await db.listCollections();
        console.log('Conectado ao AstraDB:', colls);
}catch(error){
    console.log("Não conectado ao AstraDB",error);
    }
};
connectCass();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conectado ao mongoDB");
    }catch(error){
        console.log("Não conectado ao mongoDB",error);

    }
};
connectDB();

app.post("/inserirQuarto",async (req,res) => {
    try{
        const novoQuarto = await Quartos.create(req.body);
        res.json(novoQuarto);
    }catch(error){
        res.send(error);
    }
});

app.get("/quartos", async (req,res) => {
    try{
        const quartos = await Quartos.find();
        res.json(quartos) ;
    }catch(error){
        res.json({error : error});
    }
})


app.listen(port,() => console.log(`O servidor está rodando na porta ${port}`));