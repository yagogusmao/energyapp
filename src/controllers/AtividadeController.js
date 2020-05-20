const express = require('express');
const router = express.Router();

var Atividade = require('../models/Atividade');

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
            let atividade = new Atividade();
            atividade.criar(_id, nome, tipo, valor);
            atividade.save((erro, atividade) => {
                if (!erro) res.status(201).json({ sucesso: true, messagem: "Atividade salva com sucesso.", atividade });
                else res.status(400).json({ sucesso: false, messagem: erro });
            })
        } catch (erro) {
            res.status(401).json({ sucesso: false, messagem: erro });
        }
    })
    .get((req, res) => {
        Atividade.find().then(atividades => res.status(200).json({ sucesso: true, messagem: "Atividades cadastradas no sistema.", atividades }))
    })

module.exports = router;