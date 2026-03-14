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
        lowercase: true 
    },
    senha: { 
        type: String, 
        required: true 
    },
    telefone: { 
        type: String, 
        required: true 
    },
    
    // --- 📍 LOGÍSTICA DE ENTREGA AS AUTOMAÇÕES ---
    // Fatiamos o endereço para o motoboy não se perder!
    rua: { 
        type: String, 
        default: '' 
    },
    numero: { 
        type: String, 
        default: '' 
    },
    bairro: { 
        type: String, 
        default: '' 
    },
    referencia: { 
        type: String, 
        default: '' 
    },
    // Mantemos esse aqui por enquanto para compatibilidade, 
    // mas o foco agora é nos campos acima!
    endereco: { 
        type: String, 
        default: '' 
    },
    // ---------------------------------------------

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
    timestamps: true 
});

module.exports = mongoose.model('Usuario', UsuarioSchema);