const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');

// 📋 1. LISTAR PRODUTOS (Sincronizado com o nosso Frontend)
// Agora ele aceita: /api/produtos?lojaId=ID_DA_LOJA
router.get('/', async (req, res) => {
    try {
        const { lojaId } = req.query; // 👈 Pega o que vem depois do '?'

        if (!lojaId || lojaId === 'null') {
            return res.json([]);
        }

        // Busca só os produtos daquela loja e organiza por categoria
        const produtos = await Produto.find({ lojaId }).sort({ categoria: 1 });
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar produtos: " + err.message });
    }
});

// 🚀 2. CADASTRAR NOVO PRODUTO (DNA da loja garantido)
router.post('/', async (req, res) => {
    try {
        const { nome, preco, descricao, categoria, lojaId, imagem } = req.body;

        if (!nome || !preco || !lojaId) {
            return res.status(400).json({ erro: "Macho, preencha o nome, preço e a loja!" });
        }

        const novoProduto = new Produto({
            nome,
            preco,
            descricao,
            categoria,
            lojaId,
            imagem // Aqui o Base64 que o lojista enviou
        });

        const salvo = await novoProduto.save();
        res.status(201).json(salvo);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao salvar produto: " + err.message });
    }
});

// 🗑️ 3. DELETAR PRODUTO (Limpeza total)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const removido = await Produto.findByIdAndDelete(id);
        
        if (!removido) return res.status(404).json({ erro: "Produto não encontrado no banco." });
        
        res.json({ mensagem: "Produto removido com sucesso! 🗑️" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao remover: " + err.message });
    }
});

module.exports = router;