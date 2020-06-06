const moongose = require('mongoose');
const Schema = moongose.Schema;

const CodigoMateriais = new Schema({
    _id: { type: Number, required: true },
    descricaoClasse: { type: String, required: true }
});

module.exports = moongose.model('codigosMateriais', CodigoMateriais, 'codigosMateriais');