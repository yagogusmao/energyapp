const moongose = require('mongoose');
const Schema = moongose.Schema;
const Atividade = require('../models/Atividade');

const ApontamentoSchema = new Schema({
    tipo: {type: String, enum: ["MANUTENCAO", "CONSTRUCAO", "OPERACIONAL", "PERDAS", "LINHAVIVA"], required: true},
    pessoa: {
        supervisor: {type: String, required: true},
        tecnicoEnergisa: String,
        encarregado: {type: String, required: true},
    },
    veiculo: {
        placa: {type: String, required: true},
        kilometragem: {
            inicio: {type: Number, required: true},
            fim: Number,
            total: Number
        },
        si: {type: String, required: true}
    },
    PgCp: String,
    equipe: {type: String, required: true},
    cidade: {type: String, required: true},
    endereco: {type: String, required: true},
    hora: {
        inicio: {type: Date, required: true},
        fim: Date
    },
    atividades: [{
        _id: {type: String, ref: 'Atividade'},
        quantidade: Number
    }],
    status: {type: String, enum: ["INICIADO", "FINALIZADO"], required: true}
});

ApontamentoSchema.methods.iniciar = (tipo, pessoaSupervisor, pessoaEncarregado, veiculoPlaca, veiculoKmInicio, equipe, cidade, endereco, horaInicio, localSaida) => {
    this.tipo = tipo;
    this.pessoa.supervisor = pessoaSupervisor;
    this.pessoa.encarregado = pessoaEncarregado;
    this.veiculo.placa = veiculoPlaca;
    this.veiculo.kilometragem.inicio = veiculoKmInicio;
    this.equipe = equipe;
    this.cidade = cidade;
    this.endereco = endereco;
    this.hora.inicio = horaInicio;
    this.local.saida = localSaida;
    this.status = "INICIADO";
}

ApontamentoSchema.methods.atualizar = () => {

}

ApontamentoSchema.methods.finalizar = (tecnicoEnergisa, veiculoKmFim, PgCp, horaFim, atividades) => {
    this.pessoa.tecnicoEnergisa = tecnicoEnergisa;
    this.veiculo.kilometragem.fim = veiculoKmFim;
    this.veiculo.kilometragem.total = this.veiculo.kilometragem.fim - this.veiculo.kilometragem.inicio; 
    this.PgCp = PgCp;
    this.hora.fim = horaFim;
    this.atividades = atividades;
    this.status = "FINALIZADO"
}

ApontamentoSchema.methods.pegarInformacoes = async () => {
    let total = 0;
    this.atividades.forEach(atividade => {
        await Atividade.findById(atividade._id).then(atividade => {
            total += atividade.valor;
        })
    })
}

module.exports = moongose.model('Apontamento', ApontamentoSchema);