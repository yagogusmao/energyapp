const express = require('express');
const router = express.Router();

var Material = require('../models/Material');

router.route('/')
    .get((req, res) => {
        Material.findById("20").then(materiais => res.status(200).json({ sucesso: true, messagem: "Materiais cadastradas no sistema.", materiais }))
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