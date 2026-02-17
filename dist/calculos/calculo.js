"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularEficienciaMaxima = calcularEficienciaMaxima;
const db_json_1 = __importDefault(require("./db.json"));
const db = db_json_1.default;
function calcularEficienciaMaxima(idItemFinal) {
    const receitaFinal = db[idItemFinal];
    if (!receitaFinal)
        return { [idItemFinal]: 1 };
    const necessidadesBrutas = {};
    function buscarIngredientes(idItem, qtdDesejada) {
        const receita = db[idItem];
        if (!receita || !receita.ingredientes || Object.keys(receita.ingredientes).length === 0) {
            necessidadesBrutas[idItem] = (necessidadesBrutas[idItem] || 0) + qtdDesejada;
            return;
        }
        const ciclosNecessarios = qtdDesejada / receita.output;
        for (const [idIngrediente, qtdNaReceita] of Object.entries(receita.ingredientes)) {
            buscarIngredientes(idIngrediente, ciclosNecessarios * qtdNaReceita);
        }
    }
    buscarIngredientes(idItemFinal, 1);
    const resultadoGargalos = {};
    for (const [itemBruto, qtdTotal] of Object.entries(necessidadesBrutas)) {
        const receita = db[itemBruto];
        const tempo = (receita && receita.tempo_base > 0) ? receita.tempo_base : 2;
        const output = (receita && receita.output > 0) ? receita.output : 1;
        resultadoGargalos[itemBruto] = qtdTotal * (tempo / receitaFinal.tempo_base);
    }
    let multiplicador = 1;
    let encontrouInteiro = false;
    while (!encontrouInteiro) {
        let todosSaoInteiros = true;
        for (const valorBase of Object.values(resultadoGargalos)) {
            const valorTeste = valorBase * multiplicador;
            if (Math.abs(valorTeste - Math.round(valorTeste)) > 0.0001) {
                todosSaoInteiros = false;
                break;
            }
        }
        if (todosSaoInteiros) {
            encontrouInteiro = true;
        }
        else {
            multiplicador++;
        }
    }
    const resultadoFinal = {};
    for (const [item, valorBase] of Object.entries(resultadoGargalos)) {
        resultadoFinal[item] = Math.round(valorBase * multiplicador);
    }
    resultadoFinal[idItemFinal] = multiplicador;
    return resultadoFinal;
}
