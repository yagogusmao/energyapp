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

AlmoxarifadoSchema.methods.adicionar = async function adicionar(materiaisSelecionados, vemDe) {
    return Promise.all(materiaisSelecionados.map(material => Material.findById(material._id))).then(materiais => {
        materiais.forEach((material, i) => {
            if (material) {
                if (this.estoque.has(String(material._id))) {
                    const novaQuantidade = materiaisSelecionados[i].quantidade + this.estoque.get(String(material._id));
                    this.estoque.set(String(material._id), novaQuantidade);
                    this.entradas.push({ material: String(material._id), quantidade: materiaisSelecionados[i].quantidade, vemDe, data: new Date() })
                } else {
                    this.estoque.set(String(material._id), materiaisSelecionados[i].quantidade);
                    this.entradas.push({ material: String(material._id), quantidade: materiaisSelecionados[i].quantidade, vemDe, data: new Date() })
                }
            }
        })
    })
}

AlmoxarifadoSchema.methods.retirar = function retirar(materiaisSelecionadosRetirar, vaiPara, servico, equipe) {
    return Promise.all(materiaisSelecionadosRetirar.map(material => Material.findById(material._id))).then(materiais => {
        materiais.forEach((material, i) => {
            if (material) {
                if (this.estoque.has(String(material._id))) {
                    if ((this.estoque.get(String(material._id)) - materiaisSelecionadosRetirar[i].quantidade) < 0) throw `O material ${material._id} não possui estoque suficiente.`;
                    else {
                        const novaQuantidade = this.estoque.get(String(material._id)) - materiaisSelecionadosRetirar[i].quantidade;
                        if (novaQuantidade === 0) this.estoque.delete(String(material._id));
                        else this.estoque.set(String(material._id), novaQuantidade)
                        this.saidas.push({ material: String(material._id), quantidade: materiaisSelecionadosRetirar[i].quantidade, vaiPara, servico, data: new Date(), equipe })
                        return Promise.resolve();
                    };
                }
            }
        })
    })
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
                        servico: saida.servico,
                        equipe: saida.equipe
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