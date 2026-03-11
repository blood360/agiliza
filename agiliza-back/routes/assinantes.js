const express = require('express');
const router = express.Router();
const Assinante = require('../models/Assinante');

// 🔍 1. BUSCAR POR SLUG (Mantida como primeira para não dar conflito)
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
        const assinantes = await Assinante.find().sort({ createdAt: -1 });
        res.json(assinantes);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// 🚀 3. CRIAR NOVO (COM CÁLCULO AUTOMÁTICO DE VENCIMENTO)
router.post('/', async (req, res) => {
    try {
        const { loja, dono, plano, whatsapp } = req.body;

        // 🛡️ SEGURANÇA: Se não vier vencimento do Admin, a gente cria um de 30 dias
        let dataVencimento = req.body.vencimento;
        if (!dataVencimento) {
            dataVencimento = new Date();
            dataVencimento.setDate(dataVencimento.getDate() + 30);
        }

        // 🔗 GERADOR DE SLUG MELHORADO (Tira acentos e símbolos)
        const slug = loja.toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Tira acentos
            .replace(/[^\w\s-]/g, '') // Tira símbolos
            .replace(/[\s_-]+/g, '-') // Troca espaços por traço
            .replace(/^-+|-+$/g, ''); // Limpa traços nas pontas

        const novo = new Assinante({ 
            loja, 
            slug, 
            dono, 
            plano, 
            vencimento: dataVencimento, 
            whatsapp: whatsapp || '' 
        });

        const salvo = await novo.save();
        res.status(201).json(salvo);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao salvar assinante: " + err.message });
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