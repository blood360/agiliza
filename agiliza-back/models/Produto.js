const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    preco: { type: Number, required: true },
    descricao: { type: String },
    imagem: { type: String },
    categoria: { type: String, default: 'Geral' },
    disponivel: { type: Boolean, default: true },

    // 🍟 VENDA SUGERIDA (O segredo do lucro!)
    // Aqui a gente guarda o ID de outro produto que combina com este
    sugestaoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Produto', 
        default: null 
    },
    // A frase matadora pra convencer o cliente
    sugestaoMensagem: { 
        type: String, 
        default: 'Esse lanche combina com...' 
    },
    
    // 🔗 O DNA DA LOJA: Vincula o produto ao dono dele
    lojaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assinante', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.models.Produto || mongoose.model('Produto', ProdutoSchema);