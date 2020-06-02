const moongose = require('mongoose');
const Schema = moongose.Schema;

const Material = require('./Material');

const AlmoxarifadoSchema = new Schema({
    _id: {
        type: String, enum: ['CAMPINAGRANDE-EBO', 'CAMPINAGRANDE-EPB', 'JUAZEIRINHO-EPB',
            'SUME-EPB', 'ESPERANCA-EPB', 'SOLANEA-EPB', 'GUARABIRA-EPB'], required: true
    },
    estoque: { type: Map, of: Number, required: true }, //_id do material aponta pra a quantidade do material
    entradas: [{ material: String, quantidade: Number, vemDe: String, data: Date }],
    saidas: [{ material: String, quantidade: Number, vaiPara: String, servico: String, data: Date, equipe: String }]
});

AlmoxarifadoSchema.methods.criar = function criar(_id) {
    this._id = _id;
    this.estoque = new Map();
}

AlmoxarifadoSchema.methods.adicionar = function adicionar(materialId, quantidade, vemDe) {
    if (this.estoque.has(materialId)) {
        const novaQuantidade = quantidade + this.estoque.get(materialId);
        this.estoque.set(materialId, novaQuantidade);
        this.entradas.push({ material: materialId, quantidade, vemDe, data: new Date() })
        return Promise.resolve();
    } else return Material.findById(materialId).then(material => {
        if (material) {
            this.estoque.set(materialId, quantidade);
            this.entradas.push({ material: materialId, quantidade, vemDe, data: new Date() })
        } else throw "Material não encontrado.";
    })
}

AlmoxarifadoSchema.methods.retirar = function retirar(materialId, quantidade, vaiPara, servico, equipe) {
    if (this.estoque.has(materialId)) {
        if (this.estoque.get(materialId) - quantidade < 0) throw "O material ainda não possui estoque.";
        else {
            const novaQuantidade = this.estoque.get(materialId) - quantidade;
            this.estoque.set(materialId, novaQuantidade)
            this.saidas.push({ material: materialId, quantidade, vaiPara, servico, data: new Date(), equipe })
            return Promise.resolve();
        };
    } else throw "Material não encontrado no estoque.";
}

AlmoxarifadoSchema.methods.verEstoque = async function verEstoque() {
    return await Promise.all(Array.from(this.estoque).map(([chave, valor]) => Material.findById(chave)))
        .then(materiais => Array.from(this.estoque).map(([chave, valor], i) => {
            if (materiais[i]._id == chave)
                return {
                    _id: materiais[i]._id,
                    descricao: materiais[i].descricao,
                    quantidade: valor,
                    unidadeMedida: materiais[i].unidadeMedida
                }
        })
        )
}

AlmoxarifadoSchema.methods.verRelatorio = async function verRelatorio(opcao) {
    if (opcao === "saida") {
        return await Promise.all(this.saidas.map(saida => Material.findById(saida.material)))
            .then(materiais => this.saidas.map((saida, i) => {
                if (materiais[i]._id == saida.material)
                    return {
                        _id: materiais[i]._id,
                        descricao: materiais[i].descricao,
                        quantidade: saida.quantidade,
                        unidadeMedida: materiais[i].unidadeMedida,
                        vaiPara: saida.vaiPara,
                        data: saida.data,
                        servico: saida.servico
                    }
            })
            )
    } else if (opcao === "entrada") {
        return await Promise.all(this.entradas.map(entrada => Material.findById(entrada.material)))
            .then(materiais => this.entradas.map((entrada, i) => {
                if (materiais[i]._id == entrada.material)
                    return {
                        _id: materiais[i]._id,
                        descricao: materiais[i].descricao,
                        quantidade: entrada.quantidade,
                        unidadeMedida: materiais[i].unidadeMedida,
                        vemDe: entrada.vemDe,
                        data: entrada.data
                    }
            })
            )
    } else throw "Defina uma opção válida.";
}

module.exports = moongose.model('Almoxarifado', AlmoxarifadoSchema);