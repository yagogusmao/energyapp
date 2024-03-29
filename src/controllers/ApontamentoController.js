const express = require('express');
const router = express.Router();
const queryString = require('query-string');

const Apontamento = require('../models/Apontamento');
const Funcionario = require('../models/Funcionario');
const Equipe = require('../models/Equipe');
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
                    quantidadePlanejada, quantidadeExecutada, recolha, tensao } = req.body;
                let apontamento = new Apontamento();
                apontamento.iniciar(tipo, pessoaSupervisor, pessoaEncarregado, pes, equipe, cidade, endereco,
                    localSaida, codigoObra, req.base, subestacao, area, alimentador, origemOS,
                    quantidadePlanejada, quantidadeExecutada, recolha, tensao)
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
                const { _id, tecnicoEnergisa, veiculoKmFim, PgCp, atividades, horarioInicio, horarioFinal, observacao, veiculoKmInicio } = req.body;
                Apontamento.findById(_id).then(apontamento => {
                    if (apontamento) {
                        if (apontamento.status === "INICIADO") {
                            apontamento.finalizar(tecnicoEnergisa, veiculoKmFim, PgCp, atividades, horarioInicio, horarioFinal, observacao, veiculoKmInicio).then(() => {
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
        else if (opcao === "FINALIZADO") Apontamento.find({ status: opcao, base: req.base }).then(async apontamentos => {
            const data = verDatas();
            const construcao = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "CONSTRUCAO" });
            const construcaoHoje = construcao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha) })
            const construcaoSemana = construcao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana) })
            const construcaoMes = construcao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const construcaoAno = construcao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno) })
            const manutencao = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "MANUTENCAO" });
            const manutencaoHoje = manutencao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha) })
            const manutencaoSemana = manutencao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana) })
            const manutencaoMes = manutencao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const manutencaoAno = manutencao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno) })
            const linhaviva = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "LINHA VIVA" });
            const linhavivaHoje = linhaviva.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha) })
            const linhavivaSemana = linhaviva.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana) })
            const linhavivaMes = linhaviva.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const linhavivaAno = linhaviva.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno) })
            const poda = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "PODA" });
            const podaHoje = poda.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha) })
            const podaSemana = poda.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana) })
            const podaMes = poda.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const podaAno = poda.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno) })
            const decp = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "DECP" })
            const decpHoje = decp.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha) })
            const decpSemana = decp.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana) })
            const decpMes = decp.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const decpAno = decp.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno) })
            const deop = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "DEOP" });
            const deopHoje = deop.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.hoje && apontamento.hora.fim < data.amanha) })
            const deopSemana = deop.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioSemana && apontamento.hora.fim < data.finalSemana) })
            const deopMes = deop.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const deopAno = deop.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioAno && apontamento.hora.fim < data.finalAno) })
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

const verDatas = () => {
    const firstDayWeek = currentWeek.getFirstWeekDay();
    const dia = new Date().getDate() > 9 ? new Date().getDate().toString() : '0' + new Date().getDate().toString();
    const mes = new Date().getMonth() > 9 ? (new Date().getMonth() + 1).toString() : '0' + (new Date().getMonth() + 1).toString();
    const mesSemana = Number(firstDayWeek.split('.')[1]) + 1 > 9 ? `${Number(firstDayWeek.split('.')[1]) + 1}` : `0${Number(firstDayWeek.split('.')[1]) + 1}`;
    const diaSemana = Number(firstDayWeek.split('.')[0]) - 1 > 9 ? `${Number(firstDayWeek.split('.')[0]) - 1}` : `0${Number(firstDayWeek.split('.')[0]) - 1}`;
    const ano = new Date().getFullYear().toString();
    return {
        hoje: new Date(moment(`${ano}${mes}${dia}`).format()),
        amanha: new Date(moment(`${ano}${mes}${dia}`).add(1, 'day').format()),
        inicioSemana: new Date(moment(`${ano}${mesSemana}${diaSemana}`).format()),
        finalSemana: new Date(moment(`${ano}${mesSemana}${diaSemana}`).add(7, 'days').format()),
        inicioMes: new Date(moment(`${ano}${mes}01`).format()),
        finalMes: new Date(moment(new Date(Number(ano), Number(mes), 0)).add(24, 'hours').format()),
        inicioAno: new Date(moment(`${ano}0101`).format()),
        finalAno: new Date(moment(new Date(Number(ano), 12, 0)).add(24, 'hours').format())
    }
}

