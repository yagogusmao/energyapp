const moongose = require('mongoose');
const Schema = moongose.Schema;

const bcrypt = require('bcryptjs');
require('dotenv').config();

const UsuarioSchema = new Schema({
    _id: { type: String, required: true },
    nome: { type: String, required: true },
    cpf: { type: String, required: true },
    funcao: { type: String, enum: ['PLANEJADOR', 'SUPERVISOR', 'GERENTE', 'ALMOXARIFE', 'GESTOR'], required: true },
    equipes: [{type: String, enum: ['MANUTENCAO', 'CONSTRUCAO', 'PODA', 'DEOP', 'DECP', 'LINHA VIVA']}],
    base: { type: String, enum: ['PB', 'MS'], required: true },
    senha: { type: String, required: true }
});

UsuarioSchema.methods.criar = function criar (_id, nome, cpf, funcao, base, senha, equipes) {
    this._id = _id;
    this.nome = nome;
    this.cpf = cpf;
    this.funcao = funcao;
    this.base = base;
    this.equipes = equipes;
    this.senha = criarSenha(senha);
}

const criarSenha = (senha) => bcrypt.hashSync(senha, Number(process.env.SALT_ROUNDS));

module.exports = moongose.model('Usuario', UsuarioSchema);