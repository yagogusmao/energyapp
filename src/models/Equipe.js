const moongose = require('mongoose');
const Schema = moongose.Schema;

const Veiculo = require('./Veiculo');

const EquipeSchema = new Schema({
    _id: { type: String, required: true },
    tipo: { type: String, enum: ['MANUTENCAO/CONSTRUCAO', 'PODA', 'OP'], required: true },
    funcionarios: { type: Map, required: true },//[{ _id: { type: String, required: true } }],
    local: { type: String, enum: ['CAMPINA GRANDE', 'JUAZEIRINHO', 'SUME', 'GUARABIRA', 'SOLANEA', 'ESPERANCA'], required: true },
    status: { type: String, enum: ['OK', 'SEM VEICULO', 'OCUPADO'], required: true },
    veiculo: String,
    apontamentos: [String],
    meta: Number,
});

EquipeSchema.methods.criar = async function criar(_id, tipo, funcionarios, local, veiculo) {
    if (funcionarios.length < 4) throw "Insira ao menos 4 funcionários";
    try {
        return await Promise.all([validarVeiculo(veiculo), validarFuncionarios(funcionarios)]).then(async promessasResolvidas => {
            const Funcionario = require('./Funcionario');
            const [veiculo, funcionarios] = promessasResolvidas;
            this.funcionarios = new Map();
            funcionarios.forEach(async funcionario => {
                this.funcionarios.set(funcionario._id, { nome: funcionario.nome, cpf: funcionario.cpf, cargo: funcionario.cargo })
                await Funcionario.findByIdAndUpdate(funcionario._id, { equipe: _id });
            })
            if (promessasResolvidas[0] !== undefined) {
                this.veiculo = veiculo;
                this.status = 'OK';
                await Veiculo.findByIdAndUpdate(veiculo, { equipe: _id });
            } else this.status = 'SEM VEICULO';
            this._id = _id;
            this.tipo = tipo;
            this.local = local;
        }).catch(erro => { throw erro });
    } catch (erro) { throw erro; }
}

const validarFuncionarios = async (funcionarios) => {
    const Funcionario = require('./Funcionario');
    return await Promise.all(funcionarios.map(funcionario => Funcionario.findById(funcionario))).then(promessaFuncionarios => {
        if (!promessaFuncionarios.includes(null)) {
            if (validarFuncionariosEquipe(promessaFuncionarios)) return promessaFuncionarios;
            else throw `O(s) funcionário(s): ${
                promessaFuncionarios.reduce((acumulado, funcionario) => {
                    if (funcionario.temEquipe()) return acumulado += `${funcionario.nome}, `;
                    else return acumulado;
                }, "")
            }já possuem equipe.`;
        } else throw `O(s) funcionário(s): ${
            promessaFuncionarios.reduce((acumulado, funcionario, i) => { 
                if (funcionario === null) return acumulado += `${funcionarios[i]}, `;
                else return acumulado;
            }, "")
        }não estão no sistema.`;
    });
}

const validarFuncionariosEquipe = (funcionarios) => {
    let flag = true;
    funcionarios.forEach(funcionario => { if (funcionario.temEquipe()) flag = false })
    return flag;
}

const validarVeiculo = async (placa) => {
    if (placa === undefined) return;
    return await Veiculo.findById(placa).then(veiculo => {
        if (veiculo) return placa;
        else throw "Veículo não encontrado.";
    })
}

EquipeSchema.methods.atualizarVeiculo = function atualizarVeiculo(veiculo){
    if(veiculo === undefined){
        Veiculo.findById(this.veiculo).then(veiculo => veiculo.retirarEquipe());
    }
}

EquipeSchema.methods.temVeiculo = function temVeiculo() {
    if (this.veiculo !== null && this.veiculo !== undefined && this.veiculo !== "") {
        return Veiculo.findById(this.veiculo).then(veiculo => {
            if (veiculo) return true;
            else throw "O veículo desta equipe existe, mas não foi encontrado."
        })
    } else return false;
}

EquipeSchema.methods.adicionarApontamento = function adicionarApontamento(_id) {
    this.apontamentos.push(_id);
}

module.exports = moongose.model('Equipe', EquipeSchema);