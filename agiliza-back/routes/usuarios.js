const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Rota para registrar novo usuário (Sempre nasce como 'cliente')
router.post('/registrar', async (req, res) => {
    try {
        const { nome, email, senha, telefone } = req.body;

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) return res.status(400).json({ erro: "Este e-mail já está cadastrado." });

        // Criptografia da senha para segurança da base
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = new Usuario({
            nome,
            email,
            senha: senhaCriptografada,
            telefone,
            tipo: 'cliente' // Padrão inicial por segurança
        });

        await novoUsuario.save();
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao registrar: " + err.message });
    }
});

// Rota para realizar login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ erro: "E-mail ou senha incorretos." });

        // Verifica se a senha bate com a criptografada
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(400).json({ erro: "E-mail ou senha incorretos." });

        // Gera o Token de acesso (JWT)
        const token = jwt.sign(
            { id: usuario._id, tipo: usuario.tipo },
            process.env.JWT_SECRET || 'secret_as_automacoes',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                tipo: usuario.tipo,
                email: usuario.email
            }
        });
    } catch (err) {
        res.status(500).json({ erro: "Erro no servidor: " + err.message });
    }
});

module.exports = router;