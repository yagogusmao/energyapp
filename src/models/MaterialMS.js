const moongose = require('mongoose');
const Schema = moongose.Schema;

const MaterialMSSchema = new Schema({
    _id: { type: Number, required: true }, 
    unidadeMedida: { type: String, required: true },
    descricao: { type: String, required: true },
    codigoClasse: { type: Number, required: true },
    descricaoClasse: { type: String, required: true }
});

MaterialMSSchema.methods.criar = function criar (_id, unidadeMedida, descricao, codigoClasse, descricaoClasse) {
    this._id = _id;
    this.unidadeMedida = unidadeMedida;
    this.descricao = descricao;
    this.codigoClasse = codigoClasse;
    this.descricaoClasse = descricaoClasse;
}

module.exports = moongose.model('materiaisMS', MaterialMSSchema);