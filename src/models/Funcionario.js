const moongose = require('mongoose');
const Schema = moongose.Schema;

const Equipe = require('./Equipe');

const FuncionarioSchema = new Schema({
    _id: { type: String, required: true }, //matricula
    nome: { type: String, required: true },
    cpf: { type: String, required: true },
    telefone: { type: String, required: true },
    lotacao: {
        type: String, enum: ['CAMPINA GRANDE', 'SERRA BRANCA', 'SOLANEA', 'ESPERANCA', 'GUARABIRA',
            'ARARUNA', 'PICUI', 'SUME', 'JUAZEIRINHO'], required: true
    },
    data: {
        inicio: { type: String, required: true },
        fim: Date
    },
    cargo: {
        type: String, enum: ['ENG. DE SEGURANÇA', 'SUPERVISOR', 'PLANEJADOR', 'ELETROTECNICO',
            'TÉCNICO DE SEGURANÇA', 'FISCAL', 'ALMOXARIFE', 'AUX. ALMOXARIFE', 'AUX. ADMINISTRATIVO', 'PORTEIRO',
            'ELETRICISTA', 'ENC. LINHA VIVA', 'ELETRICISTA LINHA VIVA', 'ENC. LINHA MORTA', 'AUX. ELETRICISTA',
            'ENC. PODA', 'PODADOR', 'GERENTE', 'GESTOR DE AREA'], required: true
    },
    apontamentos: [String],
    base: { type: String, required: true, enum: ['MS', 'PB']},
    equipe: String
});

FuncionarioSchema.methods.criar = function criar(_id, nome, cpf, lotacao, cargo, telefone, dataInicio, base) {
    this._id = _id;
    this.nome = nome;
    this.cpf = cpf;
    this.telefone = telefone;
    this.lotacao = lotacao;
    this.data.inicio = dataInicio;
    this.cargo = cargo;
    this.equipe = "";
    this.base = base;
}

FuncionarioSchema.methods.temEquipe = function temEquipe(equipe) {
    if (this.equipe === equipe) return false;
    else if (this.equipe !== undefined && this.equipe !== "") return true;
    else return false;
}

FuncionarioSchema.methods.adicionarApontamento = function adicionarApontamento(_id) {
    this.apontamentos.push(_id);
}

module.exports = moongose.model('Funcionario', FuncionarioSchema);