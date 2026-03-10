const express = require('express');
const router = express.Router();

// Rota de teste pros pedidos
router.get('/', (req, res) => {
    res.json({ mensagem: "Macho, a rota de pedidos tá pronta pro combate!" });
});

module.exports = router;