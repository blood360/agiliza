const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true // Garante que o e-mail sempre seja salvo em minúsculo
    },
    senha: { 
        type: String, 
        required: true 
    },
    telefone: { 
        type: String, 
        required: true 
    },
    
    // --- CAMPOS PARA ENTREGA EM MAGÉ ---
    // Agora o banco sabe onde guardar esses dados!
    endereco: { 
        type: String, 
        default: '' 
    },
    referencia: { 
        type: String, 
        default: '' 
    },
    // -----------------------------------

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
}, { 
    timestamps: true // Cria automaticamente o 'createdAt' e 'updatedAt'
});

module.exports = mongoose.model('Usuario', UsuarioSchema);