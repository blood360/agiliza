const express = require('express');
const router = express.Router();
const Cupom = require('../models/Cupom');

// 📋 LISTAR TODOS OS CUPONS DA LOJA (O que estava faltando!)
router.get('/', async (req, res) => {
    try {
        const { lojaId } = req.query;
        if (!lojaId) return res.status(400).json({ erro: "Faltou o ID da loja, macho!" });

        const cupons = await Cupom.find({ lojaId }).sort({ createdAt: -1 });
        res.json(cupons);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar cupons: " + err.message });
    }
});

// 🚀 CRIAR NOVO CUPOM
router.post('/', async (req, res) => {
    try {
        const novo = new Cupom(req.body);
        await novo.save();
        res.status(201).json(novo);
    } catch (err) {
        res.status(400).json({ erro: "Vixe! Erro ao criar cupom: " + err.message });
    }
});

// 🗑️ EXCLUIR CUPOM
router.delete('/:id', async (req, res) => {
    try {
        await Cupom.findByIdAndDelete(req.params.id);
        res.json({ mensagem: "Cupom apagado!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;