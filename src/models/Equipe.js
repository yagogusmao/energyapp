const moongose = require('mongoose');
const Schema = moongose.Schema;

const Veiculo = require('./Veiculo');
const Funcionario = require('./Funcionario');

const EquipeSchema = new Schema({
    _id: { type: String, required: true },
    tipo: { type: String, enum: ['MANUTENCAO', 'CONSTRUCAO', 'PODA', 'DEOP', 'DECP'], required: true },
    funcionarios: { type: Map, required: true }, //[{ _id: { type: String, required: true } }],
    local: {
        type: String, enum: ['CAMPINA GRANDE', 'JUAZEIRINHO', 'SUME', 'GUARABIRA', 'SOLANEA', 'ESPERANCA', 'MONTEIRO', 'BOQUEIRAO'],
        required: true
    },
    status: { type: String, enum: ['OK', 'SEM VEICULO', 'OCUPADA', 'SEM FUNCIONARIOS'], required: true },
    veiculo: String,
    apontamentos: [String],
    meta: Number,
});

EquipeSchema.methods.criar = async function criar(_id, tipo, funcionarios, local, veiculo) {
    try {
        if (funcionarios === undefined) {
            return await validarVeiculo(veiculo).then(async veiculo => {
                this.funcionarios = new Map();
                this._id = _id;
                this.tipo = tipo;
                this.local = local;
                if (veiculo !== undefined) {
                    this.validarEquipe();
                    this.veiculo = veiculo;
                    await Veiculo.findByIdAndUpdate(veiculo, { equipe: _id });
                } else {
                    this.veiculo = "";
                    this.status = 'SEM VEICULO';
                }
            }).catch(erro => { throw erro });
        } else return await Promise.all([validarVeiculo(veiculo), validarFuncionarios(funcionarios, _id)])
            .then(async promessasResolvidas => {
                const Funcionario = require('./Funcionario');
                const [veiculo, funcionarios] = promessasResolvidas;
                this.funcionarios = new Map();
                funcionarios.forEach(async funcionario => {
                    this.funcionarios.set(funcionario._id, {
                        nome: funcionario.nome, cpf: funcionario.cpf,
                        cargo: funcionario.cargo
                    })
                    await Funcionario.findByIdAndUpdate(funcionario._id, { equipe: _id });
                })
                this._id = _id;
                this.tipo = tipo;
                this.local = local;
                if (veiculo !== undefined) {
                    this.validarEquipe();
                    this.veiculo = veiculo;
                    await Veiculo.findByIdAndUpdate(veiculo, { equipe: _id });
                } else {
                    this.veiculo = "";
                    this.status = 'SEM VEICULO';
                }
            }).catch(erro => { throw erro });
    } catch (erro) { throw erro; }
}

EquipeSchema.methods.validarEquipe = async function validarEquipe() {
    if (this.funcionarios === null || this.funcionarios === undefined || this.funcionarios === {})
        this.status = 'SEM FUNCIONARIOS';
    else {
        if (Array.from(this.funcionarios).length >= 4) {
            if (this.veiculo !== "") this.status = 'OK';
            else this.status = 'SEM VEICULO';
        } else this.status = 'SEM FUNCIONARIOS';
    }
}

EquipeSchema.methods.retirarVeiculo = async function retirarVeiculo() {
    if (this.veiculo !== "") {
        await Veiculo.findByIdAndUpdate(this.veiculo, { equipe: "" }).then(() => {
            this.veiculo = "";
            this.status = "SEM VEICULO";
        })
    } else throw "Esta equipe não possui veículo.";
}

