const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    lojaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assinante', 
        required: true 
    },
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario' 
    }, 
    
    // 📦 ITENS ORGANIZADOS (Acabou a bagunça do "um por um"!)
    itens: [{
        _id: String,
        nome: String,
        preco: Number,
        quantidade: { type: Number, default: 1 } // 👈 Essencial pro "5x Cerveja"
    }],

    subtotal: Number,
    taxaEntrega: Number,
    total: Number,

    // 💰 FINANCEIRO (Onde a mágica do troco acontece)
    pagamento: {
        metodo: { type: String, enum: ['Pix', 'Dinheiro', 'Cartão'], required: true },
        trocoPara: { type: Number, default: null } 
    },

    // 📍 LOGÍSTICA DETALHADA (Pro motoboy chegar rindo)
    cliente: {
        nome: String,
        whatsapp: String,
        rua: String,    // 👈 Fatiado!
        numero: String, // 👈 Fatiado!
        bairro: String, // 👈 Fatiado!
        referencia: String
    },

    // 📝 O RECADO DO CLIENTE
    observacao: { 
        type: String, 
        default: '' 
    },

    status: { 
        type: String, 
        enum: ['Pendente', 'Preparando', 'Saiu para Entrega', 'Entregue', 'Cancelado'],
        default: 'Pendente' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Pedido', PedidoSchema);