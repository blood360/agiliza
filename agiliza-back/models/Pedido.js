const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    lojaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assinante', required: true },
    // NOVO CAMPO: Referência ao ID do usuário cadastrado
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, 
    itens: Array,
    total: Number,
    cliente: {
        nome: String,
        whatsapp: String,
        endereco: String
    },
    status: { type: String, default: 'Pendente' }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', PedidoSchema);