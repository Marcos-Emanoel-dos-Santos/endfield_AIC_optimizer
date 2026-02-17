import dadosReceita from './db.json';
import { Receita } from './dbStruct';


const db: Record<string, Receita> = dadosReceita;

export function calcularEficienciaMaxima(idItemFinal: string) {
    const receitaFinal = db[idItemFinal];

    if (!receitaFinal) return { [idItemFinal]: 1 };

    const necessidadesBrutas: Record<string, number> = {};

    function buscarIngredientes(idItem: string, qtdDesejada: number) {
        const receita = db[idItem];
        const temEtiquetaDeBase = receita?.recurso_base === true;
        const ehItemPesquisado = idItem === idItemFinal;

        if (!receita || !receita.ingredientes || Object.keys(receita.ingredientes).length === 0 || (temEtiquetaDeBase && !ehItemPesquisado)) {
            necessidadesBrutas[idItem] = (necessidadesBrutas[idItem] || 0) + qtdDesejada;
            return;
        }

        const ciclosNecessarios = qtdDesejada / receita.output;

        for (const [idIngrediente, qtdNaReceita] of Object.entries(receita.ingredientes)) {
            buscarIngredientes(idIngrediente, ciclosNecessarios * qtdNaReceita);
        }
    }

    buscarIngredientes(idItemFinal, 1);

    const resultadoGargalos: Record<string, number> = {};

    for (const [itemBruto, qtdTotal] of Object.entries(necessidadesBrutas)) {
        const receita = db[itemBruto];
        
        const tempo = (receita && receita.tempo_base > 0) ? receita.tempo_base : 2;
        const output = (receita && receita.output > 0) ? receita.output : 1;

        resultadoGargalos[itemBruto] = qtdTotal * (tempo / receitaFinal.tempo_base);
    }

    let multiplicador: number = 1;
    let encontrouInteiro: boolean = false;

    while(!encontrouInteiro){
        let todosSaoInteiros: boolean = true;

        for(const valorBase of Object.values(resultadoGargalos)){
            const valorTeste = valorBase * multiplicador;
            if(Math.abs(valorTeste - Math.round(valorTeste)) > 0.0001){
                todosSaoInteiros = false;
                break;
            }
        }

        if(todosSaoInteiros){
            encontrouInteiro = true
        }
        else {
            multiplicador++;
        }
    }

    const resultadoFinal: Record<string, number> = {};
    
    for(const [item, valorBase] of Object.entries(resultadoGargalos)){
        resultadoFinal[item] = Math.round(valorBase * multiplicador);
    }
    resultadoFinal[idItemFinal] = multiplicador;

    return resultadoFinal;
}