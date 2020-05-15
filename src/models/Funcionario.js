const moongose = require('mongoose');
const Schema = moongose.Schema;

const FuncionarioSchema = new Schema({
    _id: {type: String, required: true},
    nome: {type: String, required: true},
    cpf: {type: String, required: true},
    telefone: {type: String, required: true},
    lotacao: {type: String, enum: ['CAMPINA GRANDE', 'SERRA BRANCA', 'SOLANEA', 'ESPERANCA', 'GUARABIRA',
        'ARARUNA', 'PICUI', 'SUME', 'JUAZEIRINHO'], required: true},
    data: {
        inicio: {type: Date, required: true},
        fim: Date
    },
    cargo: {type: String, enum: ['ENG. DE SEGURANÇA', 'SUPERVISOR', 'PLANEJADOR', 'ELETROTECNICO', 
        'TÉCNICO DE SEGURANÇA', 'FISCAL', 'ALMOXARIFE', 'AUX. ALMOXARIFE', 'AUX. ADMINISTRATIVO', 'PORTEIRO',
        'ELETRICISTA', 'ENC. LINHA VIVA', 'ELETRICISTA LINHA VIVA', 'ENC. LINHA MORTA', 'AUX. ELETRICISTA',
        'ENC. PODA', 'PODADOR', 'GERENTE', 'GESTOR DE AREA'], required: true}
});

FuncionarioSchema.methods.criar = function criar(_id, nome, cpf, lotacao, cargo, telefone, dataInicio){
    this._id = _id;
    this.nome = nome;
    this.cpf = cpf;
    this.telefone = telefone;
    this.lotacao = lotacao;
    this.data.inicio = new Date(dataInicio);
    this.cargo = cargo;
}

module.exports = moongose.model('Funcionario', FuncionarioSchema);