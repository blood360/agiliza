const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const assinantesRoutes = require('./routes/assinantes');
const pedidosRoutes = require('./routes/pedidos');
const usuariosRoutes = require('./routes/usuarios'); // Nova rota de autenticação

const app = express();

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Definição das rotas da API
app.use('/api/assinantes', assinantesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/usuarios', usuariosRoutes); // Ativando o sistema de usuários

// -- CONEXÃO COM O BANCO DE DADOS (MongoDB) --
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Banco de dados conectado com sucesso."))
    .catch((err) => console.log("Erro ao conectar ao MongoDB: ", err));

// -- ROTA INICIAL DE TESTE --
app.get('/', (req, res) => {
    res.send("Backend da AS Automações funcionando a todo vapor!");
});

// Configuração da porta e inicialização do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Servidor rodando na porta ${PORT}.`);
});