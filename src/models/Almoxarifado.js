const moongose = require('mongoose');
const Schema = moongose.Schema;

const Material = require('./Material');

const AlmoxarifadoSchema = new Schema({
    _id: { type: String, required: true },
    base: { type: String, required: true, enum: ['MS', 'PB']},
    estoque: { type: Map, of: Number, required: true }, //_id do material aponta pra a quantidade do material
    entradas: [{ material: String, quantidade: Number, vemDe: String, data: Date }],
    saidas: [{ material: String, quantidade: Number, vaiPara: String, servico: String, data: Date, equipe: String }],
    saidasTransformadores: [{
        material: String, quantidade: Number, vaiPara: String, servico: String, data: Date, equipe: String,
        numeroSerie: String, tombamento: String, impedancia: String, dataFabricacao: String
    }],
    saidasMedidores: [{
        material: String, quantidade: Number, vaiPara: String, servico: String, data: Date, equipe: String,
        numero: String, nSeloCaixa: String, nSeloBorn: String
    }]
});

AlmoxarifadoSchema.methods.criar = function criar(_id, base) {
    this._id = _id;
    this.base = base;
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

AlmoxarifadoSchema.methods.retirarTransformador = function retirarTransformador(material, vaiPara, servico, equipe,
    numeroSerie, tombamento, impedancia, dataFabricacao) {
    return Material.findById(material).then(material => {
        if (material) {
            if (this.estoque.has(String(material._id))) {
                if (material.codigoClasse === 74 || material.codigoClasse === 75 || material.codigoClasse === 76 || material.codigoClasse === 174) {
                    if ((this.estoque.get(String(material._id)) - 1) < 0) throw `O material ${material._id} não possui estoque suficiente.`;
                    else {
                        const novaQuantidade = this.estoque.get(String(material._id)) - 1;
                        if (novaQuantidade === 0) this.estoque.delete(String(material._id));
                        else this.estoque.set(String(material._id), novaQuantidade);
                        this.saidas.push({ material: String(material._id), quantidade: 1, vaiPara, servico, data: new Date(), equipe });
                        this.saidasTransformadores.push({
                            material: String(material._id), quantidade: 1, vaiPara, servico, data: new Date(), equipe,
                            numeroSerie, tombamento, impedancia, dataFabricacao
                        });
                        return Promise.resolve();
                    };
                } else throw "Informe um material das classes 74, 75, 76, 174 - TRANSFORMADOR."
            } else throw "Material não encontrado no estoque.";
        } else throw "Material não encontrado.";
    })
}

AlmoxarifadoSchema.methods.retirarMedidor = function retirarMedidor(material, vaiPara, servico, equipe,
    numero, nSeloCaixa, nSeloBorn) {
    return Material.findById(material).then(material => {
        if (material) {
            if (this.estoque.has(String(material._id))) {
                if (material.codigoClasse === 147) {
                    if ((this.estoque.get(String(material._id)) - 1) < 0) throw `O material ${material._id} não possui estoque suficiente.`;
                    else {
                        const novaQuantidade = this.estoque.get(String(material._id)) - 1;
                        if (novaQuantidade === 0) this.estoque.delete(String(material._id));
                        else this.estoque.set(String(material._id), novaQuantidade);
                        this.saidas.push({ material: String(material._id), quantidade: 1, vaiPara, servico, data: new Date(), equipe });
                        this.saidasMedidores.push({
                            material: String(material._id), quantidade: 1, vaiPara, servico, data: new Date(), equipe,
                            numero, nSeloCaixa, nSeloBorn
                        });
                        return Promise.resolve();
                    };
                } else throw "Informe um material da classe 147 - MEDIDOR."
            } else throw "Material não encontrado no estoque.";
        } else throw "Material não encontrado.";
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
                    unidadeMedida: materiais[i].unidadeMedida,
                    codigoClasse: materiais[i].codigoClasse
                }
        })
        )
}

AlmoxarifadoSchema.methods.verRelatorio = async function verRelatorio(opcao) {
    if (opcao === "saida") {
        const saidas = await Promise.all(this.saidas.map(saida => Material.findById(saida.material)))
            .then(materiais => this.saidas.map((saida, i) => {
                if (materiais[i]._id == saida.material) {
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
                }
            }))
        const saidasTransformadores = await Promise.all(this.saidasTransformadores.map(saida => Material.findById(saida.material)))
            .then(materiais => this.saidasTransformadores.map((saida, i) => {
                if (materiais[i]._id == saida.material) {
                    return {
                        _id: materiais[i]._id,
                        descricao: materiais[i].descricao,
                        quantidade: saida.quantidade,
                        unidadeMedida: materiais[i].unidadeMedida,
                        vaiPara: saida.vaiPara,
                        data: saida.data,
                        servico: saida.servico,
                        equipe: saida.equipe,
                        tombamento: saida.tombamento,
                        impedancia: saida.impedancia,
                        numeroSerie: saida.numeroSerie,
                        dataFabricacao: saida.dataFabricacao
                    }
                }
            }))
        const saidasMedidores = await Promise.all(this.saidasMedidores.map(saida => Material.findById(saida.material)))
            .then(materiais => this.saidasMedidores.map((saida, i) => {
                if (materiais[i]._id == saida.material) {
                    return {
                        _id: materiais[i]._id,
                        descricao: materiais[i].descricao,
                        quantidade: saida.quantidade,
                        unidadeMedida: materiais[i].unidadeMedida,
                        vaiPara: saida.vaiPara,
                        data: saida.data,
                        servico: saida.servico,
                        equipe: saida.equipe,
                        nSeloBorn: saida.nSeloBorn,
                        nSeloCaixa: saida.nSeloCaixa,
                        numero: saida.numero
                    }
                }
            }))
        return { saidas, saidasTransformadores, saidasMedidores };
    } else if (opcao === "entrada") {
        const entradas = await Promise.all(this.entradas.map(entrada => Material.findById(entrada.material)))
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
            }))
        return { entradas };
    } else throw "Defina uma opção válida.";
}

module.exports = moongose.model('Almoxarifado', AlmoxarifadoSchema);