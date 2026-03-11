const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const assinantesRoutes = require('./routes/assinantes');
const pedidosRoutes = require('./routes/pedidos');
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');

const app = express();

// 🛡️ 1. CONFIGURAÇÃO DO CORS (Liberando pra Vercel e outros)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📦 2. MIDDLEWARES DE PARSE (Essencial para ler o que vem do Frontend)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // 👈 ADICIONE ISSO! Ajuda a ler dados de formulários

// 🔍 3. DEDO-DURO (Middleware de Log para teste - pode apagar depois)
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log(`📡 Recebendo POST em ${req.url}:`, req.body);
    }
    next();
});

// 🛣️ 4. DEFINIÇÃO DAS ROTAS
app.use('/api/assinantes', assinantesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/produtos', produtosRoutes);

// 🗄️ 5. CONEXÃO COM O MONGODB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Banco de dados conectado com sucesso."))
    .catch((err) => {
        console.error("❌ Erro ao conectar ao MongoDB: ", err);
    });

// 🏠 ROTA INICIAL
app.get('/', (req, res) => {
    res.send("Backend da AS Automações funcionando a todo vapor! 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Servidor rodando na porta ${PORT}.`);
});