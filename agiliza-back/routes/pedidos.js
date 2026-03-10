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

router.get('/meus-pedidos', auth, async (req, res) => {
    try {
        // Busca pedidos vinculados ao ID do usuário que vem do token (auth middleware)
        const pedidos = await Pedido.find({ usuarioId: req.usuario.id }).sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar pedidos." });
    }
});
module.exports = router;