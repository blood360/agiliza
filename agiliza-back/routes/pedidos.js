const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const jwt = require('jsonwebtoken');

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_as_automacoes');
        
        // Salvando o ID no request para as rotas usarem
        req.usuarioId = decoded.id; 
        next();
    } catch (e) {
        res.status(401).send({ erro: 'Autentique-se, macho!' });
    }
};

// --- ROTA 1: BUSCAR HISTÓRICO (CORRIGIDA) ---
router.get('/meus-pedidos', auth, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuarioId: req.usuarioId }).sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar pedidos." });
    }
});

// --- ROTA 2: SALVAR NOVO PEDIDO NO BANCO (NOVA!) ---
router.post('/novo', auth, async (req, res) => {
    try {
        const { lojaId, itens, subtotal, total, cliente } = req.body;

        const novoPedido = new Pedido({
            lojaId,
            usuarioId: req.usuarioId,
            itens,
            total,
            cliente,
            status: 'Pendente'
        });

        await novoPedido.save();
        res.status(201).json({ mensagem: "Pedido registrado na AS Automações!", pedido: novoPedido });
    } catch (err) {
        res.status(400).json({ erro: "Vixe! Erro ao salvar pedido: " + err.message });
    }
});

// 🛠️ ROTA QUE FALTAVA: ATUALIZAR STATUS (Aceitar / Concluir)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Recebe 'Preparando' ou 'Entregue'

        const pedidoAtualizado = await Pedido.findByIdAndUpdate(
            id, 
            { $set: { status } }, 
            { new: true }
        );

        if (!pedidoAtualizado) {
            return res.status(404).json({ erro: "Pedido não encontrado no banco." });
        }

        res.json(pedidoAtualizado);
    } catch (err) {
        console.error("Erro ao atualizar status:", err);
        res.status(500).json({ erro: "Erro ao atualizar pedido." });
    }
});

module.exports = router;