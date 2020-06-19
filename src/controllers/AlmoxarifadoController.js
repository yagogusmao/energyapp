const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Almoxarifado = require('../models/Almoxarifado');

router.route('/')
    /**
     * post example localhost:8080/almoxarifado
    {
        "_id": "CAMPINAGRANDE-EPB"
    }
     */
    .post((req, res) => {
        if (req._id === "517") {
            const { _id, base } = req.body;
            let almoxarifado = new Almoxarifado();
            almoxarifado.criar(_id, base);
            almoxarifado.save((erro, almoxarifado) => {
                if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
                else res.status(201).json({ sucesso: true, mensagem: "Almoxarifado criado com sucesso.", almoxarifado })
            })
        } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para o setor administrativo." })
    })
    /**
     * get example localhost:8080/almoxarifado
     */
    .get((req, res) => {
        if (req.funcao === "ALMOXARIFE" || req._id === "517" || req.funcao === "GERENTE" ) {
            Almoxarifado.find({ base: req.base }).then(almoxarifados =>
                res.status(200).json({
                    sucesso: true,
                    mensagem: "Almoxarifados cadastrados no sistema.",
                    almoxarifados: almoxarifados.map(almoxarifado => {
                        return {
                            _id: almoxarifado._id,
                            quantidade: Array.from(almoxarifado.estoque).reduce((acumulado, [chave, valor]) => {
                                return acumulado += valor;
                            }, 0)
                        }
                    })
                }));
        } else res.status(200).json({
            sucesso: true,
            mensagem: "Almoxarifados cadastrados no sistema.",
            almoxarifados: []
        });
    })

