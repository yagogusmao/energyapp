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
        const { _id } = req.body;
        let almoxarifado = new Almoxarifado();
        almoxarifado.criar(_id);
        almoxarifado.save((erro, almoxarifado) => {
            if (erro) res.status(400).json({ sucesso: false, mensagem: erro.message })
            else res.status(201).json({ sucesso: true, mensagem: "Almoxarifado criado com sucesso.", almoxarifado })
        })
    })
    /**
     * get example localhost:8080/almoxarifado
     */
    .get((req, res) => {
        Almoxarifado.find().then(almoxarifados => res.status(200).json({
            sucesso: true,
            mensagem: "Almoxarifados cadastrados no sistema.", almoxarifados
        }));
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
        "material": "20",
        "quantidade": 40,
        "vemDe": "ENERGISA"
    }
     */
    .put((req, res) => {
        const { _id, material, quantidade, vemDe } = req.body;
        Almoxarifado.findById(_id).then(almoxarifado => {
            if (almoxarifado) {
                almoxarifado.adicionar(material, quantidade, vemDe).then(() => {
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
    })
    /**
     * delete example localhost:8080/almoxarifado/estoque?_id=<_id do almoxarifado>&
        material=<_id do material>&
        quantidade=<quantidade de material que vai sair>&
        vaiPara=<local para onde vai o material>&
        servico=<código do servico>
     */
    .delete((req, res) => {
        const { _id, material, quantidade, vaiPara, servico, equipe } = queryString.parse(req._parsedUrl.query);
        Almoxarifado.findById(_id).then(almoxarifado => {
            if (almoxarifado) {
                try {
                    almoxarifado.retirar(material, quantidade, vaiPara, servico, equipe).then(() => {
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
module.exports = router;