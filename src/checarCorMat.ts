import dadosReceita from "./db.json";
import { Receita } from './dbStruct';


const db: Record<string, Receita> = dadosReceita

export function checarCorMat(idItem: string){
    const material = db[idItem];

    if(!material) return null;

    return material.qualidade;
}