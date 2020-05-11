const moongose = require('mongoose');
const Schema = moongose.Schema;

const ApontamentoSchema = new Schema({
    tipo: {type: String, enum: ['MANUTENCAO', 'CONSTRUCAO'], required: true},
    pessoa: {
        supervisor: {type: String, required: true},
        tecnicoEnergisa: Number,
        encarregado: {type: String, required: true},
    },
    veiculo: {
        placa: {type: String, required: true},
        kilometragem: {
            inicio: {type: Number, required: true},
            fim: Number,
            total: Number
        },
        si: String,
    },
    PgCp: String,
    equipe: {type: String, required: true},
    cidade: {type: String, required: true},
    endereco: {type: String, required: true},
    intervalo: Date,
    hora: {
        inicio: {type: Date, required: true},
        fim: Date
    },
    local: {
        saida: {type: String, required: true},
        chegada: String
    },
    atividades: [{
        _id: {type: String, ref: 'Atividade'},
        quantidade: Number,
        PgCp: String
    }]
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
}

ApontamentoSchema.methods.atualizar = () => {

}

ApontamentoSchema.methods.finalizar = () => {

}

module.exports = moongose.model('Apontamento', ApontamentoSchema);