const express = require('express');
const router = express.Router();
const queryString = require('query-string');

var Material = require('../models/Material');

router.route('/')
    .get((req, res) => {
        const { _id, unidadeMedida, descricao, codigoClasse, descricaoClasse } = queryString.parse(req._parsedUrl.query);
        if (_id === "todos") Material.find().then(materiais => res.status(200).json({sucesso: true,
            mensagem: "Materiais cadastradas no sistema.", quantidade: materiais.length, materiais}))
        else if (unidadeMedida || descricao || codigoClasse || descricaoClasse) {
            let pesquisa = {};
            if (unidadeMedida) pesquisa.unidadeMedida = { $regex: unidadeMedida, $options: 'i' };
            if (descricao) pesquisa.descricao = { $regex: descricao, $options: 'i' };
            if (codigoClasse) pesquisa.codigoClasse = Number(codigoClasse);
            if (descricaoClasse) pesquisa.descricaoClasse = { $regex: descricaoClasse, $options: 'i' };
            Material.find(pesquisa).then(materiais => res.status(200).json({sucesso: true,
                mensagem: "Materiais cadastradas no sistema.", quantidade: materiais.length, materiais}))
        } else Material.findById(_id).then(material => res.status(200).json({sucesso: true,
            mensagem: "Material cadastrado no sistema.", material}))
    })

module.exports = router;