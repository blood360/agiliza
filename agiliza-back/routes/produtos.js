const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');

// 📋 1. LISTAR PRODUTOS DE UMA LOJA ESPECÍFICA (O pulo do gato!)
router.get('/loja/:lojaId', async (req, res) => {
    try {
        const { lojaId } = req.params;
        const produtos = await Produto.find({ lojaId }).sort({ categoria: 1 });
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar produtos: " + err.message });
    }
});

// 🚀 2. CADASTRAR NOVO PRODUTO
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
            imagem
        });

        const salvo = await novoProduto.save();
        res.status(201).json(salvo);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao salvar produto: " + err.message });
    }
});

// 🗑️ 3. DELETAR PRODUTO
router.delete('/:id', async (req, res) => {
    try {
        await Produto.findByIdAndDelete(req.params.id);
        res.json({ mensagem: "Produto removido com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;