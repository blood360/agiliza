const express = require('express');
const router = express.Router();
const Assinante = require('../models/Assinante');

// 🔍 1. BUSCAR POR SLUG (Vitrine do Cliente)
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

// 📋 2. BUSCAR TODOS (Com Filtro por Cidade para não mandar rango pra SP! 😂)
router.get('/', async (req, res) => {
    try {
        const { cidade } = req.query; // 👈 Pega a cidade da URL (ex: ?cidade=Magé)
        
        let filtro = { status: 'Ativo' }; // Só mostra quem tá ativo

        // Se o cliente informar a cidade, a gente filtra no banco
        if (cidade) {
            filtro.cidade = { $regex: new RegExp(cidade, "i") }; // "i" ignora maiúsculo/minúsculo
        }

        const assinantes = await Assinante.find(filtro).sort({ createdAt: -1 });
        res.json(assinantes || []); 
    } catch (err) {
        console.error("❌ ERRO CRÍTICO NO GET ASSINANTES:", err);
        res.status(500).json({ erro: "Erro ao buscar no banco: " + err.message });
    }
});

// 🔍 3. BUSCAR POR ID (Dashboard do Lojista)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (id === "null" || !id) return res.status(400).json({ erro: "ID inválido" });

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

// 🚀 4. CRIAR NOVO (Adicionado cidade e estado no cadastro)
router.post('/', async (req, res) => {
    try {
        const { loja, dono, plano, whatsapp, vencimento, cidade, estado } = req.body;

        if (!loja || !dono) {
            return res.status(400).json({ erro: "Macho, faltou nome da loja ou do dono!" });
        }

        let dataFinal = vencimento ? new Date(vencimento) : new Date();
        if (!vencimento) dataFinal.setDate(dataFinal.getDate() + 30);

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
            whatsapp: whatsapp || '',
            cidade: cidade || 'Magé', // Padrão se não vier nada
            estado: estado || 'RJ',
            status: 'Ativo'
        });

        const salvo = await novo.save();
        res.status(201).json(salvo);
    } catch (err) {
        console.error("❌ ERRO AO SALVAR ASSINANTE:", err);
        res.status(400).json({ erro: "Vixe! Erro ao salvar: " + err.message });
    }
});

// 📝 5. ATUALIZAR (Versão Sênior que tu já aprovou)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lojaAtualizada = await Assinante.findByIdAndUpdate(
            id, 
            { $set: req.body }, 
            { new: true, runValidators: false }
        );

        if (!lojaAtualizada) {
            return res.status(404).json({ erro: "Achei essa loja não, macho!" });
        }

        res.json({ mensagem: "Loja atualizada! 🚀", loja: lojaAtualizada });
    } catch (err) {
        console.error("🔥 ERRO NO BACKEND:", err.message);
        res.status(500).json({ erro: "Erro interno: " + err.message });
    }
});

// 🗑️ 6. DELETAR
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