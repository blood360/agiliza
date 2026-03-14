const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const jwt = require('jsonwebtoken');

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) return res.status(401).json({ erro: "Macho, cadê o token?" });

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_as_automacoes');
        req.usuarioId = decoded.id; 
        next();
    } catch (e) {
        res.status(401).send({ erro: 'Autentique-se, abençoado!' });
    }
};

// 🎯 BUSCAR PEDIDOS DA LOJA (Painel do Lojista)
router.get('/', async (req, res) => {
    try {
        const { lojaId } = req.query;
        if (!lojaId || lojaId === "null") return res.json([]);
        
        // Buscamos os pedidos e já trazemos os mais novos primeiro
        const pedidos = await Pedido.find({ lojaId }).sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao carregar pedidos da loja." });
    }
});

// --- BUSCAR HISTÓRICO DO CLIENTE ---
router.get('/meus-pedidos', auth, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuarioId: req.usuarioId }).sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar seu histórico." });
    }
});

// --- 🚀 SALVAR NOVO PEDIDO (VERSÃO TURBINADA) ---
router.post('/novo', auth, async (req, res) => {
    try {
        // Agora recebemos a 'observacao' que vem lá do Checkout.js
        const { 
            lojaId, 
            itens, 
            subtotal, 
            taxaEntrega, 
            total, 
            cliente, 
            pagamento, 
            observacao 
        } = req.body;

        const novoPedido = new Pedido({
            lojaId,
            usuarioId: req.usuarioId,
            itens, // Já vem agrupado do frontend (ex: 5x Cerveja)
            subtotal,
            taxaEntrega,
            total,
            cliente: {
                nome: cliente.nome,
                whatsapp: cliente.whatsapp,
                rua: cliente.rua,
                numero: cliente.numero,
                bairro: cliente.bairro,
                referencia: cliente.referencia
            },
            pagamento: {
                metodo: pagamento.metodo,
                trocoPara: pagamento.trocoPara
            },
            observacao: observacao || '',
            status: 'Pendente'
        });

        await novoPedido.save();
        
        // Retornamos o pedido salvo para o frontend poder usar o ID se precisar
        res.status(201).json({ mensagem: "Pedido registrado com sucesso! 🚀", pedido: novoPedido });
    } catch (err) {
        console.error("ERRO AO SALVAR PEDIDO:", err.message);
        res.status(400).json({ erro: "Vixe, deu erro ao salvar: " + err.message });
    }
});

// 🛠️ ATUALIZAR STATUS (Para o Lojista gerenciar)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const pedidoAtualizado = await Pedido.findByIdAndUpdate(
            id, 
            { $set: { status } }, 
            { new: true }
        );

        if (!pedidoAtualizado) {
            return res.status(404).json({ erro: "Pedido não encontrado." });
        }

        res.json(pedidoAtualizado);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao atualizar status do pedido." });
    }
});

module.exports = router;