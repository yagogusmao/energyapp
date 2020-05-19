const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Equipe = require('../models/Equipe');

/**
 * post example localhost:8080/equipe
 * {
        "_id": "CONSTRUCAO1",
        "tipo": "MANUTENCAO/CONSTRUCAO",
        "funcionarios": ["0001", "0002", "0003", "0004"],
        "local": "CAMPINA GRANDE",
        "veiculo": "MOI3131"
    }
 */

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

router.route('/veiculo')
    .put((req, res) => {
        try {
            const { _idEquipe, _idVeiculo } = req.body;
            Equipe.findById(_idEquipe).then(equipe => {
                if (equipe){
                    equipe.atualizarVeiculo(_idVeiculo).then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro })
                            else res.status(200).json({ sucesso: true, mensagem: "Veículo da equipe atualizado com sucesso.", equipe });
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({ sucesso: false, mensagem: "Equipe não encontrada." });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })

router.route('/funcionario')
    .put((req, res) => {
        try {
            const { _id, funcionario } = req.body;
            Equipe.findById(_id).then(equipe => {
                if (equipe){
                    equipe.adicionarFuncionario(funcionario).then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro })
                            else res.status(200).json({ sucesso: true, mensagem: "Funcionário adicionado com sucesso.", equipe });
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({ sucesso: false, mensagem: "Equipe não encontrada." });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })
    .delete((req, res) => {
        try {
            const { _id, funcionario } = queryString.parse(req._parsedUrl.query);
            Equipe.findById(_id).then(equipe => {
                if (equipe){
                    equipe.retirarFuncionario(funcionario).then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro })
                            else res.status(200).json({ sucesso: true, mensagem: "Funcionário retirado com sucesso.", equipe });
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({ sucesso: false, mensagem: "Equipe não encontrada." });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })
module.exports = router;