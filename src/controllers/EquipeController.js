const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Equipe = require('../models/Equipe');
const Funcionario = require('../models/Funcionario');
const Veiculo = require('../models/Veiculo');

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
                if (!equipe) {
                    let equipe = new Equipe();
                    equipe.criar(_id, tipo, funcionarios, local, veiculo).then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                            else res.status(201).json({
                                sucesso: true,
                                mensagem: "Equipe criada com sucesso.", equipe
                            });
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({
                    sucesso: false,
                    mensagem: "Já existe uma equipe atrelada a este _id."
                });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })
    .get((req, res) => {
        const { _id } = queryString.parse(req._parsedUrl.query);
        if (_id) Equipe.findById(_id).then(equipe => {
            const funcionarios = Array.from(equipe.funcionarios).map(([chave, valor]) => {
                return { _id: chave, valor }
            })
            res.status(200).json({
                sucesso: true,
                mensagem: "Equipe cadastrada no sistema.", equipe, funcionarios
            })
        })
        else Equipe.find().then(equipes => res.status(200).json({
            sucesso: true,
            mensagem: "Equipe cadastradas no sistema.", equipes
        }))
    })

router.route('/veiculo')
    .get((req, res) => {
        try {
            const { _id } = queryString.parse(req._parsedUrl.query);
            Equipe.findById(_id).then(equipe => {
                if (equipe) {
                    if (equipe.veiculo !== "") Veiculo.findById(equipe.veiculo).then(veiculo => res.status(200).json({ sucesso: true, mensagem: "Veículo da equipe.", veiculo }))
                    else res.status(200).json({ sucesso: true, mensagem: "Veículo da equipe.", veiculo: {} })
                } else res.status(400).json({ sucesso: false, mensagem: "Equipe não encontrada." });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })
    .put((req, res) => {
        try {
            const { _id, veiculo } = req.body;
            Equipe.findById(_id).then(equipe => {
                if (equipe) {
                    equipe.adicionarVeiculo(veiculo).then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                            else {
                                Veiculo.find({ equipe: "" }).then(veiculos => {
                                    res.status(200).json({
                                        sucesso: true,
                                        mensagem: "Veículo da equipe adicionado com sucesso.", equipe, veiculos
                                    });
                                })
                            }
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({ sucesso: false, mensagem: "Equipe não encontrada." });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })
    .delete((req, res) => {
        try {
            const { _id } = queryString.parse(req._parsedUrl.query);
            Equipe.findById(_id).then(equipe => {
                if (equipe) {
                    equipe.retirarVeiculo().then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                            else {
                                Veiculo.find({ equipe: "" }).then(veiculos => {
                                    res.status(200).json({
                                        sucesso: true,
                                        mensagem: "Veículo retirado da equipe com sucesso.", equipe, veiculos
                                    });
                                })
                            }
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({ sucesso: false, mensagem: "Equipe não encontrada." });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })

router.route('/funcionario')
    .get((req, res) => {
        Funcionario.find({ equipe: "" }).then(funcionarios => res.status(200).json({
            sucesso: true,
            mensagem: "Funcionários cadastrados no sistema sem equipe.", funcionarios
        }))
    })
    .put((req, res) => {
        try {
            const { _id, funcionario } = req.body;
            Equipe.findById(_id).then(equipe => {
                if (equipe) {
                    equipe.adicionarFuncionario(funcionario).then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                            else {
                                Funcionario.find({ equipe: "" }).then(funcionariosSemEquipe => res.status(200).json({
                                    sucesso: true, equipe,
                                    mensagem: "Funcionário adicionado com sucesso.", funcionarios: equipe.verFuncionarios(),
                                    funcionariosSemEquipe: funcionariosSemEquipe
                                }))
                            }
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
                if (equipe) {
                    equipe.retirarFuncionario(funcionario).then(() => {
                        equipe.save((erro, equipe) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                            else {
                                Funcionario.find({ equipe: "" }).then(funcionariosSemEquipe => res.status(200).json({
                                    sucesso: true, equipe,
                                    mensagem: "Funcionário retirado com sucesso.", funcionarios: equipe.verFuncionarios(),
                                    funcionariosSemEquipe: funcionariosSemEquipe
                                }))
                            }
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({ sucesso: false, mensagem: "Equipe não encontrada." });
            })
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })

router.route('/verfuncionarios')
    .get((req, res) => {
        const { _id } = queryString.parse(req._parsedUrl.query);
        Equipe.findById(_id).then(equipe => res.status(200).json({
            sucesso: true,
            mensagem: "Funcionários cadastrados na equipe.", funcionarios: equipe.verFuncionarios()
        }))
    })

router.route('/verVeiculosSemEquipes')
    .get((req, res) => {
        Veiculo.find({ equipe: "" }).then(veiculos => {
            res.status(200).json({
                sucesso: true,
                mensagem: "Veículos sem equipe no sistema.", veiculos
            })
        })
    })

router.route('/faturamento')
    .get((req, res) => {
        const { _id } = queryString.parse(req._parsedUrl.query);
        Equipe.findById(_id).then(equipe => {
            equipe.verFaturamento().then(faturamento => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: "Faturamento da equipe.", faturamento
                })
            });
        })
    })
module.exports = router;