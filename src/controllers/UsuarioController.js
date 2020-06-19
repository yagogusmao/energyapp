const express = require('express');
const router = express.Router();
const queryString = require('query-string');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Usuario = require('../models/Usuario');

router.route('/')
    .post((req, res) => {
        const { _id, nome, cpf, funcao, base, senha, equipes } = req.body;
        try {
            let usuario = new Usuario();
            usuario.criar(_id, nome, cpf, funcao, base, senha, equipes);
            usuario.save((erro, usuario) => {
                if (erro) res.status(400).json({ sucesso: false, mensagem: erro });
                else res.status(201).json({ sucesso: true, mensagem: "Usuário criado com sucesso.", usuario });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })

router.route('/login')
    .post((req, res) => {
        const { _id, senha } = req.body;
        Usuario.findById(_id).then(usuario => {
            if (usuario) {
                if (bcrypt.compareSync(senha, usuario.senha)) {
                    res.status(200).json({sucesso: true, 
                        mensagem: "Usuário logado com sucesso.", nome: usuario.nome,
                        funcao: usuario.funcao, base: usuario.base, 
                        token: gerarToken({
                            _id: usuario._id,
                            funcao: usuario.funcao,
                            base: usuario.base,
                            cpf: usuario.cpf,
                            nome: usuario.nome,
                            equipes: usuario.equipes
                        })
                    })
                } else res.status(400).json({sucesso: false, mensagem: "Senha incorreta."});
            } else res.status(400).json({sucesso: false, mensagem: "Usuário não encontrado."});
        })
    })

const gerarToken = (parametros) => jwt.sign(parametros, process.env.SECRET, { expiresIn: '24h'});

module.exports = router;