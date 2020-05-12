const express = require('express');
const router = express.Router();

const Apontamento = require('../models/Apontamento');

router.route('/')
    .get((req, res) => {
        Apontamento.find().then(apontamentos => res.status(200).json({ sucesso: true, messagem: "Apontamentos cadastrados no sistema.", apontamentos }))
    })

router.route('/iniciar')
    .post((req, res) => {
        try {
            const { tipo, pessoaSupervisor, pessoaEncarregado, veiculoPlaca, veiculoKmInicio, veiculoSi, equipe, cidade, endereco, localSaida } = req.body;
            let apontamento = new Apontamento();
            apontamento.iniciar(tipo, pessoaSupervisor, pessoaEncarregado, veiculoPlaca, veiculoKmInicio, veiculoSi, equipe, cidade, endereco, localSaida);
            apontamento.save((erro, apontamento) => {
                if (!erro) res.status(201).json({ sucesso: true, messagem: "Apontamento criado com sucesso.", apontamento });
                else res.status(400).json({ sucesso: false, messagem: erro });
            })
        } catch (erro) {
            res.status(400).json({ sucess: false, messagem: erro.message })
        }
    })

router.route('/finalizar')
    .post((req, res) => {
        try {
            const { _id, tecnicoEnergisa, veiculoKmFim, PgCp, atividades } = req.body;
            Apontamento.findById(_id).then(apontamento => {
                if (apontamento) {
                    if (apontamento.status === "INICIADO") {
                        apontamento.finalizar(tecnicoEnergisa, veiculoKmFim, PgCp, atividades).then(() => {
                            apontamento.save((erro, apontamento) => {
                                if (!erro) res.status(200).json({ sucesso: true, messagem: "Apontamento finalizado com sucesso.", apontamento });
                                else res.status(400).json({ sucesso: false, messagem: erro });
                            })
                        }).catch(erro => res.status(400).json({ sucesso: false, messagem: erro }))
                    } else res.status(400).json({ sucesso: false, messagem: "Apontamento já finalizado." })
                } else res.status(400).json({ sucesso: false, messagem: "Apontamento não encontrado." });
            })
        } catch (erro) {
            res.status(400).json({ sucesso: false, messagem: erro.message })
        }
    })

module.exports = router;