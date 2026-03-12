const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const jwt = require('jsonwebtoken');

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_as_automacoes');
        req.usuarioId = decoded.id; 
        next();
    } catch (e) {
        res.status(401).send({ erro: 'Autentique-se, macho!' });
    }
};

// 🎯 NOVA ROTA: BUSCAR PEDIDOS DA LOJA (O que estava faltando!)
// Essa rota responde a: GET /api/pedidos?lojaId=...
router.get('/', async (req, res) => {
    try {
        const { lojaId } = req.query;

        if (!lojaId || lojaId === "null") {
            return res.json([]); // Retorna vazio se não tiver ID
        }

        // Busca pedidos daquela loja específica e ordena pelos mais novos
        const pedidos = await Pedido.find({ lojaId }).sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (err) {
        console.error("Erro ao buscar pedidos da loja:", err);
        res.status(500).json({ erro: "Vixe! Erro ao carregar pedidos." });
    }
});

// --- ROTA 1: BUSCAR HISTÓRICO DO CLIENTE ---
router.get('/meus-pedidos', auth, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuarioId: req.usuarioId }).sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar seus pedidos." });
    }
});

// --- ROTA 2: SALVAR NOVO PEDIDO NO BANCO ---
router.post('/novo', auth, async (req, res) => {
    try {
        const { lojaId, itens, subtotal, taxaEntrega, total, cliente, pagamento } = req.body;

        const novoPedido = new Pedido({
            lojaId,
            usuarioId: req.usuarioId,
            itens,
            subtotal,
            taxaEntrega,
            total,
            cliente,
            pagamento,
            status: 'Pendente'
        });

        await novoPedido.save();
        res.status(201).json({ mensagem: "Pedido registrado!", pedido: novoPedido });
    } catch (err) {
        res.status(400).json({ erro: "Erro ao salvar pedido: " + err.message });
    }
});

module.exports = router;