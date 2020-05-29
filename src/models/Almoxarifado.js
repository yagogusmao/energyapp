const moongose = require('mongoose');
const Schema = moongose.Schema;

const Material = require('./Material');

const AlmoxarifadoSchema = new Schema({
    _id: {
        type: String, enum: ['CAMPINAGRANDE-EBO', 'CAMPINAGRANDE-EPB', 'JUAZEIRINHO-EPB',
            'SUME-EPB', 'ESPERANCA-EPB', 'SOLANEA-EPB', 'GUARABIRA-EPB'], required: true
    },
    estoque: { type: Map, of: Number, required: true } //_id do material aponta pra a quantidade do material
});

AlmoxarifadoSchema.methods.criar = function criar(_id) {
    this._id = _id;
    this.estoque = new Map();
}

AlmoxarifadoSchema.methods.adicionar = function adicionar(materialId, quantidade) {
    if (this.estoque.has(materialId)) this.estoque.get(materialId) += quantidade;
    else return Material.findById(materialId).then(material => {
        if (material) this.estoque.set(materialId, quantidade)
        else throw "Material não encontrado.";
    })
}

AlmoxarifadoSchema.methods.retirar = function retirar(materialId, quantidade) {
    if (this.estoque.has(materialId)) {
        if (this.estoque.get(materialId) - quantidade < 0) throw "O material ainda não possui estoque.";
        else this.estoque.get(materialId) -= quantidade;
    } else throw "O material não está no estoque.";
}

AlmoxarifadoSchema.methods.verEstoque = function verEstoque() {
    return Promise.all(Array.from(this.estoque).map(([chave, valor]) => Material.findById(chave)))
        .then(materiais => Array.from(this.estoque).map(([chave, valor], i) => {
            if (materiais[i]._id == chave)
                return {
                    _id: materiais[i]._id,
                    descricao: materiais[i].descricao,
                    quantidade: valor
                }
        })
        )
}

module.exports = moongose.model('Almoxarifado', AlmoxarifadoSchema);