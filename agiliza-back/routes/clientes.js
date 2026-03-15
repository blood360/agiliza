const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido'); // 👈 Pega onde os pedidos estão

// 📊 ROTA DE INTELIGÊNCIA: Agrupar Pedidos por Cliente
router.get('/', async (req, res) => {
    try {
        const { lojaId } = req.query;
        if (!lojaId) return res.status(400).json({ erro: "Faltou o ID da loja!" });

        // Mágica do MongoDB: Agrupamento
        const clientes = await Pedido.aggregate([
            { $match: { lojaId: lojaId } }, // Filtra os pedidos da loja
            { 
                $group: { 
                    _id: "$whatsapp", // Agrupa pelo Zap do cliente
                    nome: { $first: "$nome" }, // Pega o primeiro nome que encontrar
                    totalGasto: { $sum: "$total" }, // Soma tudo que ele já gastou
                    qtdPedidos: { $sum: 1 }, // Conta quantos pedidos ele fez
                    ultimoPedido: { $max: "$createdAt" } // Pega a data do mais recente
                } 
            },
            { $sort: { totalGasto: -1 } } // Coloca quem gasta mais no topo! 👑
        ]);

        res.json(clientes);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao processar CRM: " + err.message });
    }
});

module.exports = router;