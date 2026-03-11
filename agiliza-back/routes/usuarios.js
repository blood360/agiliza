const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// --- MIDDLEWARE DE AUTENTICAÇÃO (O GUARDA DA AS AUTOMAÇÕES) ---
// Ele verifica se o token é válido antes de deixar passar para o perfil
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_as_automacoes');
        
        req.usuario = decoded; // Salva os dados do usuário (id e tipo) na requisição
        next();
    } catch (err) {
        res.status(401).json({ erro: "Token inválido ou expirado." });
    }
};

// --- ROTA DE PERFIL (A QUE ESTAVA FALTANDO!) ---
router.get('/perfil', auth, async (req, res) => {
    try {
        // Busca o usuário pelo ID que veio no Token, removendo a senha por segurança
        const usuario = await Usuario.findById(req.usuario.id).select('-senha');
        
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

        // Retorna o objeto completo (nome, email, telefone, endereco, referencia...)
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar perfil: " + err.message });
    }
});

const bcrypt = require('bcrypt'); // Garante que a senha seja criptografada

// 🔑 ROTA PARA O MASTER ADMIN GERAR ACESSO AO LOJISTA
router.post('/registrar-lojista-self', async (req, res) => {
    try {
        const { nome, email, senha, telefone, lojaId } = req.body;

        // 1. Verifica se o e-mail já existe
        const lojaExiste = await Assinante.findById(lojaId);
        if (!lojaExiste) {
            return res.status(400).json({ erro: "Dessculpe esse código de loja não está autorizado." });
        }

        const donoExistente = await Usuario.findOne({ lojaId });
        if(donoExistente) {
            return res.status(400).json({erro: "Essa loja já está cadastrada."});
        }

        /// -- verifica se o email está em uso --
        const emailUsado = await Usuario.findeOne({ email });
        if(emailUsado) return res.status(400).json({erro: "Este email já está sendo usado!"});

        // 2. Criptografa a senha (Segurança em primeiro lugar!)
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 3. Cria o novo usuário com o "DNA" da loja
        const novoLojista = new Usuario({
            nome,
            email,
            senha: senhaHash,
            telefone,
            tipo: 'lojista',
            lojaId           // Aqui é o vínculo com a loja que criei
        });

        await novoLojista.save();
        res.status(201).json({ mensagem: "Acesso do lojista criado com sucesso! 🚀" });

    } catch (err) {
        console.error("Erro ao registrar lojista:", err);
        res.status(500).json({ erro: "Erro interno: " + err.message });
    }
});

// --- ROTA PARA REGISTRAR (MANTIDA ORIGINAL) ---
router.post('/registrar', async (req, res) => {
    try {
        const { nome, email, senha, telefone } = req.body;

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) return res.status(400).json({ erro: "Este e-mail já está cadastrado." });

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const novoUsuario = new Usuario({
            nome,
            email,
            senha: senhaCriptografada,
            telefone,
            tipo: 'cliente'
        });

        await novoUsuario.save();
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao registrar: " + err.message });
    }
});

// --- ROTA PARA ATUALIZAR DADOS DO PERFIL (NOME, TEL, ENDEREÇO, REF) ---
router.put('/perfil', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const camposPermitidos = ['nome', 'telefone', 'endereco', 'referencia'];
        const operacaoValida = updates.every(update => camposPermitidos.includes(update));

        if (!operacaoValida) {
            return res.status(400).send({ erro: 'Atualização inválida!' });
        }

        const usuario = await Usuario.findById(req.usuario.id);
        
        updates.forEach(update => usuario[update] = req.body[update]);
        await usuario.save();

        res.send(usuario);
    } catch (e) {
        res.status(400).send({ erro: "Erro ao atualizar perfil: " + e.message });
    }
});

// --- ROTA PARA LOGIN (MANTIDA ORIGINAL) ---
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ erro: "E-mail ou senha incorretos." });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(400).json({ erro: "E-mail ou senha incorretos." });

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