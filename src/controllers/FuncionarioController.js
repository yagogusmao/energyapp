const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Funcionario = require('../models/Funcionario');

router.route('/')
    .post((req, res) => {
        try {
            const { _id, nome, cpf, lotacao, cargo, telefone, dataInicio } = req.body;
            let funcionario = new Funcionario();
            funcionario.criar(_id, nome, cpf, lotacao, cargo, telefone, dataInicio);
            funcionario.save((erro, funcionario) => {
                if (erro) res.status(400).json({ sucesso: false, mensagem: erro })
                else res.status(201).json({ sucesso: true, mensagem: "Funcionário criado com sucesso.", funcionario });
            })
        } catch (erro) {
            res.status(400).json({ sucesso: false, mensagem: erro.message })
        }
    })
    .get((req, res) => {
        Funcionario.find().then(funcionarios => res.status(200).json({ sucesso: true, mensagem: "Funcionários cadastrados no sistema", funcionarios }))
    })
module.exports = router;