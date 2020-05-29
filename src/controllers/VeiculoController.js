const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Veiculo = require('../models/Veiculo');

router.route('/')
    .post((req, res) => {
        try {
            const { _id, numeracao, kilometragem, modelo } = req.body;
            let veiculo = new Veiculo();
            veiculo.criar(_id, numeracao, kilometragem, modelo);
            veiculo.save((erro, veiculo) => {
                if (erro) res.status(400).json({ sucesso: false, mensagem: erro })
                else res.status(201).json({ sucesso: true, mensagem: "Veículo criado com sucesso.", veiculo });
            })
        } catch (erro) {
            res.status(400).json({ sucesso: false, mensagem: erro })
        }
    })
    .get((req, res) => {
        Veiculo.find().then(veiculos => res.status(200).json({ sucesso: true, 
            mensagem: "Veículos cadastrados no sistema", veiculos }))
    })

module.exports = router;