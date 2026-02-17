import dadosReceita from "./calculos/db.json";

type Receita = {
    tempo_base: number;
    qualidade: string;
    unidade_producao: string;
    output: number;
    ingredientes: Record<string, number>;
}

const db: Record<string, Receita> = dadosReceita

export function checarCorMat(idItem: string){
    const material = db[idItem];

    if(!material) return null;

    return material.qualidade;
}