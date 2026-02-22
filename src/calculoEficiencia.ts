import dadosReceita from './db.json';
import { Receita } from './dbStruct';

const db: Record<string, Receita> = dadosReceita;
type conectionGraph = {
    from: string,
    to: string,
    facility: string,
    amount: number,
    icon: string,
    toIcon: string
}


// TRANSFORMS "AMOUNT" IN "TIME/FACILITY'S EFFORT"
function calculateBaseOutcome(rawMaterialNeeded: Record<string, number>, receiptFinalOutcome: Receita){
    const outputResult: Record<string, number> = {};

    for(const [rawMaterial, totalAmount] of Object.entries(rawMaterialNeeded)){
        const receipt = db[rawMaterial];

        const time = (receipt && receipt.tempo_base > 0) ? receipt.tempo_base : 2;

        outputResult[rawMaterial] = totalAmount * (time / receiptFinalOutcome.tempo_base);
    }

    return outputResult;
}



function findPerfectMultiplier(outputResult: Record<string, number>){
    let multiplier: number = 1;
    let foundInteger: boolean = false;

    while(!foundInteger){
        let allAreIntegers: boolean = true;

        for(const baseValue of Object.values(outputResult)){
            const tryValue = baseValue * multiplier;

            if(Math.abs(tryValue - Math.round(tryValue)) > 0.0001){
                allAreIntegers = false;
                break;
            }
        }
        if(allAreIntegers){
            foundInteger = true;
        } else {
            multiplier++;
        }
    }
    return multiplier;
}



function formatToFrontend(outputResult: Record<string, number>, multiplier: number, idFinalOutcome: string){
    const finalResult: Record<string, number> = {};
    for(const [material, baseValue] of Object.entries(outputResult)){
        finalResult[material] = Math.round(baseValue * multiplier);
    }
    finalResult[idFinalOutcome] = multiplier;

    const formatedResult = Object.entries(finalResult).map(([id, amount]) => {
        const material_info = db[id];
        return {
            id: id,
            quantidade: amount,
            nome: material_info?.nome,
            icone: material_info?.icon,
            qualidade: material_info?.qualidade
        };
    })

    return formatedResult;
}



// CALCULATES THE NUMBER OF OUTPUTS FOR MAXIMUM EFFICIENCY (ZERO RAW MATERIAL WASTE)
export function calculateMaximumEfficiency(idFinalOutcome: string) {
    const receiptFinalOutcome: Receita = db[idFinalOutcome];
    const rawMaterialNeeded: Record<string, number> = {};
    // IF IT IS A RAW MATERIAL, RETURNS ITSELF
    if (!receiptFinalOutcome) return formatToFrontend({ [idFinalOutcome]: 1 }, 1, idFinalOutcome);


    const materialsCraftingTree: conectionGraph[] = [];

    // FINDS NECESSARY RAW MATERIAL
    function findIngredients(idMaterial: string, desiredAmount: number){
        const receipt = db[idMaterial];

        // CYCLE BREAK VERIFICATION
        const isRawMaterial = receipt?.recurso_base === true;
        const isDesiredMaterial = idMaterial === idFinalOutcome;

        // RECURSION STOPS WHETHER:
        // 1. DIDN'T FIND RECEIPT
        // 2. HAS NO INGREDIENTS (RAW MATERIAL)
        // 3. IS A RAW MATERIAL AND NOT WHAT USER SEARCHED FOR
        if (!receipt || !receipt.ingredientes || Object.keys(receipt.ingredientes).length === 0 || (isRawMaterial && !isDesiredMaterial)) {
                // SUMS ACCUMULATED NEEDS IN rawMaterialNeeded DICTIONARY AND ENDS THIS BRANCH
                rawMaterialNeeded[idMaterial] = (rawMaterialNeeded[idMaterial] || 0) + desiredAmount;
                return;
            }
        
        // CALCULATES HOW MANY CYCLES THE FACILITY NEEDS TO RUN
        const neededCycles = desiredAmount / receipt.output;


        // RECURSION WITH MULTIPLIED NECESSITY FOR THE CURRENT FACILITY
        for(const [idIngredient, amountInReceipt] of Object.entries(receipt.ingredientes)){
            const info_material = db[idIngredient];
            const info_parentMaterial = db[idMaterial];
            materialsCraftingTree.push({
                from: info_material.nome,
                to: info_parentMaterial.nome,
                facility: receipt.unidade_producao,
                amount: amountInReceipt,
                icon: info_material.icon,
                toIcon: info_parentMaterial.icon
            });
            findIngredients(idIngredient, neededCycles * amountInReceipt);
        }
    }

    // STARTS RECURSION WITH 1 UNIT OF THE FINAL OUTCOME
    findIngredients(idFinalOutcome, 1);


    const outputResult = calculateBaseOutcome(rawMaterialNeeded, receiptFinalOutcome);


    const multiplier: number = findPerfectMultiplier(outputResult);


    const formatedResult = formatToFrontend(outputResult, multiplier, idFinalOutcome);
    
    console.log(materialsCraftingTree);
    return {
        mats: formatedResult,
        graph: materialsCraftingTree
    };
}