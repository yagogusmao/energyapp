const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Equipe = require('../models/Equipe');

router.route('/')
    .post((req, res) => {
        try {
            const { _id, tipo, funcionarios, local, veiculo } = req.body;
            Equipe.findById(_id).then(equipe => {
                if (!equipe){
                    let equipe = new Equipe();
                    equipe.criar(_id, tipo, funcionarios, local, veiculo).then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro })
                            else res.status(201).json({ sucesso: true, mensagem: "Equipe criada com sucesso.", equipe });
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({ sucesso: false, mensagem: "Já existe uma equipe atrelada a este _id." });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })
    .get((req, res) => {
        Equipe.find().then(equipes => res.status(200).json({ sucesso: true, mensagem: "Equipe cadastrados no sistema.", equipes }))
    })

module.exports = router;