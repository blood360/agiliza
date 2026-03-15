const mongoose = require('mongoose');

const CupomSchema = new mongoose.Schema({
    lojaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assinante', required: true },
    codigo: { type: String, required: true, uppercase: true, trim: true },
    tipo: { type: String, enum: ['fixo', 'porcentagem'], default: 'fixo' },
    valor: { type: Number, required: true },
    vencimento: { type: Date, required: true },
    usoMinimo: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Cupom', CupomSchema);