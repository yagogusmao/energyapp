const moongose = require('mongoose');
const Schema = moongose.Schema;

const Equipe = require('./Equipe');

const VeiculoSchema = new Schema({
    _id: { type: String, required: true }, //placa
    numeracao: { type: String, required: true },
    kilometragem: { type: Number, required: true },
    modelo: { type: String, enum: ['HILUX', 'STRADA', 'CAMINHAO'], required: true },
    apontamentos: [String],
    equipe: String
});

VeiculoSchema.methods.criar = function criar(_id, numeracao, kilometragem, modelo, equipe) {
    this._id = _id;
    this.numeracao = numeracao;
    this.kilometragem = kilometragem;
    this.modelo = modelo;
    if (equipe !== undefined & equipe !== null) 
        validarEquipe(equipe).then(() => this.equipe = equipe).catch(erro => {throw erro});
}

const validarEquipe = (_id) => {
    return Equipe.findById(_id).then(equipe => {
        if (equipe) {
            equipe.temVeiculo().then((temVeiculo) => {
                if (!temVeiculo) return;
                else throw "Esta equipe já possui um veiculo.";
            }).catch(erro => {throw erro});
        } else throw "Veículo não encontrado."
    })
}

module.exports = moongose.model('Veiculo', VeiculoSchema);