const mongoose = require('mongoose');

const AssinanteSchema = new mongoose.Schema({
    loja: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    dono: { type: String, required: true },
    plano: { type: String, enum: ['Iniciante', 'Pro'], default: 'Iniciante' },
    status: { type: String, enum: ['Ativo', 'Inadimplente', 'Bloqueado', 'Teste'], default: 'Ativo' },
    vencimento: { type: Date, required: true },
    whatsapp: { type: String, default: '' },
    //ADICIONEI ESSES CAMPOS SE QUEBRAR VENHO AQUI
    valorMinimo: {
        type: Number,
        default: 0
    },
    taxaEntrega: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.models.Assinante || mongoose.model('Assinante', AssinanteSchema);