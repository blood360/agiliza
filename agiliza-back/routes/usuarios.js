const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Mantendo apenas UM aqui no topo
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Assinante = require('../models/Assinante'); // 👈 Tu esqueceu de importar esse modelo!

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

// --- ROTA DE PERFIL ---
router.get('/perfil', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-senha');
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar perfil: " + err.message });
    }
});

// 🔑 ROTA PARA O AUTO-REGISTRO DO LOJISTA (Blindada!)
router.post('/registrar-lojista-self', async (req, res) => {
    // 🔍 DEBUG: Isso vai mostrar no log do Render o que o servidor recebeu
    console.log("DADOS RECEBIDOS NO BACKEND:", req.body);

    try {
        const { nome, email, senha, telefone, lojaId } = req.body;

        // 🛡️ Validação manual rápida antes de ir pro banco
        if (!email || !senha || !lojaId) {
            return res.status(400).json({ erro: "Macho, falta dado! E-mail, senha e ID da loja são obrigatórios." });
        }

        const lojaExiste = await Assinante.findById(lojaId);
        if (!lojaExiste) {
            return res.status(400).json({ erro: "Desculpe, esse código de loja não existe ou não está autorizado." });
        }

        const donoExistente = await Usuario.findOne({ lojaId });
        if(donoExistente) {
            return res.status(400).json({erro: "Essa loja já tem um dono cadastrado!"});
        }

        // CORRIGIDO: findOne (sem o 'e' no meio)
        const emailUsado = await Usuario.findOne({ email });
        if(emailUsado) return res.status(400).json({erro: "Este e-mail já está sendo usado!"});

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoLojista = new Usuario({
            nome,
            email, // <--- Aqui o Mongoose tava reclamando
            senha: senhaHash,
            telefone,
            tipo: 'lojista',
            lojaId 
        });

        await novoLojista.save();
        res.status(201).json({ mensagem: "Acesso do lojista criado com sucesso! 🚀" });

    } catch (err) {
        console.error("ERRO NO REGISTRO:", err.message);
        res.status(500).json({ erro: "Erro interno no servidor: " + err.message });
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
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao registrar: " + err.message });
    }
});

// --- ROTA PARA ATUALIZAR PERFIL ---
router.put('/perfil', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const camposPermitidos = ['nome', 'telefone', 'endereco', 'referencia'];
        const operacaoValida = updates.every(update => camposPermitidos.includes(update));

        if (!operacaoValida) return res.status(400).send({ erro: 'Atualização inválida!' });

        const usuario = await Usuario.findById(req.usuario.id);
        updates.forEach(update => usuario[update] = req.body[update]);
        await usuario.save();

        res.send(usuario);
    } catch (e) {
        res.status(400).send({ erro: "Erro ao atualizar perfil: " + e.message });
    }
});

// --- ROTA PARA LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        // 1. Garante que o email seja tratado igual no registro
        const emailLimpo = email.trim().toLowerCase();
        
        // 2. Busca o cabra no banco
        const usuario = await Usuario.findOne({ email: emailLimpo });
        
        if (!usuario) {
            return res.status(400).json({ erro: "E-mail ou senha incorretos." });
        }

        // 3. Compara a senha (bcryptjs já importado no topo)
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(400).json({ erro: "E-mail ou senha incorretos." });
        }

        // 4. Gera o Token com ID e Tipo
        const token = jwt.sign(
            { id: usuario._id, tipo: usuario.tipo },
            process.env.JWT_SECRET || 'secret_as_automacoes',
            { expiresIn: '7d' }
        );

        // 5. RESPOSTA PARA O FRONTEND (Com o lojaId!)
        res.json({
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                tipo: usuario.tipo,
                email: usuario.email,
                lojaId: usuario.lojaId // 👈 ESSENCIAL: Pro dashboard saber quem é a loja!
            }
        });
    } catch (err) {
        console.error("Erro no servidor no Login:", err.message);
        res.status(500).json({ erro: "Erro no servidor: " + err.message });
    }
});

module.exports = router;