router.route('/dashboard')
    .get((req, res) => {
        Apontamento.find({ status: "FINALIZADO", base: req.base }).then(async apontamentos => {
            const data = verDatas();
            const construcao = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "CONSTRUCAO" });
            const construcaoMes = construcao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const manutencao = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "MANUTENCAO" });
            const manutencaoMes = manutencao.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const linhaviva = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "LINHA VIVA" });
            const linhavivaMes = linhaviva.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const poda = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "PODA" });
            const podaMes = poda.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const decp = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "DECP" })
            const decpMes = decp.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })
            const deop = apontamentos.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return apontamento.tipo === "DEOP" });
            const deopMes = deop.filter(apontamento => { apontamento.lucro = apontamento.lucro.toFixed(2); return (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes) })

            const realizado = construcaoMes.reduce((acumulado, apontamento) => acumulado += apontamento.lucro,
                manutencaoMes.reduce((acumulado, apontamento) => acumulado += apontamento.lucro,
                    linhavivaMes.reduce((acumulado, apontamento) => acumulado += apontamento.lucro,
                        podaMes.reduce((acumulado, apontamento) => acumulado += apontamento.lucro,
                            decpMes.reduce((acumulado, apontamento) => acumulado += apontamento.lucro,
                                deopMes.reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0))))));
            const equipes = await Equipe.find({ base: req.base });
            const equipesApuradas = equipes.length;
            const equipesAlcancandoMeta = equipes.reduce((acumulado, equipe) => {
                if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                    .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                    return acumulado = acumulado + 1;
                else return acumulado;
            }, 0);

            const faturado = construcao.filter(apontamento => apontamento.dataFaturamento > data.inicioMes && apontamento.dataFaturamento < data.finalMes).concat(
                manutencao.filter(apontamento => apontamento.dataFaturamento > data.inicioMes && apontamento.dataFaturamento < data.finalMes).concat(
                    linhaviva.filter(apontamento => apontamento.dataFaturamento > data.inicioMes && apontamento.dataFaturamento < data.finalMes).concat(
                        poda.filter(apontamento => apontamento.dataFaturamento > data.inicioMes && apontamento.dataFaturamento < data.finalMes).concat(
                            decp.filter(apontamento => apontamento.dataFaturamento > data.inicioMes && apontamento.dataFaturamento < data.finalMes).concat(
                                deop.filter(apontamento => apontamento.dataFaturamento > data.inicioMes && apontamento.dataFaturamento < data.finalMes)
                            )
                        )
                    )
                )
            ).reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0);

            const realizadoEquipes = equipes.map(equipe =>
                apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                    .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)
            )

            const metaAcumuladaEquipes = equipes.map(equipe =>
                equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0
            )

            const oportunidade = equipes.reduce((acumulado, equipe) => {
                if (equipe.metaMensal) return acumulado += equipe.metaMensal
                else return acumulado;
            }, 0);

            const metaMensal = 300000;
            const metaAcumulada = (metaMensal / new Date().getDate()).toFixed(2);
            const diferenca = (realizado - metaAcumulada).toFixed(2);

            const graficoConstrucao = equipes.filter((equipe, i) => {
                equipe.i = i;
                return equipe.tipo === "CONSTRUCAO"
            }).map(equipe => {
                return [equipe._id,
                realizadoEquipes[equipe.i],
                realizadoEquipes[equipe.i].toString(),
                realizadoEquipes[equipe.i] >= metaAcumuladaEquipes[equipe.i] ? 'color: green' : 'color: red',
                metaAcumuladaEquipes[equipe.i],
                equipe.metaMensal !== undefined ? equipe.metaMensal : 0]
            }
            ).sort();
            const graficoManutencao = equipes.filter((equipe, i) => {
                equipe.i = i;
                return equipe.tipo === "MANUTENCAO"
            }).map(equipe =>
                [equipe._id,
                realizadoEquipes[equipe.i],
                realizadoEquipes[equipe.i].toString(),
                realizadoEquipes[equipe.i] >= metaAcumuladaEquipes[equipe.i] ? 'color: green' : 'color: red',
                metaAcumuladaEquipes[equipe.i],
                equipe.metaMensal !== undefined ? equipe.metaMensal : 0]
            ).sort();
            const graficoLinhaviva = equipes.filter((equipe, i) => {
                equipe.i = i;
                return equipe.tipo === "LINHA VIVA"
            }).map(equipe =>
                [equipe._id,
                realizadoEquipes[equipe.i],
                realizadoEquipes[equipe.i].toString(),
                realizadoEquipes[equipe.i] >= metaAcumuladaEquipes[equipe.i] ? 'color: green' : 'color: red',
                metaAcumuladaEquipes[equipe.i],
                equipe.metaMensal !== undefined ? equipe.metaMensal : 0]
            ).sort();
            const graficoPoda = equipes.filter((equipe, i) => {
                equipe.i = i;
                return equipe.tipo === "PODA"
            }).map(equipe =>
                [equipe._id,
                realizadoEquipes[equipe.i],
                realizadoEquipes[equipe.i].toString(),
                realizadoEquipes[equipe.i] >= metaAcumuladaEquipes[equipe.i] ? 'color: green' : 'color: red',
                metaAcumuladaEquipes[equipe.i],
                equipe.metaMensal !== undefined ? equipe.metaMensal : 0]
            ).sort();
            const graficoDECP = equipes.filter((equipe, i) => {
                equipe.i = i;
                return equipe.tipo === "DECP"
            }).map(equipe =>
                [equipe._id,
                realizadoEquipes[equipe.i],
                realizadoEquipes[equipe.i].toString(),
                realizadoEquipes[equipe.i] >= metaAcumuladaEquipes[equipe.i] ? 'color: green' : 'color: red',
                metaAcumuladaEquipes[equipe.i],
                equipe.metaMensal !== undefined ? equipe.metaMensal : 0]
            ).sort();
            const graficoDEOP = equipes.filter((equipe, i) => {
                equipe.i = i;
                return equipe.tipo === "DEOP"
            }).map(equipe =>
                [equipe._id,
                realizadoEquipes[equipe.i],
                realizadoEquipes[equipe.i].toString(),
                realizadoEquipes[equipe.i] >= metaAcumuladaEquipes[equipe.i] ? 'color: green' : 'color: red',
                metaAcumuladaEquipes[equipe.i],
                equipe.metaMensal !== undefined ? equipe.metaMensal : 0]
            ).sort();

            const global = [{ metaMensal, metaAcumulada, realizado, equipesApuradas, equipesAlcancandoMeta, diferenca, oportunidade, faturado }];

            const segmentos = [{
                segmento: "LINHA VIVA LEVE",
                metaAcumulada: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "LINHA VIVA LEVE";
                }).reduce((acumulado, equipe) => acumulado += metaAcumuladaEquipes[equipe.i], 0).toFixed(2),
                realizado: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "LINHA VIVA LEVE";
                }).reduce((acumulado, equipe) => acumulado += realizadoEquipes[equipe.i], 0).toFixed(2)
            }, {
                segmento: "LINHA VIVA PESADA",
                metaAcumulada: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "LINHA VIVA PESADA";
                }).reduce((acumulado, equipe) => acumulado += metaAcumuladaEquipes[equipe.i], 0).toFixed(2),
                realizado: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "LINHA VIVA PESADA";
                }).reduce((acumulado, equipe) => acumulado += realizadoEquipes[equipe.i], 0).toFixed(2)
            }, {
                segmento: "LINHA MORTA LEVE",
                metaAcumulada: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "LINHA MORTA LEVE";
                }).reduce((acumulado, equipe) => acumulado += metaAcumuladaEquipes[equipe.i], 0).toFixed(2),
                realizado: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "LINHA MORTA LEVE";
                }).reduce((acumulado, equipe) => acumulado += realizadoEquipes[equipe.i], 0).toFixed(2)
            }, {
                segmento: "LINHA MORTA PESADA",
                metaAcumulada: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "LINHA MORTA PESADA";
                }).reduce((acumulado, equipe) => acumulado += metaAcumuladaEquipes[equipe.i], 0).toFixed(2),
                realizado: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "LINHA MORTA PESADA";
                }).reduce((acumulado, equipe) => acumulado += realizadoEquipes[equipe.i], 0).toFixed(2)
            }, {
                segmento: "CONSTRUCAO",
                metaAcumulada: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "CONSTRUCAO";
                }).reduce((acumulado, equipe) => acumulado += metaAcumuladaEquipes[equipe.i], 0).toFixed(2),
                realizado: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "CONSTRUCAO";
                }).reduce((acumulado, equipe) => acumulado += realizadoEquipes[equipe.i], 0).toFixed(2)
            }, {
                segmento: "PODA URBANA",
                metaAcumulada: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "PODA URBANA";
                }).reduce((acumulado, equipe) => acumulado += metaAcumuladaEquipes[equipe.i], 0).toFixed(2),
                realizado: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "PODA URBANA";
                }).reduce((acumulado, equipe) => acumulado += realizadoEquipes[equipe.i], 0).toFixed(2)
            }, {
                segmento: "PODA RURAL",
                metaAcumulada: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "PODA RURAL";
                }).reduce((acumulado, equipe) => acumulado += metaAcumuladaEquipes[equipe.i], 0).toFixed(2),
                realizado: equipes.filter((equipe, i) => {
                    equipe.i = i;
                    return equipe.segmento === "PODA RURAL";
                }).reduce((acumulado, equipe) => acumulado += realizadoEquipes[equipe.i], 0).toFixed(2)
            }]

            const equipesLeom = equipes.filter(equipe => (equipe.tipo === "LINHA VIVA" || equipe.tipo === "PODA"));
            const equipesAnderson = equipes.filter(equipe => (equipe.tipo === "CONSTRUCAO" || equipe.tipo === "MANUTENCAO"));
            const equipesAlisson = equipes.filter(equipe => (equipe.tipo === "DEOP" || equipe.tipo === "DECP"));

            const equipesValberio = equipes.filter(equipe => equipe.tipo === "MANUTENCAO");
            const equipesHildevan = equipes.filter(equipe => equipe.tipo === "CONSTRUCAO");
            const equipesEdnaldo = equipes.filter(equipe => equipe.tipo === "DECP");
            const equipesAntonio = equipes.filter(equipe => equipe.tipo === "DEOP");

            const fiscaisTecnicos = [{
                fiscalTecnico: "VALBÉRIO",
                metaMensal: equipesValberio
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2),
                metaAcumulada: equipesValberio
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0).toFixed(2),
                realizado: apontamentos.filter(apontamento => ((apontamento.tipo === "MANUTENCAO") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0).toFixed(2),
                equipesApuradas: equipesValberio.length,
                equipesAlcancandoMeta: equipesValberio
                    .reduce((acumulado, equipe) => {
                        if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                            .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                            .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                            return acumulado = acumulado + 1;
                        else return acumulado;
                    }, 0),
                diferenca: (equipesValberio
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0)
                    -
                    apontamentos.filter(apontamento => ((apontamento.tipo === "MANUTENCAO") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                        .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)).toFixed(2),
                oportunidade: equipesValberio
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2)
            }, {
                fiscalTecnico: "HILDEVAN",
                metaMensal: equipesHildevan
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2),
                metaAcumulada: equipesHildevan
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0).toFixed(2),
                realizado: apontamentos.filter(apontamento => ((apontamento.tipo === "CONSTRUCAO") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0).toFixed(2),
                equipesApuradas: equipesHildevan.length,
                equipesAlcancandoMeta: equipesHildevan
                    .reduce((acumulado, equipe) => {
                        if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                            .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                            .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                            return acumulado = acumulado + 1;
                        else return acumulado;
                    }, 0),
                diferenca: (equipesHildevan
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0)
                    -
                    apontamentos.filter(apontamento => ((apontamento.tipo === "CONSTRUCAO") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                        .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)).toFixed(2),
                oportunidade: equipesHildevan
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2)
            }, {
                fiscalTecnico: "LAERTE",
                metaMensal: equipesLeom
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2),
                metaAcumulada: equipesLeom
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0).toFixed(2),
                realizado: apontamentos.filter(apontamento => ((apontamento.tipo === "LINHA VIVA" || apontamento.tipo === "PODA") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0).toFixed(2),
                equipesApuradas: equipesLeom.length,
                equipesAlcancandoMeta: equipesLeom
                    .reduce((acumulado, equipe) => {
                        if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                            .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                            .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                            return acumulado = acumulado + 1;
                        else return acumulado;
                    }, 0),
                diferenca: (equipesLeom
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0)
                    -
                    apontamentos.filter(apontamento => ((apontamento.tipo === "LINHA VIVA" || apontamento.tipo === "PODA") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                        .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)).toFixed(2),
                oportunidade: equipesLeom
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2)
            }, {
                fiscalTecnico: "EDNALDO",
                metaMensal: equipesEdnaldo
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2),
                metaAcumulada: equipesEdnaldo
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0).toFixed(2),
                realizado: apontamentos.filter(apontamento => ((apontamento.tipo === "DECP") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0).toFixed(2),
                equipesApuradas: equipesEdnaldo.length,
                equipesAlcancandoMeta: equipesEdnaldo
                    .reduce((acumulado, equipe) => {
                        if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                            .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                            .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                            return acumulado = acumulado + 1;
                        else return acumulado;
                    }, 0),
                diferenca: (equipesEdnaldo
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0)
                    -
                    apontamentos.filter(apontamento => ((apontamento.tipo === "DECP") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                        .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)).toFixed(2),
                oportunidade: equipesEdnaldo
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2)
            }, {
                fiscalTecnico: "ANTONIO",
                metaMensal: equipesAntonio
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2),
                metaAcumulada: equipesAntonio
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0).toFixed(2),
                realizado: apontamentos.filter(apontamento => ((apontamento.tipo === "DEOP") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0).toFixed(2),
                equipesApuradas: equipesAntonio.length,
                equipesAlcancandoMeta: equipesAntonio
                    .reduce((acumulado, equipe) => {
                        if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                            .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                            .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                            return acumulado = acumulado + 1;
                        else return acumulado;
                    }, 0),
                diferenca: (equipesAntonio
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0)
                    -
                    apontamentos.filter(apontamento => ((apontamento.tipo === "DEOP") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                        .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)).toFixed(2),
                oportunidade: equipesAntonio
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2)
            }]

            const supervisores = [{
                supervisor: "ANDERSON",
                metaMensal: equipesAnderson
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2),
                metaAcumulada: equipesAnderson
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0).toFixed(2),
                realizado: apontamentos.filter(apontamento => ((apontamento.tipo === "CONSTRUCAO" || apontamento.tipo === "MANUTENCAO") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0).toFixed(2),
                equipesApuradas: equipesAnderson.length,
                equipesAlcancandoMeta: equipesAnderson
                    .reduce((acumulado, equipe) => {
                        if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                            .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                            .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                            return acumulado = acumulado + 1;
                        else return acumulado;
                    }, 0),
                diferenca: (equipesAnderson
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0)
                    -
                    apontamentos.filter(apontamento => ((apontamento.tipo === "CONSTRUCAO" || apontamento.tipo === "MANUTENCAO") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                        .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)).toFixed(2),
                oportunidade: equipesAnderson
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2)
            }, {
                supervisor: "LEOM",
                metaMensal: equipesLeom
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2),
                metaAcumulada: equipesLeom
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0).toFixed(2),
                realizado: apontamentos.filter(apontamento => ((apontamento.tipo === "LINHA VIVA" || apontamento.tipo === "PODA") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0).toFixed(2),
                equipesApuradas: equipesLeom.length,
                equipesAlcancandoMeta: equipesLeom
                    .reduce((acumulado, equipe) => {
                        if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                            .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                            .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                            return acumulado = acumulado + 1;
                        else return acumulado;
                    }, 0),
                diferenca: (equipesLeom
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0)
                    -
                    apontamentos.filter(apontamento => ((apontamento.tipo === "LINHA VIVA" || apontamento.tipo === "PODA") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                        .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)).toFixed(2),
                oportunidade: equipesLeom
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2)
            }, {
                supervisor: "ALISSON",
                metaMensal: equipesAlisson
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2),
                metaAcumulada: equipesAlisson
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0).toFixed(2),
                realizado: apontamentos.filter(apontamento => ((apontamento.tipo === "DECP" || apontamento.tipo === "DEOP") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                    .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0).toFixed(2),
                equipesApuradas: equipesAlisson.length,
                equipesAlcancandoMeta: equipesAlisson
                    .reduce((acumulado, equipe) => {
                        if (apontamentos.filter(apontamento => apontamento.equipe === equipe._id)
                            .filter(apontamento => (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes))
                            .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0) > equipe.metaMensal)
                            return acumulado = acumulado + 1;
                        else return acumulado;
                    }, 0),
                diferenca: (equipesAlisson
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal / new Date().getDate() : 0, 0)
                    -
                    apontamentos.filter(apontamento => ((apontamento.tipo === "DECP" || apontamento.tipo === "DEOP") && (apontamento.hora.fim > data.inicioMes && apontamento.hora.fim < data.finalMes)))
                        .reduce((acumulado, apontamento) => acumulado += apontamento.lucro, 0)).toFixed(2),
                oportunidade: equipesAlisson
                    .reduce((acumulado, equipe) => acumulado += equipe.metaMensal !== undefined ? equipe.metaMensal : 0, 0).toFixed(2)
            }]

            const supervisaoErik = supervisores.filter(supervisor => supervisor.supervisor === "ANDERSON" || supervisor.supervisor === "LEOM");
            const supervisaoFred = supervisores.filter(supervisor => supervisor.supervisor === "ALISSON");

            const gestores = [{
                gestor: "ERIK",
                metaMensal: supervisaoErik.reduce((acumulado, supervisao) => acumulado += Number(supervisao.metaMensal), 0).toFixed(2),
                metaAcumulada: supervisaoErik.reduce((acumulado, supervisao) => acumulado += Number(supervisao.metaAcumulada), 0).toFixed(2),
                realizado: supervisaoErik.reduce((acumulado, supervisao) => acumulado += Number(supervisao.realizado), 0).toFixed(2),
                equipesApuradas: supervisaoErik.reduce((acumulado, supervisao) => acumulado += supervisao.equipesApuradas, 0),
                equipesAlcancandoMeta: supervisaoErik.reduce((acumulado, supervisao) => acumulado += supervisao.equipesAlcancandoMeta, 0),
                diferenca: supervisaoErik.reduce((acumulado, supervisao) => acumulado += Number(supervisao.diferenca), 0).toFixed(2),
                oportunidade: supervisaoErik.reduce((acumulado, supervisao) => acumulado += Number(supervisao.oportunidade), 0).toFixed(2)
            }, {
                gestor: "FRED",
                metaMensal: supervisaoFred.reduce((acumulado, supervisao) => acumulado += Number(supervisao.metaMensal), 0).toFixed(2),
                metaAcumulada: supervisaoFred.reduce((acumulado, supervisao) => acumulado += Number(supervisao.metaAcumulada), 0).toFixed(2),
                realizado: supervisaoFred.reduce((acumulado, supervisao) => acumulado += Number(supervisao.realizado), 0).toFixed(2),
                equipesApuradas: supervisaoFred.reduce((acumulado, supervisao) => acumulado += supervisao.equipesApuradas, 0),
                equipesAlcancandoMeta: supervisaoFred.reduce((acumulado, supervisao) => acumulado += supervisao.equipesAlcancandoMeta, 0),
                diferenca: supervisaoFred.reduce((acumulado, supervisao) => acumulado += Number(supervisao.diferenca), 0).toFixed(2),
                oportunidade: supervisaoFred.reduce((acumulado, supervisao) => acumulado += Number(supervisao.oportunidade), 0).toFixed(2)
            }]

            const grafico = graficoConstrucao.concat(graficoManutencao, graficoLinhaviva, graficoPoda, graficoDECP, graficoDEOP);

            grafico.unshift(['Equipes', 'Realizado', { role: 'annotation' }, { role: 'style' }, 'Meta Acumulada', 'Meta Mensal']);
            graficoConstrucao.unshift(['Equipes', 'Realizado', { role: 'annotation' }, { role: 'style' }, 'Meta Acumulada', 'Meta Mensal'])
            graficoManutencao.unshift(['Equipes', 'Realizado', { role: 'annotation' }, { role: 'style' }, 'Meta Acumulada', 'Meta Mensal'])
            graficoLinhaviva.unshift(['Equipes', 'Realizado', { role: 'annotation' }, { role: 'style' }, 'Meta Acumulada', 'Meta Mensal'])
            graficoPoda.unshift(['Equipes', 'Realizado', { role: 'annotation' }, { role: 'style' }, 'Meta Acumulada', 'Meta Mensal'])
            graficoDECP.unshift(['Equipes', 'Realizado', { role: 'annotation' }, { role: 'style' }, 'Meta Acumulada', 'Meta Mensal'])
            graficoDEOP.unshift(['Equipes', 'Realizado', { role: 'annotation' }, { role: 'style' }, 'Meta Acumulada', 'Meta Mensal'])

            res.status(200).json({
                sucesso: true,
                mensagem: "Dashboard retornado com sucesso.",
                grafico, realizado, equipesApuradas,
                equipesAlcancandoMeta, realizadoEquipes, metaAcumuladaEquipes, oportunidade,
                metaMensal, metaAcumulada, diferenca, global, segmentos,
                graficoConstrucao, graficoManutencao, graficoLinhaviva, graficoPoda, graficoDECP, graficoDEOP,
                faturado, supervisores, gestores, fiscaisTecnicos
            })
        })
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
//teste
router.route('/verAtividades')
    .get((req, res) => {
        const { _id } = queryString.parse(req._parsedUrl.query);
        Apontamento.findById(_id).then(apontamento => {
            if (apontamento) {
                apontamento.verAtividades().then(atividades => res.status(200).json({
                    sucesso: true, mensagem: "Atividades retornadas com sucesso", atividades
                }))
            } else res.status(400).json({ sucesso: false, mensagem: "Apontamento não encontrado." })
        })
    })

