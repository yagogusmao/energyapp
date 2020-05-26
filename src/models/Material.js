const moongose = require('mongoose');
const Schema = moongose.Schema;

const MaterialSchema = new Schema({
    _id: { type: Number, required: true }, 
    unidadeMedida: { type: String, required: true },
    descricao: { type: String, required: true },
    codigoClasse: { type: Number, required: true },
    descricaoClasse: { type: String, required: true }
});

module.exports = moongose.model('materiais', MaterialSchema);