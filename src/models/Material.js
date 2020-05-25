const moongose = require('mongoose');
const Schema = moongose.Schema;

const MaterialSchema = new Schema({
    _id: { type: Number, required: true }, 
    unidadeMedida: { type: String, required: true },
    descricao: { type: String, required: true },
    codigoClasse: { type: Number, required: true },
    descricaoClasse: { type: String, required: true },
    quantidade: Number
});

MaterialSchema.methods.adicionar = function adicionar(quantidade) {
    if (this.quantidade === undefined) this.quantidade = quantidade;
    else this.quantidade += quantidade;
}

MaterialSchema.methods.retirar = function retirar(quantidade) {
    if (this.quantidade === undefined) throw "O material ainda não possui estoque."
    else if (this.quantidade - quantidade < 0) throw "A solicitação pede mais material do que há em estoque."
    else this.quantidade -= quantidade;
}

module.exports = moongose.model('materiais', MaterialSchema);