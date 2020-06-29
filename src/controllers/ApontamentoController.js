const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Apontamento = require('../models/Apontamento');
const Funcionario = require('../models/Funcionario');
const moment = require('moment');
const currentWeek = require('current-week');

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
            if (req.funcao === "SUPERVISOR" || req._id === "517") {
                const { tipo, pessoaSupervisor, pessoaEncarregado, pes, equipe, cidade, endereco, 
                    localSaida, codigoObra, subestacao, area, alimentador, origemOS, 
                    quantidadePlanejada, quantidadeExecutada, recolha, observacao, tensao } = req.body;
                let apontamento = new Apontamento();
                apontamento.iniciar(tipo, pessoaSupervisor, pessoaEncarregado, pes, equipe, cidade, endereco, 
                    localSaida, codigoObra, req.base, subestacao, area, alimentador, origemOS, 
                    quantidadePlanejada, quantidadeExecutada, recolha, observacao, tensao)
                    .then(() => {
                        apontamento.save((erro, apontamento) => {
                            if (!erro) res.status(201).json({
                                sucesso: true,
                                mensagem: "Apontamento criado com sucesso.", apontamento
                            });
                            else res.status(400).json({ sucesso: false, mensagem: erro.message });
                        })
                    }).catch(erro => { res.status(400).json({ sucesso: false, mensagem: erro + "" }); })
            } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para supervisores." });
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
            if (req.funcao === "SUPERVISOR" || req._id === "517") {
                const { _id, tecnicoEnergisa, veiculoKmFim, PgCp, atividades } = req.body;
                Apontamento.findById(_id).then(apontamento => {
                    if (apontamento) {
                        if (apontamento.status === "INICIADO") {
                            apontamento.finalizar(tecnicoEnergisa, veiculoKmFim, PgCp, atividades).then(() => {
                                apontamento.save((erro, apontamento) => {
                                    if (!erro) res.status(200).json({
                                        sucesso: true,
                                        mensagem: "Apontamento finalizado com sucesso.", apontamento
                                    });
                                    else res.status(400).json({ sucesso: false, mensagem: erro.message });
                                })
                            }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }))
                        } else res.status(400).json({ sucesso: false, mensagem: "Apontamento já finalizado." })
                    } else res.status(400).json({ sucesso: false, mensagem: "Apontamento não encontrado." });
                }).catch(erro => res.status(400).json({ sucesso: false, mensagem: erro + "" }))
            } else res.status(400).json({ sucesso: false, mensagem: "Ação permitida apenas para supervisores." });
        } catch (erro) { res.status(400).json({ sucesso: false, mensagem: erro + "" }) }

    })

    /**
     * get exemplo localhost:8080/apontamento?_id=all
     * localhost:8080/apontamento?_id=<_id do apontamento>
     */

    .get((req, res) => {
        const { _id, opcao } = queryString.parse(req._parsedUrl.query);
        if (opcao === "INICIADO")
            Apontamento.find({ status: opcao, base: req.base }).then(apontamentos =>
                res.status(200).json({ sucesso: true, apontamentos }))
        else if (opcao === "FINALIZADO") Apontamento.find({ status: opcao, base: req.base }).then(apontamentos => {
            const data = verDatas();
            const construcao = apontamentos.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "CONSTRUCAO"});
            const construcaoHoje = construcao.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha)})
            const construcaoSemana = construcao.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana)})
            const construcaoMes = construcao.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)})
            const construcaoAno = construcao.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno)})
            const manutencao = apontamentos.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "MANUTENCAO"});
            const manutencaoHoje = manutencao.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha)})
            const manutencaoSemana = manutencao.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana)})
            const manutencaoMes = manutencao.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)})
            const manutencaoAno = manutencao.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno)})
            const linhaviva = apontamentos.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "LINHA VIVA"});
            const linhavivaHoje = linhaviva.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha)})
            const linhavivaSemana = linhaviva.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana)})
            const linhavivaMes = linhaviva.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)})
            const linhavivaAno = linhaviva.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno)})
            const poda = apontamentos.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "PODA"});
            const podaHoje = poda.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha)})
            const podaSemana = poda.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana)})
            const podaMes = poda.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)})
            const podaAno = poda.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno)})
            const decp = apontamentos.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "DECP"})
            const decpHoje = decp.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha)})
            const decpSemana = decp.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana)})
            const decpMes = decp.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)})
            const decpAno = decp.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno)})
            const deop = apontamentos.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "DEOP"});
            const deopHoje = deop.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha)})
            const deopSemana = deop.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana)})
            const deopMes = deop.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)})
            const deopAno = deop.filter(apontamento => {apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno)})
            res.status(200).json({
                sucesso: true,
                mensagem: "Apontamentos cadastrados no sistema.",
                apontamentos,
                construcao, construcaoHoje, construcaoSemana, construcaoMes, construcaoAno,
                manutencao, manutencaoHoje, manutencaoSemana, manutencaoMes, manutencaoAno,
                linhaviva, linhavivaHoje, linhavivaSemana, linhavivaMes, linhavivaAno,
                poda, podaHoje, podaSemana, podaMes, podaAno,
                decp, decpHoje, decpSemana, decpMes, decpAno,
                deop, deopHoje, deopSemana, deopMes, deopAno
            })
        })
        else Apontamento.findById(_id).then(apontamento => {
            if (apontamento) res.status(200).json({
                sucesso: true,
                mensagem: "Apontamento retornado com sucesso.", apontamento
            });
            else res.status(400).json({ sucesso: false, erro: "Apontamento não encontrado." });
        }).catch(erro => res.status(400).json({ sucesso: false, erro: erro.message }))
    })

