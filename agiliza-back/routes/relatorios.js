const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

// 📊 GERAÇÃO DE RELATÓRIO GERAL
router.get('/geral', async (req, res) => {
    try {
        const { lojaId } = req.query;
        if (!lojaId) return res.status(400).json({ erro: "Faltou o ID da loja!" });

        // 1. Faturamento Total e Quantidade de Pedidos
        const resumo = await Pedido.aggregate([
            { $match: { lojaId: lojaId } },
            { 
                $group: { 
                    _id: null, 
                    totalFaturado: { $sum: "$total" },
                    qtdPedidos: { $sum: 1 }
                } 
            }
        ]);

        // 2. Top 5 Produtos Mais Vendidos
        const topProdutos = await Pedido.aggregate([
            { $match: { lojaId: lojaId } },
            { $unwind: "$itens" }, // Abre a lista de itens do pedido
            { 
                $group: { 
                    _id: "$itens.nome", 
                    quantidade: { $sum: "$itens.quantidade" } 
                } 
            },
            { $sort: { quantidade: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            faturamento: resumo[0]?.totalFaturado || 0,
            pedidos: resumo[0]?.qtdPedidos || 0,
            ticketMedio: resumo[0] ? (resumo[0].totalFaturado / resumo[0].qtdPedidos).toFixed(2) : 0,
            topProdutos
        });
    } catch (err) {
        res.status(500).json({ erro: "Erro no relatório: " + err.message });
    }
});

module.exports = router;