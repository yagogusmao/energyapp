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
        return await Promise.all([validarVeiculo(veiculo), validarFuncionarios(funcionarios, _id)]).then(async promessasResolvidas => {
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

const validarFuncionarios = async (funcionarios, _id) => {
    const Funcionario = require('./Funcionario');
    return await Promise.all(funcionarios.map(funcionario => Funcionario.findById(funcionario))).then(promessaFuncionarios => {
        if (!promessaFuncionarios.includes(null)) {
            if (validarFuncionariosEquipe(promessaFuncionarios, _id)) return promessaFuncionarios;
            else throw `O(s) funcionário(s): ${
                promessaFuncionarios.reduce((acumulado, funcionario) => {
                    if (funcionario.temEquipe(_id)) return acumulado += `${funcionario.nome}, `;
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

const validarFuncionariosEquipe = (funcionarios, equipe) => {
    let flag = true;
    funcionarios.forEach(funcionario => { 
        if (funcionario.temEquipe(equipe)) flag = false })
    return flag;
}

const validarVeiculo = async (placa) => {
    if (placa === undefined) return;
    return await Veiculo.findById(placa).then(veiculo => {
        if (veiculo) {
            if (veiculo.equipe !== "") return placa;
            else throw "Veículo já está sendo usado por uma equipe.";
        } else throw "Veículo não encontrado.";
    })
}

EquipeSchema.methods.atualizarVeiculo = async function atualizarVeiculo(veiculo){
    if(veiculo === undefined){
        await Veiculo.findByIdAndUpdate(this.veiculo, {equipe: ""}).then(veiculo => {
            this.veiculo = "";
            this.status = "SEM VEICULO";
        })
    } else {
        await Veiculo.findById(veiculo).then(async veiculo => {
            if (veiculo) {
                if (veiculo.equipe === "") {
                    veiculo.equipe = this._id;
                    if (this.status === "SEM VEICULO") this.status = "OK";
                    this.veiculo = veiculo._id;
                    await veiculo.save()
                } else throw "Veículo já está sendo usado por uma equipe.";
            } else throw "Veículo não encontrado.";
        })
    }
}

EquipeSchema.methods.retirarFuncionario = async function retirarFuncionario(funcionario){
    if (this.funcionarios.has(funcionario)){
        const Funcionario = require('./Funcionario');
        await Funcionario.findByIdAndUpdate(funcionario._id, { equipe: "" }).then(funcionario => {
            this.funcionarios.delete(funcionario);
        });
    } else throw "Funcionário não pertence a esta equipe";
}

EquipeSchema.methods.atualizarFuncionarios = async function atualizarFuncionarios(funcionarios){
    return validarFuncionarios(funcionarios).then(funcionarios => {
        this.funcionarios = new Map();
        funcionarios.forEach(async funcionario => {
            this.funcionarios.set(funcionario._id, { nome: funcionario.nome, cpf: funcionario.cpf, cargo: funcionario.cargo })
            await Funcionario.findByIdAndUpdate(funcionario._id, { equipe: _id });
        })
    })
}

EquipeSchema.methods.temVeiculo = function temVeiculo() {
    if (this.veiculo !== null && this.veiculo !== undefined && this.veiculo !== "") {
        return Veiculo.findById(this.veiculo).then(veiculo => {
            if (veiculo) return true;
            else throw "O veículo desta equipe existe, mas não foi encontrado.";
        })
    } else return false;
}

EquipeSchema.methods.adicionarApontamento = function adicionarApontamento(_id) {
    this.apontamentos.push(_id);
}

module.exports = moongose.model('Equipe', EquipeSchema);