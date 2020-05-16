const moongose = require('mongoose');
const Schema = moongose.Schema;

const Funcionario = require('./Funcionario');
const Veiculo = require('./Veiculo');

const EquipeSchema = new Schema({
    _id: { type: String, required: true },
    tipo: { type: String, enum: ['MANUTENCAO/CONSTRUCAO', 'PODA', 'OP'], required: true },
    funcionarios: { type: Map, required: true },//[{ _id: { type: String, required: true } }],
    local: { type: String, enum: ['CAMPINA GRANDE', 'JUAZEIRINHO', 'SUME', 'GUARABIRA', 'SOLANEA', 'ESPERANCA'], required: true },
    status: { type: Boolean, required: true },
    veiculo: String,
    apontamentos: [String],
    meta: Number,
});

EquipeSchema.methods.criar = function criar(_id, tipo, funcionarios, local, veiculo) {
    if (funcionarios.length < 4) throw "Insira ao menos 4 funcionários";
    return Promise.all([validarVeiculo(veiculo), validarFuncionarios(funcionarios)]).then(([placa, funcionarios]) => {
        funcionarios.forEach(funcionario => this.funcionarios.set(funcionario._id, { nome: funcionario.nome, cpf: funcionario.cpf }))
        if (veiculo !== undefined) {
            this.veiculo = placa;
            this.status = true;
        } else this.status = false;
        this._id = _id;
        this.tipo = tipo;
        this.local = local;
    }).catch(erro => { throw erro });
}

const validarFuncionarios = (funcionarios) => {
    let promessas = funcionarios.map(funcionario => Funcionario.findById(funcionario));
    return Promise.all(promessas).then(promessaFuncionarios => {
        if (!promessaFuncionarios.includes(null)) {
            let str = "";
            promessaFuncionarios.forEach(funcionario => {
                if (funcionario.temEquipe()) str += (funcionario.nome + " ");
            })
            if (str === "") return;
            else throw `O(s) funcionário(s): ${str}já possuem equipe.`
        } else {
            let str = "";
            promessaFuncionarios.forEach((funcionario) => {
                if (funcionario === null) str += (funcionario._id + " ");
            })
            throw `A(s) atividade(s): ${str}não estão no sistema.`;
        }
    });
}

const validarVeiculo = (placa) => {
    if (placa === undefined) return;
    return Veiculo.findById(placa).then(veiculo => {
        if (veiculo) return placa;
        else throw new Error("Veículo não encontrado.");
    })
}

EquipeSchema.methods.temVeiculo = function temVeiculo() {
    if (this.veiculo !== null && this.veiculo !== undefined && this.veiculo !== "") {
        return Veiculo.findById(this.veiculo).then(veiculo => {
            if (veiculo) return true;
            else throw "O veículo desta equipe existe, mas não foi encontrado."
        })
    } else return false;
}

module.exports = moongose.model('Equipe', EquipeSchema);