router.route('/faturar')
    .post((req, res) => {
        const { _id } = req.body;
        Apontamento.findById(_id).then(apontamento => {
            if (apontamento) {
                apontamento.faturar();
                apontamento.save((error) => {
                    if (!error) res.status(200).json({ sucesso: true, mensagem: "Apontamento faturado com sucesso.", apontamento });
                    else res.status(400).json({ sucesso: false, mensagem: error.message })
                })
            } else res.status(400).json({ sucesso: false, mensagem: "Apontamento não encontrado." })
        })
    })

router.route('/faturar/obra')
    .post((req, res) => {
        const { codigoObra } = req.body;
        Apontamento.find({ codigoObra, base: req.base }).or([{ tipo: req.equipes }]).then(async apontamentos => {
            if (apontamentos.length !== 0)
                res.status(200).json({
                    sucesso: true,
                    mensagem: "Obra faturada com sucesso.",
                    apontamentos: await Promise.all(apontamentos.map(apontamento => {
                        apontamento.faturar();
                        return apontamento.save();
                    }))
                })
            else res.status(400).json({ sucesso: false, mensagem: "Obra não encontrada." });
        })
    })
    .get((req, res) => {
        const { codigoObra } = queryString.parse(req._parsedUrl.query);
        Apontamento.find({ codigoObra, base: req.base }).or([{ tipo: req.equipes }]).then(async apontamentos => {
            if (apontamentos.length !== 0) res.status(200).json({ sucesso: true, mensagem: "Apontamentos da obra.", apontamentos })
            else res.status(400).json({ sucesso: false, mensagem: "Obra não encontrada." });
        })
    })

module.exports = router;