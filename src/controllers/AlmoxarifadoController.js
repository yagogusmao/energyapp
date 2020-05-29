const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Almoxarifado = require('../models/Almoxarifado');

router.route('/')
    .post((req, res) => {
        const { _id } = req.body;
        let almoxarifado = new Almoxarifado();
        almoxarifado.criar(_id);
        almoxarifado.save((erro, almoxarifado) => {
            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
            else res.status(201).json({ sucesso: true, mensagem: "Almoxarifado criado com sucesso.", almoxarifado })
        })
    })
    .get((req, res) => {
        Almoxarifado.find().then(almoxarifados => res.status(200).json({ sucesso: true, 
            mensagem: "Almoxarifados cadastrados no sistema.", almoxarifados }));
    })

router.route('/estoque')
    .get((req, res) => {
        const { _id } = queryString.parse(req._parsedUrl.query);
        Almoxarifado.findById(_id).then(almoxarifado => {
            if (almoxarifado) almoxarifado.verEstoque()
                .then(materiais => res.status(200).json({sucesso: true, 
                    mensagem: "Estes são os materiais e quantidades no estoque.", materiais}))
            else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
        })
    })
    .put((req, res) => {
        const { _id, material, quantidade } = req.body;
        Almoxarifado.findById(_id).then(almoxarifado => {
            if (almoxarifado) {
                almoxarifado.adicionar(material, quantidade).then(() => {
                    almoxarifado.save((erro, almoxarifado) => {
                        if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                        else res.status(200).json({ sucesso: true, 
                            mensagem: "Materiais adicionados ao estoque com sucesso", almoxarifado });
                    })
                }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
            } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
        })
    })
    .delete((req, res) => {
        const { _id, material, quantidade } = queryString.parse(req._parsedUrl.query);
        Almoxarifado.findById(_id).then(almoxarifado => {
            if (almoxarifado) {
                almoxarifado.retirar(material, quantidade).then(() => {
                    almoxarifado.save((erro, almoxarifado) => {
                        if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                        else res.status(200).json({ sucesso: true, 
                                mensagem: "Materiais retirados do estoque com sucesso", almoxarifado });
                    })
                }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
            } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
        })
    })
module.exports = router;