EquipeSchema.methods.adicionarVeiculo = async function adicionarVeiculo(veiculo) {
    if (this.veiculo === "") {
        await Veiculo.findById(veiculo).then(async veiculo => {
            if (veiculo) {
                if (veiculo.equipe === "") {
                    veiculo.equipe = this._id;
                    if (this.status === "SEM VEICULO" && Array.from(this.funcionarios) > 3) this.status = "OK";
                    else this.status = "SEM FUNCIONARIOS";
                    this.veiculo = veiculo._id;
                    await veiculo.save()
                } else throw "Veículo já está sendo usado por uma equipe.";
            } else throw "Veículo não encontrado.";
        })
    } else throw "Esta equipe já possui veículo.";
}

EquipeSchema.methods.retirarFuncionario = async function retirarFuncionario(funcionario) {
    if (this.funcionarios.has(funcionario)) {
        const Funcionario = require('./Funcionario');
        await Funcionario.findByIdAndUpdate(funcionario, { equipe: "" }).then(funcionario => {
            this.funcionarios.delete(funcionario._id)
            this.validarEquipe();
        });
    } else throw "Funcionário não pertence a esta equipe";
}

EquipeSchema.methods.adicionarFuncionario = async function adicionarFuncionario(funcionario) {
    return validarFuncionarios([funcionario], this._id).then(async funcionarioPromessa => {
        const [funcionario] = funcionarioPromessa;
        const Funcionario = require('./Funcionario');
        if (!this.funcionarios.has(funcionario._id)) {
            await Funcionario.findByIdAndUpdate(funcionario._id, { equipe: this._id }).then((funcionario) => {
                this.funcionarios.set(funcionario._id, {
                    nome: funcionario.nome, cpf: funcionario.cpf,
                    cargo: funcionario.cargo
                })
                this.validarEquipe();
            });
        } else throw "Funcionário já pertence a esta equipe.";
    }).catch(erro => { throw erro })
}

EquipeSchema.methods.temVeiculo = function temVeiculo() {
    if (this.veiculo !== null && this.veiculo !== undefined && this.veiculo !== "") {
        return Veiculo.findById(this.veiculo).then(veiculo => {
            if (veiculo) return true;
            else throw "O veículo desta equipe existe, mas não foi encontrado.";
        })
    } else return false;
}

EquipeSchema.methods.adicionarApontamento = async function adicionarApontamento(_id, veiculoKmFim) {
    adicionarApontamentoFuncionarios(_id, this);
    adicionarApontamentoVeiculo(_id, this, veiculoKmFim);
    this.apontamentos.push(_id);
}

const adicionarApontamentoVeiculo = async (_id, equipe, veiculoKmFim) => {
    let veiculo = await Veiculo.findById(equipe.veiculo);
    veiculo.adicionarApontamento(_id);
    veiculo.kilometragem = veiculoKmFim;
    await veiculo.save();
}

const adicionarApontamentoFuncionarios = async (_id, equipe) => {
    let funcionarios = await Promise.all(Array.from(equipe.funcionarios).map(([key, value]) =>
        Funcionario.findById(key)));
    funcionarios.forEach(async funcionario => {
        funcionario.adicionarApontamento(_id);
        await funcionario.save();
    })
}

const validarFuncionarios = async (funcionarios, _id) => {
    const Funcionario = require('./Funcionario');
    return await Promise.all(funcionarios.map(funcionario => Funcionario.findById(funcionario)))
        .then(promessaFuncionarios => {
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
        if (funcionario.temEquipe(equipe)) flag = false
    })
    return flag;
}

const validarVeiculo = async (placa) => {
    if (placa === undefined) return;
    return await Veiculo.findById(placa).then(veiculo => {
        if (veiculo) {
            if (veiculo.equipe === "" || veiculo.equipe === undefined) return placa;
            else throw "Veículo já está sendo usado por uma equipe.";
        } else throw "Veículo não encontrado.";
    })
}

EquipeSchema.methods.verFuncionarios = function verFuncionarios() {
    return Array.from(this.funcionarios).map(([chave, valor]) => {
        return {_id: chave, nome: valor.nome, cargo: valor.cargo, cpf: valor.cpf}
    })
}

module.exports = moongose.model('Equipe', EquipeSchema);