const moongose = require('mongoose');
const Schema = moongose.Schema;

const Atividade = require('./Atividade');
const Equipe = require('./Equipe');
const Veiculo = require('./Veiculo');
const moment = require('moment');

const ApontamentoSchema = new Schema({
    tipo: { type: String, enum: ["MANUTENCAO", "CONSTRUCAO", "DEOP", "PODA", "PERDAS", "LINHA VIVA"], required: true },
    pessoa: {
        supervisor: { type: String, required: true },
        tecnicoEnergisa: String,
        encarregado: { type: String, required: true },
    },
    veiculo: {
        placa: { type: String, required: true },
        kilometragem: {
            inicio: { type: Number, required: true },
            fim: Number,
            total: Number
        }
    },
    base: { type: String, required: true, enum: ['MS', 'PB'] },
    codigoObra: String,
    PgCp: String,
    subestacao: String,
    area: String,
    alimentador: String,
    origemOS: String,
    quantidadePlanejada: Number,
    quantidadeExecutada: Number,
    recolha: Boolean,
    observacao: String,
    tensao: String,
    pes: String,
    equipe: { type: String, required: true },
    cidade: { type: String, required: true },
    endereco: { type: String, required: true },
    data: { type: Date, required: true },
    horarioInicio: String,
    horarioFinal: String,
    dataFinal: String,
    local: {
        saida: { type: String, required: true },
        chegada: { type: String, required: true }
    },
    hora: {
        inicio: { type: Date, required: true },
        fim: Date
    },
    atividades: [],
    lucro: Number,
    status: { type: String, enum: ["INICIADO", "FINALIZADO"], required: true }
});

ApontamentoSchema.methods.iniciar = async function iniciar(tipo, pessoaSupervisor, pessoaEncarregado, pes,
    equipe, cidade, endereco, localSaida, codigoObra, base, subestacao, area, alimentador, origemOS, 
    quantidadePlanejada, quantidadeExecutada, recolha, observacao, tensao) {
    try {
        return await reservarEquipe(equipe, tipo).then(async equipe => {
            const veiculo = await Veiculo.findById(equipe.veiculo);
            this.codigoObra = codigoObra;
            this.tipo = tipo;
            if (this.tipo === "PODA") {
                this.subestacao = subestacao;
                this.area = area;
                this.alimentador = alimentador;
                this.origemOS = origemOS;
                this.quantidadePlanejada = quantidadePlanejada;
                this.quantidadeExecutada = quantidadeExecutada;
                this.recolha = recolha;
                this.tensao = tensao;
            }
            this.observacao = observacao;
            this.pessoa.supervisor = pessoaSupervisor;
            this.pessoa.encarregado = pessoaEncarregado;
            this.veiculo.placa = veiculo;
            this.veiculo.kilometragem.inicio = veiculo.kilometragem;
            this.pes = pes;
            this.equipe = equipe._id;
            this.cidade = cidade;
            this.endereco = endereco;
            this.hora.inicio = new Date();
            this.data = this.hora.inicio;
            this.local.saida = localSaida;
            this.local.chegada = `Cidade: ${this.cidade}, Endereço: ${this.endereco}`;
            this.status = "INICIADO";
            this.base = base;
        }).catch(erro => { throw erro });
    } catch (erro) { throw erro }
}

ApontamentoSchema.methods.finalizar = async function finalizar(tecnicoEnergisa, veiculoKmFim, PgCp,
    atividades, horarioInicio, horarioFinal) {
    try {
        return await Promise.all([liberarEquipe(this.equipe, this, veiculoKmFim), validarAtividades(atividades)])
            .then(promessas => {
                const [equipe, lucro] = promessas;
                this.lucro = lucro;
                this.pessoa.tecnicoEnergisa = tecnicoEnergisa;
                this.veiculo.kilometragem.fim = veiculoKmFim;
                this.veiculo.kilometragem.total = this.veiculo.kilometragem.fim - this.veiculo.kilometragem.inicio;
                this.PgCp = PgCp;
                this.hora.fim = new Date();
                this.dataFinal = moment(this.hora.fim).format("DD/MM/YYYY");
                this.status = "FINALIZADO";
                this.atividades = atividades;
                this.horarioInicio = horarioInicio;
                this.horarioFinal = horarioFinal;
            }).catch(erro => { throw erro });
    } catch (erro) { throw erro }
}

const reservarEquipe = async (equipe, tipo) => {
    return await Equipe.findById(equipe).then(async equipe => {
        if (equipe) {
            if (equipe.status === "OK") {
                if (equipe.tipo === tipo) {
                    equipe.status = "OCUPADA";
                    await equipe.save();
                    return equipe;
                } else throw `Esta equipe não faz serviços deste tipo. O tipo da equipe é ${equipe.tipo}`;
            } else throw `Equipe não disponível. O status da equipe é ${equipe.status}`;
        } else throw `Equipe não encontrada.`;
    })
}

const liberarEquipe = async (equipe, apontamento, veiculoKmFim) => {
    return await Equipe.findById(equipe).then(async equipe => {
        if (equipe) {
            if (equipe.status === "OCUPADA") {
                if (apontamento.veiculo.kilometragem.inicio <= veiculoKmFim) {
                    equipe.status = "OK";
                    equipe.adicionarApontamento(apontamento._id, veiculoKmFim);
                    await equipe.save();
                    return equipe;
                } else throw `Kilometragem inválida. A kilometragem atual do veículo é 
                    ${apontamento.veiculo.kilometragem.inicio}`;
            } else throw `Equipe não está ocupada. O status da equipe é ${equipe.status}`;
        } else throw `Equipe não encontrada.`;
    })
}

const validarAtividades = async (atividades) => {
    return await Promise.all(atividades.map(atividade => Atividade.findById(atividade._id)))
        .then(promessaAtividades => {
            if (!promessaAtividades.includes(null))
                return promessaAtividades.reduce((acumulado, atividade, i) =>
                    acumulado += atividade.valor * atividades[i].quantidade, 0);
            else throw `A(s) atividade(s): ${promessaAtividades.reduce((acumulado, atividade, i) => {
                if (atividade === null) return acumulado += (atividades[i]._id + " ")
            }, "")}não estão no sistema.`;
        });
}

ApontamentoSchema.methods.verAtividades = function verAtividades() {
    const atividades = this.atividades.map(atividade => Atividade.findById(atividade._id));
    return Promise.all(atividades).then(atividades => {
        return this.atividades.map((atividade, i) => {
            return {
                _id: atividade._id,
                quantidade: atividade.quantidade,
                nome: atividades[i].nome,
                tipo: atividades[i].tipo,
                valor: atividades[i].valor
            }
        })
    })

}

module.exports = moongose.model('Apontamento', ApontamentoSchema);