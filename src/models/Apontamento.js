const moongose = require('mongoose');
const Schema = moongose.Schema;
const Atividade = require('../models/Atividade');

const ApontamentoSchema = new Schema({
    tipo: { type: String, enum: ["MANUTENCAO", "CONSTRUCAO", "OPERACIONAL", "PERDAS", "LINHAVIVA"], required: true },
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
        },
        si: { type: String, required: true }
    },
    PgCp: String,
    equipe: { type: String, required: true },
    cidade: { type: String, required: true },
    endereco: { type: String, required: true },
    data: { type: Date, required: true },
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

ApontamentoSchema.methods.iniciar = function iniciar(tipo, pessoaSupervisor, pessoaEncarregado, veiculoPlaca, veiculoKmInicio, veiculoSi, equipe, cidade, endereco, localSaida) {
    this.tipo = tipo;
    this.pessoa.supervisor = pessoaSupervisor;
    this.pessoa.encarregado = pessoaEncarregado;
    this.veiculo.placa = veiculoPlaca;
    this.veiculo.kilometragem.inicio = veiculoKmInicio;
    this.veiculo.si = veiculoSi;
    this.equipe = equipe;
    this.cidade = cidade;
    this.endereco = endereco;
    this.hora.inicio = new Date();
    this.data = this.hora.inicio;
    this.local.saida = localSaida;
    this.local.chegada = `Cidade: ${this.cidade}, Endereço: ${this.endereco}`;
    this.status = "INICIADO";
}

ApontamentoSchema.methods.atualizar = () => {

}

ApontamentoSchema.methods.finalizar = function finalizar(tecnicoEnergisa, veiculoKmFim, PgCp, atividades) {
    return validarAtividades(atividades).then(lucro => {
        this.lucro = lucro;
        this.pessoa.tecnicoEnergisa = tecnicoEnergisa;
        this.veiculo.kilometragem.fim = veiculoKmFim;
        this.veiculo.kilometragem.total = this.veiculo.kilometragem.fim - this.veiculo.kilometragem.inicio;
        this.PgCp = PgCp;
        this.hora.fim = new Date();
        this.status = "FINALIZADO";
        this.atividades = atividades;
    }).catch(erro => { throw erro })

}

const validarAtividades = (atividades) => {
    let promessas = atividades.map(atividade => Atividade.findById(atividade._id));
    return Promise.all(promessas).then(promessaAtividades => {
        if (!promessaAtividades.includes(null)) {
            let total = 0;
            promessaAtividades.forEach((atividade, i) => { total += atividade.valor * atividades[i].quantidade })
            return total;
        } else {
            let str = "";
            promessaAtividades.forEach((atividade, i) => {
                if (atividade === null) str += (atividades[i]._id + " ");
            })
            throw `A(s) atividade(s): ${str}não estão no sistema.`;
        }
    });
}

module.exports = moongose.model('Apontamento', ApontamentoSchema);