const express = require('express');
const router = express.Router();
const Assinante = require('../models/Assinante');

// --- ROTA PARA CADASTRAR (O que o seu as-admin chama) ---
router.post('/', async (req, res) => {
    try {
        const { loja, dono, plano, whatsapp } = req.body;

        // 1. Gera o SLUG automático 
        const slug = loja.toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // 2. Calcula o VENCIMENTO (hoje + 30 dias) já que é obrigatório no Model
        const dataVencimento = new Date();
        dataVencimento.setDate(dataVencimento.getDate() + 30);

        const novoAssinante = new Assinante({
            loja,
            dono,
            slug,
            plano,
            whatsapp: whatsapp || '',
            vencimento: dataVencimento,
            status: 'Ativo'
        });

        await novoAssinante.save();
        res.status(201).json(novoAssinante);
    } catch (err) {
        res.status(400).json({ erro: "Vixe, erro ao salvar: " + err.message });
    }
});

// --- ROTA PARA LISTAR TUDO (Pra sua tabela) ---
router.get('/', async (req, res) => {
    try {
        const lojas = await Assinante.find().sort({ createdAt: -1 });
        res.json(lojas);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar lojas." });
    }
});

module.exports = router;