const express = require('express');
const router = express.Router();

const Apontamento = require('../models/Apontamento');

router.route('/')
    .post((req, res) => {
        try{
            const {tipo, pessoa, veiculo, PgCp, equipe, cidade, endereco, hora, local, atividades} = req.body;
            let apontamento = new Apontamento();
            apontamento.criar(tipo, pessoa, veiculo, PgCp, equipe, cidade, endereco, hora, local, atividades);
            apontamento.save((erro, apontamento) => {
                if (!erro) res.status(201).json({sucesso: true, messagem: "Apontamento criado com sucesso.", apontamento});
                else res.status(400).json({sucesso: false, messagem: erro});
            })
        } catch (erro) {
            res.status(400).json({ sucesso: false, messagem: erro});
        }
    })
    .get((req, res) => {
        Apontamento.find().then(apontamentos => res.status(200).json({sucesso: true, messagem: "Apontamentos cadastrados no sistema.", apontamentos}))
    })

module.exports = router;