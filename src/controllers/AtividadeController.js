const express = require('express');
const router = express.Router();

var Atividade = require('../models/Atividade');
const queryString = require('query-string')

router.route('/')
    /**
     * post exemplo localhost:8080/atividade 
    {
	    "_id": "EY010",
	    "tipo": "I",
	    "nome": "POSTE LIMPO (SEM MAT. OU EQUIP.) 12 >=P<= 600",
	    "valor": 115.00
    }
     */
    .post((req, res) => {
        try {
            const { _id, nome, tipo, valor } = req.body;
            if (req.funcao === "SUPERVISOR") {
                let atividade = new Atividade();
                atividade.criar(_id, nome, tipo, valor);
                atividade.save((erro, atividade) => {
                    if (!erro) res.status(201).json({
                        sucesso: true,
                        mensagem: "Atividade salva com sucesso.", atividade
                    });
                    else res.status(400).json({ sucesso: false, mensagem: erro.message });
                })
            } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para supervisores." });
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })
    .get(async (req, res) => {
        const { nome } = queryString.parse(req._parsedUrl.query);
        let atividades;
        if (nome === "all") atividades = await Atividade.find();
        else atividades = await Atividade.find({ nome: { $regex: nome, $options: 'i' } });

        let atividadesShow = [];
        if (req.equipes.includes('CONSTRUCAO')) {
            atividadesShow = atividades
                .filter(atividade => atividade._id.includes("EY"))
                .sort((a, b) => Number(a._id.split("EY")[1]) - Number(b._id.split("EY")[1]));
        } else if (req.equipes.includes('LINHAVIVA')) {
            atividadesShow = atividades
                .filter(atividade =>
                    (atividade._id.includes("LV") || atividade._id === "EY174" || atividade._id === "EY173"))
                .sort((a, b) => Number(a._id.split("LV")[1]) - Number(b._id.split("LV")[1]));
        }
        res.status(200).json({
            sucesso: true,
            mensagem: "Atividades cadastradas no sistema.", atividades: atividadesShow
        })
    })

module.exports = router;