const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Apontamento = require('../models/Apontamento');

router.route('/')

    /**
     * post exemplo localhost:8080/apontamento
    {
        "tipo": "CONSTRUCAO",
        "pessoaSupervisor": "Yago",
        "pessoaEncarregado": "Erik",
        "si": "qqrcoisa",
        "equipe": "Alpha",
        "cidade": "Juazeirinho",
        "endereco": "Praça da igreja",
        "localSaida": "Energy CG",
        "codigoObra": "0022000546"
    }
     */

    .post((req, res) => {
        try {
            const { tipo, pessoaSupervisor, pessoaEncarregado, pes, equipe, cidade, endereco, localSaida, codigoObra } = req.body;
            let apontamento = new Apontamento();
            apontamento.iniciar(tipo, pessoaSupervisor, pessoaEncarregado, pes, equipe, cidade, endereco, localSaida, codigoObra)
                .then(() => {
                    apontamento.save((erro, apontamento) => {
                        if (!erro) res.status(201).json({sucesso: true,
                            mensagem: "Apontamento criado com sucesso.", apontamento});
                        else res.status(400).json({ sucesso: false, mensagem: erro.message });
                    })
                }).catch(erro => { res.status(400).json({ sucesso: false, mensagem: erro + "" }); })
        } catch (erro) { res.status(400).json({ sucess: false, mensagem: erro + "" }) }
    })

    /**
     * put exemplo localhost:8080/apontamento
    {
	    "_id": "5eba9021bab5cc1eacabc500",
	    "tecnicoEnergisa": "Roberto",
	    "veiculoKmFim": 124456,
	    "PgCp": "10-30-N1",
	    "atividades": [{
		    "_id": "EY001",
		    "quantidade": 2
	    }, {
		    "_id": "EY005",
		    "quantidade": 5
	    }]
    }
     */

    .put((req, res) => {
        try {
            const { _id, tecnicoEnergisa, veiculoKmFim, PgCp, atividades } = req.body;
            Apontamento.findById(_id).then(apontamento => {
                if (apontamento) {
                    if (apontamento.status === "INICIADO") {
                        apontamento.finalizar(tecnicoEnergisa, veiculoKmFim, PgCp, atividades).then(() => {
                            apontamento.save((erro, apontamento) => {
                                if (!erro) res.status(200).json({ sucesso: true, 
                                    mensagem: "Apontamento finalizado com sucesso.", apontamento });
                                else res.status(400).json({ sucesso: false, mensagem: erro.message });
                            })
                        }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }))
                    } else res.status(400).json({ sucesso: false, mensagem: "Apontamento já finalizado." })
                } else res.status(400).json({ sucesso: false, mensagem: "Apontamento não encontrado." });
            }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }))
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }
    })

    /**
     * get exemplo localhost:8080/apontamento?_id=all
     * localhost:8080/apontamento?_id=<_id do apontamento>
     */

    .get((req, res) => {
        const { _id, opcao } = queryString.parse(req._parsedUrl.query);
        if (opcao) Apontamento.find({status: opcao}).then(apontamentos => res.status(200).json({ sucesso: true, 
            mensagem: "Apontamentos cadastrados no sistema.", apontamentos }))
        else Apontamento.findById(_id).then(apontamento => {
            if (apontamento) res.status(200).json({ sucesso: true, 
                mensagem: "Apontamento retornado com sucesso.", apontamento });
            else res.status(400).json({ sucesso: false, erro: "Apontamento não encontrado." });
        }).catch(erro => res.status(400).json({ sucesso: false, erro: erro.message }))
    })

router.route('/porTempo')
    .get((req, res) => {
        const { inicio, fim } = queryString.parse(req._parsedUrl.query);
        Apontamento.find({
            data: {
                $gte: new Date(inicio),
                $lt: new Date(fim)
            }
        }).then(apontamentos => {
            let total = apontamentos.reduce((acumulado, apontamento) => {
                if (apontamento.status === "FINALIZADO") return acumulado + apontamento.lucro;
                else return acumulado;
            }, 0)
            res.status(200).json({ lucro: total, quantidadeApontamentos: apontamentos.length, 
                mediaLucro: total / apontamentos.length, apontamentos })
        })
    })

module.exports = router;