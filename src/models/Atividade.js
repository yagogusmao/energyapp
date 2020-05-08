const moongose = require('mongoose');
const Schema = moongose.Schema;

const AtividadeSchema = new Schema({
    _id: {type: String, required: true},
    nome: {type: String, required: true},
    tipo: {type: String, enum: ['I', 'R'], required: true},
    valor: {type: Number, required: true}
});

AtividadeSchema.methods.criar = function criar(_id, nome, tipo, valor){
    this._id = _id;
    this.nome = nome;
    this.tipo = tipo;
    this.valor = valor;
}

module.exports = moongose.model('Atividade', AtividadeSchema);