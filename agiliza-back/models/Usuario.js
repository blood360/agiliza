const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    senha: { 
        type: String, 
        required: true 
    },
    telefone: { 
        type: String, 
        required: true 
    },
    tipo: { 
        type: String, 
        enum: ['cliente', 'lojista', 'admin'], 
        default: 'cliente' 
    },
    lojaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assinante', 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);