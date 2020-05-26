const moongose = require('mongoose');
const Schema = moongose.Schema;

const Material = require('./Material');

const AlmoxarifadoSchema = new Schema({
    _id: { type: Number, required: true }, 
    base: { type: String, enum: ['CAMPINAGRANDE-EBO', 'CAMPINAGRANDE-EPB', 'JUAZEIRINHO-EPB', 'SUME-EPB', 'ESPERANCA-EPB', 'SOLANEA-EPB', 'GUARABIRA-EPB'], required: true },
    descricao: { type: String, required: true },
    codigoClasse: { type: Number, required: true },
    descricaoClasse: { type: String, required: true },
    estoque:[{ 
        material: {type:'ObjectId', ref: 'materiais'}, 
        quantidade: Number
    }]
});

AlmoxarifadoSchema.methods.adicionar = function adicionar(quantidade) {
    if (this.quantidade === undefined) this.quantidade = quantidade;
    else this.quantidade += quantidade;
}

AlmoxarifadoSchema.methods.retirar = function retirar(quantidade) {
    if (this.quantidade === undefined) throw "O material ainda não possui estoque."
    else if (this.quantidade - quantidade < 0) throw "A solicitação pede mais material do que há em estoque."
    else this.quantidade -= quantidade;
}

module.exports = moongose.model('Almoxarifado', AlmoxarifadoSchema);