const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Assinante = require('../models/Assinante');

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_as_automacoes');
        
        req.usuario = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ erro: "Token inválido ou expirado." });
    }
};

// --- ROTA DE PERFIL (BUSCA) ---
router.get('/perfil', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-senha');
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar perfil: " + err.message });
    }
});

// --- ROTA PARA ATUALIZAR PERFIL (A MÁGICA TÁ AQUI!) ---
router.put('/perfil', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        
        // 🛡️ ADICIONADOS OS NOVOS CAMPOS NA LISTA DE PERMISSÃO
        const camposPermitidos = ['nome', 'telefone', 'rua', 'numero', 'bairro', 'referencia', 'endereco'];
        
        const operacaoValida = updates.every(update => camposPermitidos.includes(update));

        if (!operacaoValida) {
            return res.status(400).send({ erro: 'Vixe! Tu tá tentando salvar um campo que não existe no sistema.' });
        }

        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

        updates.forEach(update => usuario[update] = req.body[update]);
        await usuario.save();

        res.send(usuario);
    } catch (e) {
        res.status(400).send({ erro: "Erro ao atualizar perfil: " + e.message });
    }
});

// 🔑 ROTA PARA O AUTO-REGISTRO DO LOJISTA
router.post('/registrar-lojista-self', async (req, res) => {
    try {
        const { nome, email, senha, telefone, lojaId } = req.body;

        if (!email || !senha || !lojaId) {
            return res.status(400).json({ erro: "Macho, falta dado! E-mail, senha e ID da loja são obrigatórios." });
        }

        const lojaExiste = await Assinante.findById(lojaId);
        if (!lojaExiste) return res.status(400).json({ erro: "Código de loja não autorizado." });

        const donoExistente = await Usuario.findOne({ lojaId });
        if(donoExistente) return res.status(400).json({erro: "Essa loja já tem um dono!"});

        const emailUsado = await Usuario.findOne({ email });
        if(emailUsado) return res.status(400).json({erro: "Este e-mail já está em uso!"});

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoLojista = new Usuario({
            nome,
            email,
            senha: senhaHash,
            telefone,
            tipo: 'lojista',
            lojaId 
        });

        await novoLojista.save();
        res.status(201).json({ mensagem: "Acesso criado com sucesso! 🚀" });

    } catch (err) {
        res.status(500).json({ erro: "Erro interno: " + err.message });
    }
});

// --- ROTA PARA REGISTRAR CLIENTE ---
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
        res.status(201).json({ mensagem: "Usuário cadastrado!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao registrar: " + err.message });
    }
});

// --- ROTA PARA LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const emailLimpo = email.trim().toLowerCase();
        const usuario = await Usuario.findOne({ email: emailLimpo });
        
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
                email: usuario.email,
                lojaId: usuario.lojaId
            }
        });
    } catch (err) {
        res.status(500).json({ erro: "Erro no servidor: " + err.message });
    }
});

module.exports = router;