const moongose = require('mongoose');
const Schema = moongose.Schema;

const Veiculo = require('./Veiculo');
const Funcionario = require('./Funcionario');
const moment = require('moment');
const currentWeek = require('current-week');

const EquipeSchema = new Schema({
    _id: { type: String, required: true },
    segmento: {type: String, enum: ['LINHA VIVA LEVE', 'LINHA VIVA PESADA', 'LINHA MORTA PESADA', 
        'LINHA MORTA LEVE', 'CONSTRUCAO', 'PODA URBANA', 'PODA RURAL', 'PERDA'], required: true},
    tipo: { type: String, enum: ['MANUTENCAO', 'CONSTRUCAO', 'PODA', 'DEOP', 'DECP', 'LINHA VIVA'], required: true },
    funcionarios: { type: Map, required: true },
    local: {
        type: String, enum: ['CAMPINA GRANDE', 'JUAZEIRINHO', 'SUME', 'GUARABIRA', 'SOLANEA', 'ESPERANCA', 
        'MONTEIRO', 'BOQUEIRAO', 'PONTAPORA'],
        required: true
    },
    base: { type: String, required: true, enum: ['MS', 'PB']},
    status: { type: String, enum: ['OK', 'SEM VEICULO', 'OCUPADA', 'SEM FUNCIONARIOS'], required: true },
    veiculo: String,
    apontamentos: [String],
    metaDiaria: Number,
    metaSemanal: Number,
    metaMensal: Number,
    metaAnual: Number,
});

EquipeSchema.methods.criar = async function criar(_id, tipo, funcionarios, local, veiculo, base, segmento) {
    try {
        if (funcionarios === undefined) {
            return await validarVeiculo(veiculo).then(async veiculo => {
                this.funcionarios = new Map();
                this._id = _id;
                this.tipo = tipo;
                this.local = local;
                this.base = base;
                this.segmento = segmento;
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
                this.base = base;
                this.tipo = tipo;
                this.local = local;
                this.segmento = segmento;
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
        if (Array.from(this.funcionarios).length >= 2) {
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
                    if (this.status === "SEM VEICULO" && Array.from(this.funcionarios).length > 3) this.status = "OK";
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

EquipeSchema.methods.verFaturamento = function verFaturamento () {
    const Apontamento = require('./Apontamento');
    return Promise.all(this.apontamentos.map(apontamento => Apontamento.findById(apontamento))).then(apontamentos => {
        const datas = data();
        const apontamentosHoje = apontamentos.filter(apontamento => (apontamento.hora.fim > datas.hoje && apontamento.hora.fim < datas.amanha));
        const lucroHoje = apontamentosHoje.reduce((acumulado, apontamento) => acumulado + apontamento.lucro, 0);
        const apontamentosSemana = apontamentos.filter(apontamento => (apontamento.hora.fim > datas.inicioSemana && apontamento.hora.fim < datas.finalSemana));
        const lucroSemana = apontamentosSemana.reduce((acumulado, apontamento) => acumulado + apontamento.lucro, 0);
        const apontamentosMes = apontamentos.filter(apontamento => (apontamento.hora.fim > datas.inicioMes && apontamento.hora.fim < datas.finalMes));
        const lucroMes = apontamentosMes.reduce((acumulado, apontamento) => acumulado + apontamento.lucro, 0);
        const apontamentosAno = apontamentos.filter(apontamento => (apontamento.hora.fim > datas.inicioAno && apontamento.hora.fim < datas.finalAno));
        const lucroAno = apontamentosAno.reduce((acumulado, apontamento) => acumulado + apontamento.lucro, 0);
        const lucro = apontamentos.reduce((acumulado, apontamento) => acumulado + apontamento.lucro, 0);
        return {
            apontamentosHoje, lucroHoje, 
            apontamentosSemana, lucroSemana, 
            apontamentosMes, lucroMes,
            apontamentosAno, lucroAno,
            apontamentos, lucro}
    })
}

const data = () => {
    const firstDayWeek = currentWeek.getFirstWeekDay();
    const dia = new Date().getDate() > 9 ? new Date().getDate().toString() : '0' + new Date().getDate().toString();
    const mes = new Date().getMonth() > 9 ? (new Date().getMonth() + 1).toString() : '0' + (new Date().getMonth() + 1).toString();
    const mesSemana = Number(firstDayWeek.split('.')[1]) + 1 > 9 ? `${Number(firstDayWeek.split('.')[1]) + 1}` : `0${Number(firstDayWeek.split('.')[1]) + 1}`;
    const diaSemana = Number(firstDayWeek.split('.')[0]) - 1 > 9 ? `${Number(firstDayWeek.split('.')[0]) - 1}` : `0${Number(firstDayWeek.split('.')[0]) - 1}`;
    const ano = new Date().getFullYear().toString();
    return {
        hoje: new Date(moment(`${ano}${mes}${dia}`).format()),
        amanha: new Date(moment(`${ano}${mes}${dia}`).add(1, 'day').format()),
        inicioSemana: new Date(moment(`${ano}${mesSemana}${diaSemana}`).format()),
        finalSemana: new Date(moment(`${ano}${mesSemana}${diaSemana}`).add(7, 'days').format()),
        inicioMes: new Date(moment(`${ano}${mes}01`).format()),
        finalMes: new Date(moment(new Date(Number(ano), Number(mes), 0)).add(24, 'hours').format()),
        inicioAno: new Date(moment(`${ano}0101`).format()),
        finalAno: new Date(moment(new Date(Number(ano), 12, 0)).add(24, 'hours').format()),
    }
}

EquipeSchema.methods.definirMeta = function definirMeta (metaDiaria, metaSemanal, metaMensal, metaAnual){
    this.metaDiaria = metaDiaria;
    this.metaSemanal = metaSemanal;
    this.metaMensal = metaMensal;
    this.metaAnual = metaAnual;
}

module.exports = moongose.model('Equipe', EquipeSchema);