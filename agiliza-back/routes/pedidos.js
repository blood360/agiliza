const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const jwt = require('jsonwebtoken');

// Middleware de autenticação (igual ao de usuários)
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

// --- ROTA QUE BUSCA OS PEDIDOS DO CLIENTE LOGADO ---
router.get('/meus-pedidos', auth, async (req, res) => {
    try {
        // Busca pedidos onde o campo 'cliente' (ou clienteId) seja igual ao ID do token
        const pedidos = await Pedido.find({ cliente: req.usuarioId }).sort({ createdAt: -1 });
        res.send(pedidos);
    } catch (e) {
        res.status(500).send({ erro: "Erro ao buscar seus pedidos." });
    }
});

module.exports = router;