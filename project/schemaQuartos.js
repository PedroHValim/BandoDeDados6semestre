import mongoose, { mongo } from 'mongoose';

const QuartosSchema = new mongoose.Schema({
    numero: Number,
    descricao: String,
    comodidades: String,
    preco_diaria: Number,
    disponibilidade: String,
})

export default mongoose.model("Quartos", QuartosSchema);