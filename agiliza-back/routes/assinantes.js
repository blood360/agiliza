const express = require('express');
const router = express.Router();
const Assinante = require('../models/Assinante');

// 🔍 1. BUSCAR POR SLUG
router.get('/loja/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const loja = await Assinante.findOne({ slug: slug });
        
        if (!loja) {
            return res.status(404).json({ erro: "Macho, essa loja não tá no banco!" });
        }
        
        res.json(loja);
    } catch (err) {
        console.error("❌ Erro no GET SLUG:", err);
        res.status(500).json({ erro: "Erro no servidor: " + err.message });
    }
});

// 📋 2. BUSCAR TODOS
router.get('/', async (req, res) => {
    try {
        // O sort ajuda a ver os novos primeiro
        const assinantes = await Assinante.find().sort({ createdAt: -1 });
        
        res.json(assinantes || []); 
    } catch (err) {
        
        console.error("❌ ERRO CRÍTICO NO GET ASSINANTES:", err);
        res.status(500).json({ erro: "Erro ao buscar no banco: " + err.message });
    }
});

// 🔍 6. BUSCAR POR ID (Essencial para o Dashboard do Lojista)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const loja = await Assinante.findById(id);
        
        if (!loja) {
            return res.status(404).json({ erro: "Macho, essa loja não existe no banco!" });
        }
        res.json(loja);
    } catch (err) {
        console.error("❌ Erro no GET por ID:", err);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

// 🚀 3. CRIAR NOVO
router.post('/', async (req, res) => {
    try {
        const { loja, dono, plano, whatsapp, vencimento } = req.body;

        if (!loja || !dono) {
            return res.status(400).json({ erro: "Macho, faltou nome da loja ou do dono!" });
        }

        // 📅 Lógica de Vencimento corrigida para evitar "Invalid Date"
        let dataFinal;
        if (!vencimento || vencimento === "") {
            dataFinal = new Date();
            dataFinal.setDate(dataFinal.getDate() + 30);
        } else {
            dataFinal = new Date(vencimento);
        }

        // 🔗 Gerador de Slug blindado
        const slug = loja.toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const novo = new Assinante({ 
            loja, 
            slug, 
            dono, 
            plano: plano || 'Iniciante', 
            vencimento: dataFinal, 
            whatsapp: whatsapp || '' 
        });

        const salvo = await novo.save();
        res.status(201).json(salvo);
    } catch (err) {
        console.error("❌ ERRO AO SALVAR ASSINANTE:", err);
        res.status(400).json({ erro: "Vixe! Erro ao salvar: " + err.message });
    }
});

// 📝 4. ATUALIZAR (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;

        const loja = await Assinante.findByIdAndUpdate(id, dadosAtualizados, { new: true });

        if (!loja) {
            return res.status(404).json({ erro: "Não consegui achar essa loja pra atualizar." });
        }

        res.json({ mensagem: "Loja atualizada com sucesso! 🚀", loja });
    } catch (err) {
        console.error("❌ Erro no PUT por ID:", err);
        res.status(500).json({ erro: "Erro ao atualizar dados." });
    }
});

// 🗑️ 5. DELETAR
router.delete('/:id', async (req, res) => {
    try {
        await Assinante.findByIdAndDelete(req.params.id);
        res.json({ mensagem: "Apagado com sucesso!" });
    } catch (err) {
        console.error("❌ ERRO NO DELETE ASSINANTE:", err);
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;