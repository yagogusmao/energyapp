const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Veiculo = require('../models/Veiculo');

router.route('/')
    .post((req, res) => {
        try {
            if (req._id === "517" || req.funcao === "SUPERVISOR") {
                const { _id, numeracao, kilometragem, modelo } = req.body;
                let veiculo = new Veiculo();
                veiculo.criar(_id, numeracao, kilometragem, modelo, req.base);
                veiculo.save((erro, veiculo) => {
                    if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                    else res.status(201).json({ sucesso: true, mensagem: "Veículo criado com sucesso.", veiculo });
                })
            } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para o setor administrativo." })
        } catch (erro) {
            res.status(400).json({ sucesso: false, mensagem: erro + "" })
        }
    })
    .get((req, res) => {
        if (req._id === "517") {
            Veiculo.find().then(veiculos => res.status(200).json({
                sucesso: true,
                mensagem: "Veículos cadastrados no sistema", veiculos
            }))
        } else {
            Veiculo.find({ base: req.base }).then(veiculos => res.status(200).json({
                sucesso: true,
                mensagem: "Veículos cadastrados no sistema", veiculos
            }))
        }
    })

module.exports = router;