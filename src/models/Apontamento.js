const moongose = require('mongoose');
const Schema = moongose.Schema;

const ApontamentoSchema = new Schema({
    tipo: {type: String, enum: ['MANUTENCAO', 'CONSTRUCAO'], required: true},
    pessoa: {
        supervisor: {type: String, required: true},
        tecnicoEnergisa: {type: String, required: true},
        encarregado: {type: String, required: true},
    },
    veiculo: {
        placa: {type: String, required: true},
        kilometragem: {
            inicio: {type: Number, required: true},
            fim: {type: Number, required: true},
            total: {type: Number, required: true}
        },
        si: {type: String, required: true},
    },
    data: {type: Date, required: true},
    PgCp: {type: String, required: true},
    equipe: {type: String, required: true},
    cidade: {type: String, required: true},
    endereco: {type: String, required: true},
    hora: {
        inicio: {type: Date, required: true},
        fim: {type: Date, required: true}
    },
    local: {
        saida: {type: String, required: true},
        chegada: {type: String, required: true}
    },
    intervalo: {type: Date, required: true},
    atividades: [{
        _id: {type: String, ref: 'Atividade', required: true},
        quantidade: {type: Number, required: true},
        PgCp: {type: String, required: true}
    }]
});

ApontamentoSchema.methods.criar = (tipo, pessoa, veiculo, PgCp, equipe, cidade, endereco, hora, local, atividades) => {
    this.tipo = tipo;
    this.pessoa = pessoa;
    this.veiculo = veiculo;
    this.PgCp = PgCp;
    this.equipe = equipe;
    this.cidade = cidade;
    this.endereco = endereco;
    this.hora = hora;
    this.local = local;
    this.atividades = atividades;
}

module.exports = moongose.model('Apontamento', ApontamentoSchema);