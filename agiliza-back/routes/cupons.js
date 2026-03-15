const express = require('express');
const router = express.Router();
const Cupom = require('../models/Cupom');

// 🚀 Criar novo cupom (Painel do Lojista)
router.post('/', async (req, res) => {
    try {
        const novo = new Cupom(req.body);
        await novo.save();
        res.status(201).json(novo);
    } catch (err) {
        res.status(400).json({ erro: "Vixe! Erro ao criar cupom: " + err.message });
    }
});

// 🔍 Validar cupom (Checkout do Cliente)
router.post('/validar', async (req, res) => {
    const { codigo, lojaId, totalPedido } = req.body;
    try {
        const cupom = await Cupom.findOne({ codigo, lojaId, ativo: true });

        if (!cupom) return res.status(404).json({ erro: "Cupom não encontrado ou expirado, macho!" });
        if (new Date() > cupom.vencimento) return res.status(400).json({ erro: "Esse cupom já venceu!" });
        if (totalPedido < cupom.usoMinimo) return res.status(400).json({ erro: `O pedido mínimo para esse cupom é R$ ${cupom.usoMinimo}` });

        res.json({ mensagem: "Cupom aplicado! 🎉", tipo: cupom.tipo, valor: cupom.valor });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao validar cupom." });
    }
});

module.exports = router;