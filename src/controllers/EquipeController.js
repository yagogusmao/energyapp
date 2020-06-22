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
            if (req._id === "517") {
                Equipe.findById(_id).then(equipe => {
                    if (!equipe) {
                        let equipe = new Equipe();
                        equipe.criar(_id, tipo, funcionarios, local, veiculo, req.base).then(() => {
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
            } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para supervisores." });
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
        else if (req._id === "517") {
            Equipe.find().then(equipes => res.status(200).json({
                sucesso: true,
                mensagem: "Equipe cadastradas no sistema.", equipes
            }))
        }
        else {
            if (req.equipes && req.equipes.length > 0) {
                const pesquisa = req.equipes.map(equipe => { return { tipo: equipe } })
                Equipe.find({ base: req.base, $or: pesquisa }).then(equipes => res.status(200).json({
                    sucesso: true,
                    mensagem: "Equipe cadastradas no sistema.", equipes
                }))
            } else res.status(200).json({
                sucesso: true,
                mensagem: "Equipe cadastradas no sistema.", equipes: []
            })

        }
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
                                Veiculo.find({ equipe: "", base: req.base }).then(veiculos => {
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
                                Veiculo.find({ equipe: "", base: req.base }).then(veiculos => {
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
        Funcionario.find({ equipe: "", base: req.base }).then(funcionarios => res.status(200).json({
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
                                Funcionario.find({ equipe: "", base: req.base }).then(funcionariosSemEquipe => res.status(200).json({
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
                                Funcionario.find({ equipe: "", base: req.base }).then(funcionariosSemEquipe => res.status(200).json({
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
        Veiculo.find({ equipe: "", base: req.base }).then(veiculos => {
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

router.route('/faturamentoConstrucao')
    .get((req, res) => {
        Equipe.find({ base: req.base, tipo: "CONSTRUCAO" }).then(equipes => {
            Promise.all(equipes.map(equipe => equipe.verFaturamento())).then(faturamentosEquipes => {
                let labels = [];
                const faturamentoPorEquipes = equipes.map((equipe, i) => {
                    labels.push(equipe._id);
                    return {
                        equipe: equipe._id,
                        faturamentoHoje: faturamentosEquipes[i].apontamentosHoje.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoSemana: faturamentosEquipes[i].apontamentosSemana.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoMes: faturamentosEquipes[i].apontamentosMes.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoAno: faturamentosEquipes[i].apontamentosAno.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamento: faturamentosEquipes[i].apontamentos.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0)
                    }
                })
                const graficoHoje = faturamentoPorEquipes.map(equipe => equipe.faturamentoHoje);
                const graficoSemana = faturamentoPorEquipes.map(equipe => equipe.faturamentoSemana);
                const graficoMes = faturamentoPorEquipes.map(equipe => equipe.faturamentoMes);
                const graficoAno = faturamentoPorEquipes.map(equipe => equipe.faturamentoAno);
                const grafico = faturamentoPorEquipes.map(equipe => equipe.faturamento);
                res.status(200).json({
                    sucesso: true, mensagem: "Faturamento das equipes",
                    graficos: [
                        {
                            labels,
                            data: graficoHoje
                        },
                        {
                            labels,
                            data: graficoSemana
                        },
                        {
                            labels,
                            data: graficoMes
                        },
                        {
                            labels,
                            data: graficoAno
                        },
                        {
                            labels,
                            data: grafico
                        }
                    ]
                })
            })
        })
    })

router.route('/faturamentoManutencao')
    .get((req, res) => {
        Equipe.find({ base: req.base, tipo: "MANUTENCAO" }).then(equipes => {
            Promise.all(equipes.map(equipe => equipe.verFaturamento())).then(faturamentosEquipes => {
                let labels = [];
                const faturamentoPorEquipes = equipes.map((equipe, i) => {
                    labels.push(equipe._id);
                    return {
                        equipe: equipe._id,
                        faturamentoHoje: faturamentosEquipes[i].apontamentosHoje.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoSemana: faturamentosEquipes[i].apontamentosSemana.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoMes: faturamentosEquipes[i].apontamentosMes.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoAno: faturamentosEquipes[i].apontamentosAno.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamento: faturamentosEquipes[i].apontamentos.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0)
                    }
                })
                const graficoHoje = faturamentoPorEquipes.map(equipe => equipe.faturamentoHoje);
                const graficoSemana = faturamentoPorEquipes.map(equipe => equipe.faturamentoSemana);
                const graficoMes = faturamentoPorEquipes.map(equipe => equipe.faturamentoMes);
                const graficoAno = faturamentoPorEquipes.map(equipe => equipe.faturamentoAno);
                const grafico = faturamentoPorEquipes.map(equipe => equipe.faturamento);
                res.status(200).json({
                    sucesso: true, mensagem: "Faturamento das equipes",
                    graficos: [
                        {
                            labels,
                            data: graficoHoje
                        },
                        {
                            labels,
                            data: graficoSemana
                        },
                        {
                            labels,
                            data: graficoMes
                        },
                        {
                            labels,
                            data: graficoAno
                        },
                        {
                            labels,
                            data: grafico
                        }
                    ]
                })
            })
        })
    })

router.route('/faturamentoPoda')
    .get((req, res) => {
        Equipe.find({ base: req.base, tipo: "PODA" }).then(equipes => {
            Promise.all(equipes.map(equipe => equipe.verFaturamento())).then(faturamentosEquipes => {
                let labels = [];
                const faturamentoPorEquipes = equipes.map((equipe, i) => {
                    labels.push(equipe._id);
                    return {
                        equipe: equipe._id,
                        faturamentoHoje: faturamentosEquipes[i].apontamentosHoje.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoSemana: faturamentosEquipes[i].apontamentosSemana.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoMes: faturamentosEquipes[i].apontamentosMes.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoAno: faturamentosEquipes[i].apontamentosAno.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamento: faturamentosEquipes[i].apontamentos.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0)
                    }
                })
                const graficoHoje = faturamentoPorEquipes.map(equipe => equipe.faturamentoHoje);
                const graficoSemana = faturamentoPorEquipes.map(equipe => equipe.faturamentoSemana);
                const graficoMes = faturamentoPorEquipes.map(equipe => equipe.faturamentoMes);
                const graficoAno = faturamentoPorEquipes.map(equipe => equipe.faturamentoAno);
                const grafico = faturamentoPorEquipes.map(equipe => equipe.faturamento);
                res.status(200).json({
                    sucesso: true, mensagem: "Faturamento das equipes",
                    graficos: [
                        {
                            labels,
                            data: graficoHoje
                        },
                        {
                            labels,
                            data: graficoSemana
                        },
                        {
                            labels,
                            data: graficoMes
                        },
                        {
                            labels,
                            data: graficoAno
                        },
                        {
                            labels,
                            data: grafico
                        }
                    ]
                })
            })
        })
    })

router.route('/faturamentoLinhaviva')
    .get((req, res) => {
        Equipe.find({ base: req.base, tipo: "LINHA VIVA" }).then(equipes => {
            Promise.all(equipes.map(equipe => equipe.verFaturamento())).then(faturamentosEquipes => {
                let labels = [];
                const faturamentoPorEquipes = equipes.map((equipe, i) => {
                    labels.push(equipe._id);
                    return {
                        equipe: equipe._id,
                        faturamentoHoje: faturamentosEquipes[i].apontamentosHoje.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoSemana: faturamentosEquipes[i].apontamentosSemana.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoMes: faturamentosEquipes[i].apontamentosMes.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoAno: faturamentosEquipes[i].apontamentosAno.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamento: faturamentosEquipes[i].apontamentos.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0)
                    }
                })
                const graficoHoje = faturamentoPorEquipes.map(equipe => equipe.faturamentoHoje);
                const graficoSemana = faturamentoPorEquipes.map(equipe => equipe.faturamentoSemana);
                const graficoMes = faturamentoPorEquipes.map(equipe => equipe.faturamentoMes);
                const graficoAno = faturamentoPorEquipes.map(equipe => equipe.faturamentoAno);
                const grafico = faturamentoPorEquipes.map(equipe => equipe.faturamento);
                res.status(200).json({
                    sucesso: true, mensagem: "Faturamento das equipes",
                    graficos: [
                        {
                            labels,
                            data: graficoHoje
                        },
                        {
                            labels,
                            data: graficoSemana
                        },
                        {
                            labels,
                            data: graficoMes
                        },
                        {
                            labels,
                            data: graficoAno
                        },
                        {
                            labels,
                            data: grafico
                        }
                    ]
                })
            })
        })
    })

router.route('/faturamentoDECP')
    .get((req, res) => {
        Equipe.find({ base: req.base, tipo: "DECP" }).then(equipes => {
            Promise.all(equipes.map(equipe => equipe.verFaturamento())).then(faturamentosEquipes => {
                let labels = [];
                const faturamentoPorEquipes = equipes.map((equipe, i) => {
                    labels.push(equipe._id);
                    return {
                        equipe: equipe._id,
                        faturamentoHoje: faturamentosEquipes[i].apontamentosHoje.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoSemana: faturamentosEquipes[i].apontamentosSemana.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoMes: faturamentosEquipes[i].apontamentosMes.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoAno: faturamentosEquipes[i].apontamentosAno.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamento: faturamentosEquipes[i].apontamentos.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0)
                    }
                })
                const graficoHoje = faturamentoPorEquipes.map(equipe => equipe.faturamentoHoje);
                const graficoSemana = faturamentoPorEquipes.map(equipe => equipe.faturamentoSemana);
                const graficoMes = faturamentoPorEquipes.map(equipe => equipe.faturamentoMes);
                const graficoAno = faturamentoPorEquipes.map(equipe => equipe.faturamentoAno);
                const grafico = faturamentoPorEquipes.map(equipe => equipe.faturamento);
                res.status(200).json({
                    sucesso: true, mensagem: "Faturamento das equipes",
                    graficos: [
                        {
                            labels,
                            data: graficoHoje
                        },
                        {
                            labels,
                            data: graficoSemana
                        },
                        {
                            labels,
                            data: graficoMes
                        },
                        {
                            labels,
                            data: graficoAno
                        },
                        {
                            labels,
                            data: grafico
                        }
                    ]
                })
            })
        })
    })

router.route('/faturamentoDEOP')
    .get((req, res) => {
        Equipe.find({ base: req.base, tipo: "DEOP" }).then(equipes => {
            Promise.all(equipes.map(equipe => equipe.verFaturamento())).then(faturamentosEquipes => {
                let labels = [];
                const faturamentoPorEquipes = equipes.map((equipe, i) => {
                    labels.push(equipe._id);
                    return {
                        equipe: equipe._id,
                        faturamentoHoje: faturamentosEquipes[i].apontamentosHoje.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoSemana: faturamentosEquipes[i].apontamentosSemana.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoMes: faturamentosEquipes[i].apontamentosMes.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamentoAno: faturamentosEquipes[i].apontamentosAno.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0),
                        faturamento: faturamentosEquipes[i].apontamentos.reduce((acumulado, apontamento) =>
                            acumulado + apontamento.lucro, 0)
                    }
                })
                const graficoHoje = faturamentoPorEquipes.map(equipe => equipe.faturamentoHoje);
                const graficoSemana = faturamentoPorEquipes.map(equipe => equipe.faturamentoSemana);
                const graficoMes = faturamentoPorEquipes.map(equipe => equipe.faturamentoMes);
                const graficoAno = faturamentoPorEquipes.map(equipe => equipe.faturamentoAno);
                const grafico = faturamentoPorEquipes.map(equipe => equipe.faturamento);
                res.status(200).json({
                    sucesso: true, mensagem: "Faturamento das equipes",
                    graficos: [
                        {
                            labels,
                            data: graficoHoje
                        },
                        {
                            labels,
                            data: graficoSemana
                        },
                        {
                            labels,
                            data: graficoMes
                        },
                        {
                            labels,
                            data: graficoAno
                        },
                        {
                            labels,
                            data: grafico
                        }
                    ]
                })
            })
        })
    })

router.route('/meta')
    .put((req, res) => {
        const { _id, metaDiaria, metaSemanal, metaMensal, metaAnual } = req.body;
        Equipe.findById(_id).then(equipe => {
            if (equipe) {
                equipe.definirMeta(metaDiaria, metaSemanal, metaMensal, metaAnual);
                equipe.save(erro => {
                    if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                    else res.status(200).json({ sucesso: true, mensagem: "Metas definidas com sucesso.", equipe })
                })
            } else res.status(400).json({ sucesso: false, mensagem: "Equipe não encontrada." })
        })
    })
module.exports = router;