router.route('/estoque')
    /**
     * get example localhost:8080/almoxarifado/estoque?_id=<_id do almoxarifado>
     */
    .get((req, res) => {
        const { _id } = queryString.parse(req._parsedUrl.query);
        Almoxarifado.findById(_id).then(almoxarifado => {
            if (almoxarifado) almoxarifado.verEstoque()
                .then(materiais => res.status(200).json({
                    sucesso: true,
                    mensagem: "Estes são os materiais e quantidades no estoque.", materiais
                }))
            else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
        })
    })
    /**
     * put example localhost:8080/almoxarifado/estoque
    {
        "_id": "CAMPINAGRANDE-EPB",
        "newArray": [
            {
                "_id": "20",
                "quantidade": 123
            },
            {
                "_id": "21",
                "quantidade": 312
            },
            {
                "_id": "23",
                "quantidade": 321
            },
            {
                "_id": "42",
                "quantidade": 111
            },
            {
                "_id": "352",
                "quantidade": 222
            }
        ],
        "vemDe": "ENERGISA",
    }
     */
    .put((req, res) => {
        const { _id, newArray, vemDe } = req.body;
        if (req.funcao === "ALMOXARIFE" || req._id === "517") {
            Almoxarifado.findById(_id).then(almoxarifado => {
                if (almoxarifado) {
                    almoxarifado.adicionar(newArray, vemDe).then(() => {
                        almoxarifado.save((erro, almoxarifado) => {
                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                            else almoxarifado.verEstoque().then(materiais => res.status(200).json({
                                sucesso: true,
                                mensagem: "Materiais adicionados ao estoque com sucesso", materiais
                            }))
                        })
                    }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
            })
        } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para almoxarifes." });
    })

router.route('/retirarEstoque')
    /**
         * put example localhost:8080/almoxarifado/estoque
        {
            "_id": "CAMPINAGRANDE-EPB",
            "newArray": [
                {
                    "_id": "20",
                    "quantidade": 123
                },
                {
                    "_id": "21",
                    "quantidade": 312
                },
                {
                    "_id": "23",
                    "quantidade": 321
                },
                {
                    "_id": "42",
                    "quantidade": 111
                },
                {
                    "_id": "352",
                    "quantidade": 222
                }
            ],
            "vaiPara": "JUAZEIRINHO",
            "servico": "00220000402",
            "equipe": "ENPB-002"
        }
         */
    .put((req, res) => {
        const { _id, newArray, vaiPara, servico, equipe, sairAlmoxarifado } = req.body;
        if (req.funcao === "ALMOXARIFE" || req._id === "517") {
            if (!sairAlmoxarifado) {
                Almoxarifado.findById(_id).then(almoxarifado => {
                    if (almoxarifado) {
                        try {
                            almoxarifado.retirar(newArray, vaiPara, servico, equipe).then(() => {
                                almoxarifado.save((erro, almoxarifado) => {
                                    if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                    else almoxarifado.verEstoque().then(materiais => res.status(200).json({
                                        sucesso: true,
                                        mensagem: "Materiais retirados do estoque com sucesso.", materiais
                                    }))
                                })
                            }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
                    } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
                })
            } else {
                Almoxarifado.findById(_id).then(almoxarifado => {
                    if (almoxarifado) {
                        try {
                            almoxarifado.retirar(newArray, vaiPara, servico, equipe).then(() => {
                                Almoxarifado.findById(vaiPara).then(almoxarifadoReceber => {
                                    if (almoxarifadoReceber) {
                                        almoxarifadoReceber.adicionar(newArray, _id).then(() => {
                                            almoxarifado.save((erro, almoxarifado) => {
                                                if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                                else {
                                                    almoxarifadoReceber.save((erro) => {
                                                        if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                                        else almoxarifado.verEstoque().then(materiais => res.status(200).json({
                                                            sucesso: true,
                                                            mensagem: "Materiais retirados do estoque com sucesso.", materiais
                                                        }))
                                                    })
                                                }
                                            })
                                        }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                                    } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado para receber não encontrado." });
                                })
                            }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
                    } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
                })
            }
        } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para almoxarifes." });
    })

router.route('/relatorio')
    /**
    * get example localhost:8080/almoxarifado/relatorio?_id=<_id do almoxarifado>&opcao=<entrada ou saida>
    */
    .get((req, res) => {
        const { _id, opcao } = queryString.parse(req._parsedUrl.query);
        Almoxarifado.findById(_id).then(almoxarifado => {
            if (almoxarifado) almoxarifado.verRelatorio(opcao)
                .then(relatorio => res.status(200).json({
                    sucesso: true,
                    mensagem: "Relatório retirado com sucesso.", relatorio
                })).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }))
            else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
        })
    })

router.route('/retirarTransformador')
    /**
     * put example localhost:8080/almoxarifado/retirarTransformador
     * {
        "_id": "CAMPINAGRANDE-EPB",
        "_idTransformador": "282",
        "quantidade": 1,
        "vaiPara": "JUAZEIRINHO",
        "servico": "00220000402",
        "equipe": "ENPB-002",
        "numeroSerie": "123456789",
        "tombamento": "123",
        "impedancia": "123456",
        "dataFabricacao": "20/06/1990"
    }
     */
    .put((req, res) => {
        const { _id, _idTransformador, numeroSerie, tombamento, impedancia, dataFabricacao, vaiPara, servico, equipe, sairAlmoxarifado } = req.body;
        if (req.funcao === "ALMOXARIFE" || req._id === "517") {
            if (!sairAlmoxarifado) {
                Almoxarifado.findById(_id).then(almoxarifado => {
                    if (almoxarifado) {
                        try {
                            almoxarifado.retirarTransformador(_idTransformador, vaiPara, servico, equipe,
                                numeroSerie, tombamento, impedancia, dataFabricacao).then(() => {
                                    almoxarifado.save((erro, almoxarifado) => {
                                        if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                        else almoxarifado.verEstoque().then(materiais => res.status(200).json({
                                            sucesso: true,
                                            mensagem: "Materiais retirados do estoque com sucesso", materiais
                                        }))
                                    })
                                }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
                    } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
                })
            } else {
                Almoxarifado.findById(_id).then(almoxarifado => {
                    if (almoxarifado) {
                        try {
                            almoxarifado.retirarTransformador(_idTransformador, vaiPara, servico, equipe,
                                numeroSerie, tombamento, impedancia, dataFabricacao).then(() => {
                                    Almoxarifado.findById(vaiPara).then(almoxarifadoReceber => {
                                        if (almoxarifadoReceber) {
                                            almoxarifadoReceber.adicionar([{ _id: _idTransformador, quantidade: 1 }], _id).then(() => {
                                                almoxarifado.save((erro, almoxarifado) => {
                                                    if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                                    else {
                                                        almoxarifadoReceber.save((erro) => {
                                                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                                            else almoxarifado.verEstoque().then(materiais => res.status(200).json({
                                                                sucesso: true,
                                                                mensagem: "Materiais retirados do estoque com sucesso.", materiais
                                                            }))
                                                        })
                                                    }
                                                })
                                            }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                                        } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado para receber não encontrado." });
                                    })
                                }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
                    } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
                })
            }
        } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para almoxarifes." });
    })

router.route('/retirarMedidor')
    .put((req, res) => {
        const { _id, _idMedidor, numero, nSeloCaixa, nSeloBorn, vaiPara, servico, equipe, sairAlmoxarifado } = req.body;
        if (req.funcao === "ALMOXARIFE" || req._id === "517") {
            if (!sairAlmoxarifado) {
                Almoxarifado.findById(_id).then(almoxarifado => {
                    if (almoxarifado) {
                        try {
                            almoxarifado.retirarMedidor(_idMedidor, vaiPara, servico, equipe,
                                numero, nSeloCaixa, nSeloBorn).then(() => {
                                    almoxarifado.save((erro, almoxarifado) => {
                                        if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                        else almoxarifado.verEstoque().then(materiais => res.status(200).json({
                                            sucesso: true,
                                            mensagem: "Materiais retirados do estoque com sucesso", materiais
                                        }))
                                    })
                                }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
                    } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
                })
            } else {
                Almoxarifado.findById(_id).then(almoxarifado => {
                    if (almoxarifado) {
                        try {
                            almoxarifado.retirarMedidor(_idMedidor, vaiPara, servico, equipe,
                                numero, nSeloCaixa, nSeloBorn).then(() => {
                                    Almoxarifado.findById(vaiPara).then(almoxarifadoReceber => {
                                        if (almoxarifadoReceber) {
                                            almoxarifadoReceber.adicionar([{ _id: _idMedidor, quantidade: 1 }], _id).then(() => {
                                                almoxarifado.save((erro, almoxarifado) => {
                                                    if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                                    else {
                                                        almoxarifadoReceber.save((erro) => {
                                                            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message });
                                                            else almoxarifado.verEstoque().then(materiais => res.status(200).json({
                                                                sucesso: true,
                                                                mensagem: "Materiais retirados do estoque com sucesso.", materiais
                                                            }))
                                                        })
                                                    }
                                                })
                                            }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                                        } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado para receber não encontrado." });
                                    })
                                }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }));
                        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
                    } else res.status(400).json({ sucesso: false, mensagem: "Almoxarifado não encontrado." });
                })
            }
        } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para almoxarifes." });
    })

module.exports = router;