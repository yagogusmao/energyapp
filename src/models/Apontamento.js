const moongose = require('mongoose');
const Schema = moongose.Schema;

const Atividade = require('./Atividade');
const Equipe = require('./Equipe');
const Veiculo = require('./Veiculo');

const ApontamentoSchema = new Schema({
    tipo: { type: String, enum: ["MANUTENCAO", "CONSTRUCAO", "DEOP", "PODA", "PERDAS", "LINHAVIVA"], required: true },
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
    PgCp: String,
    si: { type: String, required: true },
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

ApontamentoSchema.methods.iniciar = function iniciar(tipo, pessoaSupervisor, pessoaEncarregado, si, equipe, cidade, endereco, localSaida) {
    return validarEquipe(equipe, tipo).then(async equipe => {
        await Veiculo.findByIdAndUpdate(veiculo, { status: 'OCUPADO' }).then(veiculo => {
            this.tipo = tipo;
            this.pessoa.supervisor = pessoaSupervisor;
            this.pessoa.encarregado = pessoaEncarregado;
            this.veiculo.placa = veiculo;
            this.veiculo.kilometragem.inicio = veiculo.kilometragem;
            this.si = si;
            this.equipe = equipe._id;
            this.cidade = cidade;
            this.endereco = endereco;
            this.hora.inicio = new Date();
            this.data = this.hora.inicio;
            this.local.saida = localSaida;
            this.local.chegada = `Cidade: ${this.cidade}, Endereço: ${this.endereco}`;
            this.status = "INICIADO";
        });
    }).catch(erro => { throw erro });
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

const validarEquipe = (equipe, tipo) => {
    Equipe.findById(equipe).then(equipe => {
        if (equipe.status === "OK") {
            if (equipe.tipo === tipo) {

            } else throw `Esta equipe não faz serviços deste tipo. Tipo: ${equipe.tipo}`;
        } else throw `Equipe não disponível. Status: ${equipe.status}`;
    })
}

const validarAtividades = (atividades) => {
    return Promise.all(atividades.map(atividade => Atividade.findById(atividade._id)))
        .then(promessaAtividades => {
            if (!promessaAtividades.includes(null)) return promessaAtividades.reduce((acumulado, atividade) => acumulado += atividade.valor * atividade.quantidade, 0);
            else throw `A(s) atividade(s): ${promessaAtividades.reduce((acumulado, atividade, i) => { if (atividade === null) return acumulado += (atividades[i]._id + " ") }, "")}não estão no sistema.`;
        });
}

module.exports = moongose.model('Apontamento', ApontamentoSchema);