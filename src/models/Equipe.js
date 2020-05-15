const moongose = require('mongoose');
const Schema = moongose.Schema;

const Funcionario = require('./Funcionario');

const EquipeSchema = new Schema({
    _id: { type: String, required: true },
    tipo: { type: String, enum: ['MANUTENCAO/CONSTRUCAO', 'PODA', 'OP'], required: true },
    funcionarios: [{ _id: { type: String, required: true } }],
    veiculo: { type: String, required: true },
    local: { type: String, enum: ['CAMPINA GRANDE', 'JUAZEIRINHO', 'SUME', 'GUARABIRA', 'SOLANEA', 'ESPERANCA'], required: true },
    meta: { type: Number }
});

AtividadeSchema.methods.criar = function criar(_id, tipo, funcionarios, veiculo, local) {
    validarFuncionarios(funcionarios).then(() => {
        this._id = _id;
        this.funcionarios = funcionarios;
        this.tipo = tipo;
        this.veiculo = veiculo;
        this.local = local;
    }).catch(erro => { throw erro })
    
}

const validarFuncionarios = (funcionarios) => {
    let promessas = funcionarios.map(funcionario => Funcionario.findById(funcionario._id));
    return Promise.all(promessas).then(promessaFuncionarios => {
        if (!promessaFuncionarios.includes(null)) {
            return true;
        } else {
            let str = "";
            promessaFuncionarios.forEach((funcionario, i) => {
                if (funcionario === null) str += (funcionario[i]._id + " ");
            })
            throw `A(s) atividade(s): ${str}não estão no sistema.`;
        }
    });
}

module.exports = moongose.model('Equipe', EquipeSchema);