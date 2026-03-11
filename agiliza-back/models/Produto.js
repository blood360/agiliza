const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    preco: { type: Number, required: true },
    descricao: { type: String },
    imagem: { type: String },
    categoria: { type: String, default: 'Geral' },
    disponivel: { type: Boolean, default: true },
    
    // 🔗 O DNA DA LOJA: Vincula o produto ao dono dele
    lojaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assinante', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.models.Produto || mongoose.model('Produto', ProdutoSchema);