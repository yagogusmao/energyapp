const jwt = require('jsonwebtoken');
require('dotenv').config();
const config = require('../config/config');

module.exports = (req, res, next) => {

    const cabecalhoAutenticacao = req.headers.authorization;

    if(!cabecalhoAutenticacao) return res.status(401).json({sucesso: false, mensagem: "Token não definido."});

    const partes = cabecalhoAutenticacao.split(' ');

    if(!partes.length === 2) return res.status(401).json({sucesso: false, message: "Token inválido."});

    const [ schema, token ] = partes;

    jwt.verify(token, config.secret, (erro, descriptografado) => {
        if(erro) return res.status(401).json({sucesso: false, message: erro});

        req._id = descriptografado._id;
        req.cpf = descriptografado.cpf;
        req.nome = descriptografado.nome;
        req.base = descriptografado.base;
        req.funcao = descriptografado.funcao;
        
        return next();
    })
}