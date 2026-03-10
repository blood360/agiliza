const express = require('express');
const router = express.Router();
const Assinante = require('../models/Assinante');

// 🔍 1. BUSCAR POR SLUG (Essa tem que ser a PRIMEIRA!)
// URL: http://localhost:5000/api/assinantes/loja/:slug
router.get('/loja/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const loja = await Assinante.findOne({ slug: slug });
        
        if (!loja) {
            return res.status(404).json({ erro: "Macho, essa loja não tá no banco!" });
        }
        
        res.json(loja);
    } catch (err) {
        res.status(500).json({ erro: "Erro no servidor: " + err.message });
    }
});

// 📋 2. BUSCAR TODOS
router.get('/', async (req, res) => {
    try {
        const assinantes = await Assinante.find();
        res.json(assinantes);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 🚀 3. CRIAR NOVO
router.post('/', async (req, res) => {
    try {
        const { loja, dono, plano, vencimento, whatsapp } = req.body;
        const slug = loja.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        
        const novo = new Assinante({ loja, slug, dono, plano, vencimento, whatsapp });
        const salvo = await novo.save();
        res.status(201).json(salvo);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// 📝 4. ATUALIZAR (PUT)
router.put('/:id', async (req, res) => {
    try {
        const atualizado = await Assinante.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(atualizado);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// 🗑️ 5. DELETAR
router.delete('/:id', async (req, res) => {
    try {
        await Assinante.findByIdAndDelete(req.params.id);
        res.json({ mensagem: "Apagado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;