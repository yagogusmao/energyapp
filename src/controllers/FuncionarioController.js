const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Funcionario = require('../models/Funcionario');

router.route('/')
    .post((req, res) => {
        try {
            if (req._id === "517" || req.funcao === "SUPERVISOR") {
                const { _id, nome, cpf, lotacao, cargo, telefone, dataInicio } = req.body;
                let funcionario = new Funcionario();
                funcionario.criar(_id, nome, cpf, lotacao, cargo, telefone, dataInicio, req.base);
                funcionario.save((erro, funcionario) => {
                    if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                    else res.status(201).json({
                        sucesso: true,
                        mensagem: "Funcionário criado com sucesso.", funcionario
                    });
                })
            } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para o setor administrativo." });
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })
    .get((req, res) => {
        if (req._id === "517") {
            Funcionario.find().then(funcionarios => res.status(200).json({
                sucesso: true,
                mensagem: "Funcionários cadastrados no sistema", funcionarios
            }))
        } else {
            Funcionario.find({ base: req.base }).then(funcionarios => res.status(200).json({
                sucesso: true,
                mensagem: "Funcionários cadastrados no sistema", funcionarios
            }))
        }
    })

module.exports = router;