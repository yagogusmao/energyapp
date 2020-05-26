const express = require('express');
const router = express.Router();
const queryString = require('query-string');

var Material = require('../models/Material');

router.route('/')
    .get((req, res) => {
        const { _id } = queryString.parse(req._parsedUrl.query);
        if (_id === "todos") Material.find().then(materiais => res.status(200).json({ sucesso: true, mensagem: "Materiais cadastradas no sistema.", materiais }))
        else Material.findById(_id).then(material => res.status(200).json({ sucesso: true, mensagem: "Material cadastrado no sistema", material }))
    })
    .put((req, res) => {
        const { _id, quantidade, opcao } = req.body;
        Material.findById(_id).then(material => {
            if (material) {
                try {
                    if (opcao === "ADICIONAR") {
                        material.adicionar(quantidade);
                    } else if (opcao === "RETIRAR") {
                        material.retirar(quantidade);
                    } else return res.status(400).json({ sucesso: false, mensagem: "Insira uma opção válida." })
                } catch (erro) { return res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
                material.save((erro, material) => {
                    if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                    else res.status(200).json({ sucesso: true, mensagem: "Estoque atualizado com sucesso.", material })
                })
            } else res.status(400).json({ sucesso: false, mensagem: "Material não encontrado." })
        })
    })

module.exports = router;