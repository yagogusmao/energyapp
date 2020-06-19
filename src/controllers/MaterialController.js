const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Material = require('../models/Material');
const MaterialMS = require('../models/MaterialMS');
const CodigoMateriais = require('../models/CodigoMateriais');
const mongoose = require('mongoose')

router.route('/')
    .post((req, res) => {
        const { _id, unidadeMedida, descricao, codigoClasse, descricaoClasse } = req.body;
        if (req.funcao === "ALMOXARIFE") {
            try {
                let material = new Material();
                material.criar(_id, unidadeMedida, descricao, codigoClasse, descricaoClasse);
                material.save((erro, material) => {
                    if (!erro) res.status(201).json({
                        sucesso: true,
                        messagem: "Material salvo com sucesso.", material
                    });
                    else res.status(400).json({ sucesso: false, mensagem: erro.message });
                })
            } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
        } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para almoxarifes." })
    })
    .get((req, res) => {
        const { _id, unidadeMedida, descricao, codigoClasse, descricaoClasse } = queryString.parse(req._parsedUrl.query);
        if (req.base === "PB") {
            if (_id === "todos") Material.find().then(materiais => res.status(200).json({
                sucesso: true,
                mensagem: "Materiais cadastradas no sistema.", quantidade: materiais.length, materiais
            }))
            else if (unidadeMedida || descricao || codigoClasse || descricaoClasse) {
                let pesquisa = {};
                if (unidadeMedida) pesquisa.unidadeMedida = { $regex: unidadeMedida, $options: 'i' };
                if (descricao) pesquisa.descricao = { $regex: descricao, $options: 'i' };
                if (codigoClasse) pesquisa.codigoClasse = Number(codigoClasse);
                if (descricaoClasse) pesquisa.descricaoClasse = { $regex: descricaoClasse, $options: 'i' };
                Material.find(pesquisa).then(materiais => {
                    res.status(200).json({ sucesso: true, mensagem: "Materiais cadastradas no sistema.", quantidade: materiais.length, materiais })
                })
            } else Material.find({ _id: _id }).then(materiais => res.status(200).json({
                sucesso: true,
                mensagem: "Material cadastrado no sistema.", materiais
            }))
        } else {
            if (_id === "todos") MaterialMS.find().then(materiais => res.status(200).json({
                sucesso: true,
                mensagem: "Materiais cadastradas no sistema.", quantidade: materiais.length, materiais
            }))
            else if (unidadeMedida || descricao || codigoClasse || descricaoClasse) {
                console.log(mongoose.modelNames())
                let pesquisa = {};
                if (unidadeMedida) pesquisa.unidadeMedida = { $regex: unidadeMedida, $options: 'i' };
                if (descricao) pesquisa.descricao = { $regex: descricao, $options: 'i' };
                if (codigoClasse) pesquisa.codigoClasse = Number(codigoClasse);
                if (descricaoClasse) pesquisa.descricaoClasse = { $regex: descricaoClasse, $options: 'i' };
                mongoose.model('materiaisMS').find(pesquisa).then(materiais => {
                    res.status(200).json({ sucesso: true, mensagem: "Materiais cadastradas no sistema.", quantidade: materiais.length, materiais })
                })
            } else MaterialMS.find({ _id: _id }).then(materiais => res.status(200).json({
                sucesso: true,
                mensagem: "Material cadastrado no sistema.", materiais
            }))
        }
        
    })

router.route('/codigosClasses')
    .get((req, res) => {
        CodigoMateriais.find().then(codigos => res.json(codigos))
    })

module.exports = router;