"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMaximumEfficiency = calculateMaximumEfficiency;
const db_json_1 = __importDefault(require("./db.json"));
const db = db_json_1.default;
// TRANSFORMS "AMOUNT" IN "TIME/FACILITY'S EFFORT"
function calculateBaseOutcome(rawMaterialNeeded, receitaFinalOutcome) {
    const outputResult = {};
    for (const [rawMaterial, totalAmount] of Object.entries(rawMaterialNeeded)) {
        const receita = db[rawMaterial];
        const time = (receita && receita.tempo_base > 0) ? receita.tempo_base : 2;
        outputResult[rawMaterial] = totalAmount * (time / receitaFinalOutcome.tempo_base);
    }
    return outputResult;
}
function findPerfectMultiplier(outputResult) {
    let multiplier = 1;
    let foundInteger = false;
    while (!foundInteger) {
        let allAreIntegers = true;
        for (const baseValue of Object.values(outputResult)) {
            const tryValue = baseValue * multiplier;
            if (Math.abs(tryValue - Math.round(tryValue)) > 0.0001) {
                allAreIntegers = false;
                break;
            }
        }
        if (allAreIntegers) {
            foundInteger = true;
        }
        else {
            multiplier++;
        }
    }
    return multiplier;
}
function formatToFrontend(outputResult, multiplier, idFinalOutcome) {
    const finalResult = {};
    for (const [material, baseValue] of Object.entries(outputResult)) {
        finalResult[material] = Math.round(baseValue * multiplier);
    }
    finalResult[idFinalOutcome] = multiplier;
    const formattedResult = Object.entries(finalResult).map(([id, amount]) => {
        const material_info = db[id];
        return {
            id: id,
            amount: amount,
            nome: material_info?.nome,
            icon: material_info?.icon,
            qualidade: material_info?.qualidade
        };
    });
    return formattedResult;
}
// CALCULATES THE NUMBER OF OUTPUTS FOR MAXIMUM EFFICIENCY (ZERO RAW MATERIAL WASTE)
function calculateMaximumEfficiency(idFinalOutcome) {
    const receitaFinalOutcome = db[idFinalOutcome];
    const rawMaterialNeeded = {};
    // IF IT IS A RAW MATERIAL, RETURNS ITSELF
    if (!receitaFinalOutcome)
        return formatToFrontend({ [idFinalOutcome]: 1 }, 1, idFinalOutcome);
    const materialsCraftingTree = [];
    // FINDS NECESSARY RAW MATERIAL
    function findIngredients(idMaterial, desiredAmount) {
        const receita = db[idMaterial];
        // CYCLE BREAK VERIFICATION
        const isRawMaterial = receita?.recurso_base === true;
        const isDesiredMaterial = idMaterial === idFinalOutcome;
        // RECURSION STOPS WHETHER:
        // 1. DIDN'T FIND RECEIPT
        // 2. HAS NO INGREDIENTS (RAW MATERIAL)
        // 3. IS A RAW MATERIAL AND NOT WHAT USER SEARCHED FOR
        if (!receita || !receita.ingredientes || Object.keys(receita.ingredientes).length === 0 || (isRawMaterial && !isDesiredMaterial)) {
            // SUMS ACCUMULATED NEEDS IN rawMaterialNeeded DICTIONARY AND ENDS THIS BRANCH
            rawMaterialNeeded[idMaterial] = (rawMaterialNeeded[idMaterial] || 0) + desiredAmount;
            return;
        }
        // CALCULATES HOW MANY CYCLES THE FACILITY NEEDS TO RUN
        const neededCycles = desiredAmount / receita.output;
        // RECURSION WITH MULTIPLIED NECESSITY FOR THE CURRENT FACILITY
        for (const [idIngredient, amountInReceipt] of Object.entries(receita.ingredientes)) {
            const info_material = db[idIngredient];
            const info_parentMaterial = db[idMaterial];
            materialsCraftingTree.push({
                from: info_material.nome,
                to: info_parentMaterial.nome,
                unidade_producao: info_material.unidade_producao,
                amount: (neededCycles * amountInReceipt),
                toAmount: desiredAmount,
                icon: info_material.icon,
                toIcon: info_parentMaterial.icon
            });
            findIngredients(idIngredient, neededCycles * amountInReceipt);
        }
    }
    // STARTS RECURSION WITH 1 UNIT OF THE FINAL OUTCOME
    findIngredients(idFinalOutcome, 1);
    const outputResult = calculateBaseOutcome(rawMaterialNeeded, receitaFinalOutcome);
    const multiplier = findPerfectMultiplier(outputResult);
    materialsCraftingTree.forEach(connection => {
        connection.amount = Math.round(connection.amount * multiplier);
        connection.toAmount = Math.round(connection.toAmount * multiplier);
    });
    const formattedResult = formatToFrontend(outputResult, multiplier, idFinalOutcome);
    console.log(materialsCraftingTree);
    return {
        mats: formattedResult,
        graph: materialsCraftingTree
    };
}