function verDatas() {
    const dia = new Date().getDate() > 9 ? new Date().getDate().toString() : '0' + (new Date().getDate() + 1).toString();
    const mes = new Date().getMonth() > 9 ? new Date().getMonth().toString() : '0' + (new Date().getMonth() + 1).toString();
    const ano = new Date().getFullYear().toString();
    return {
        hoje: new Date(moment(`${ano}${mes}${dia}`).subtract(3, 'hours').format()),
        amanha: new Date(moment(`${ano}${mes}${dia}`).subtract(3, 'hours').add(1, 'day').format()),
        inicioSemana: new Date(moment(`${ano}${mes}${Number(currentWeek.getFirstWeekDay().split('.')[0]) - 1}`).subtract(3, 'hours').format()),
        finalSemana: new Date(moment(`${ano}${mes}${Number(currentWeek.getLastWeekDay().split('.')[0]) - 1}`).add(20, 'hours').add(59, 'minutes').add(59, 'seconds').format()),
        inicioMes: new Date(moment(`${ano}${mes}01`).subtract(3, 'hours').format()),
        finalMes: new Date(moment(new Date(Number(ano), Number(mes), 0)).add(20, 'hours').add(59, 'minutes').add(59, 'seconds').format()),
        inicioAno: new Date(moment(`${ano}0101`).subtract(3, 'hours').format()),
        finalAno: new Date(moment(new Date(Number(ano), 12, 0)).add(20, 'hours').add(59, 'minutes').add(59, 'seconds').format()),
    }
}

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
            res.status(200).json({
                lucro: total, quantidadeApontamentos: apontamentos.length,
                mediaLucro: total / apontamentos.length, apontamentos
            })
        })
    })

router.route('/listarSupervisores')
    .get((req, res) => {
        Funcionario.find({ base: req.base, cargo: "SUPERVISOR" }).then(funcionarios => {
            res.status(200).json({
                sucesso: true, mensagem: "Supervisores cadastrados no sistema",
                funcionarios: funcionarios.map(funcionario => { return { value: funcionario.nome, label: funcionario.nome } })
            })
        })
    })

router.route('/listarEncarregados')
    .get((req, res) => {
        if (req.equipes && req.equipes.length > 0) {
            const pesquisa = req.equipes.map(equipe => {
                if (equipe === "CONSTRUCAO" || equipe === "MANUTENCAO") return { cargo: "ENC. LINHA MORTA" };
                if (equipe === "LINHA VIVA") return { cargo: "ENC. LINHA VIVA" };
                if (equipe === "PODA") return { cargo: "ENC. PODA" };
                else return { cargo: equipe }
            })
            Funcionario.find({ base: req.base, $or: pesquisa }).then(funcionarios => res.status(200).json({
                sucesso: true,
                mensagem: "Encarregados cadastrados no sistema.",
                funcionarios: funcionarios.map(funcionario => { return { value: funcionario.nome, label: funcionario.nome } })
            }))
        } else res.status(200).json({
            sucesso: true,
            mensagem: "Encarregados cadastrados no sistema.", funcionarios: []
        })
    })

router.route('/verAtividades')
    .get((req, res) => {
        const { _id } = queryString.parse(req._parsedUrl.query);
        Apontamento.findById(_id).then(apontamento => {
            if (apontamento) {
                apontamento.verAtividades().then(atividades => res.status(200).json({
                    sucesso: true, mensagem: "Atividades retornadas com sucesso", atividades
                }))
            } else res.status(400).json({sucesso: false, mensagem: "Apontamento não encontrado."})
        })

    })

module.exports = router;