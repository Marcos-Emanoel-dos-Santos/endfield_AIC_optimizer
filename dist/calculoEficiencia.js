"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMaximumEfficiency = calculateMaximumEfficiency;
const db_json_1 = __importDefault(require("./db.json"));
const db = db_json_1.default;
// TRANSFORMS "AMOUNT" IN "TIME/FACILITY'S EFFORT"
function calculateBaseOutcome(rawMaterialNeeded, receiptFinalOutcome) {
    const outputResult = {};
    for (const [rawMaterial, totalAmount] of Object.entries(rawMaterialNeeded)) {
        const receipt = db[rawMaterial];
        const time = (receipt && receipt.tempo_base > 0) ? receipt.tempo_base : 2;
        outputResult[rawMaterial] = totalAmount * (time / receiptFinalOutcome.tempo_base);
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
    const formatedResult = Object.entries(finalResult).map(([id, amount]) => {
        const material_info = db[id];
        return {
            id: id,
            quantidade: amount,
            nome: material_info?.nome,
            icone: material_info?.icon,
            qualidade: material_info?.qualidade
        };
    });
    return formatedResult;
}
// CALCULATES THE NUMBER OF OUTPUTS FOR MAXIMUM EFFICIENCY (ZERO RAW MATERIAL WASTE)
function calculateMaximumEfficiency(idFinalOutcome) {
    const receiptFinalOutcome = db[idFinalOutcome];
    const rawMaterialNeeded = {};
    // IF IT IS A RAW MATERIAL, RETURNS ITSELF
    if (!receiptFinalOutcome)
        return formatToFrontend({ [idFinalOutcome]: 1 }, 1, idFinalOutcome);
    const materialsCraftingTree = [];
    // FINDS NECESSARY RAW MATERIAL
    function findIngredients(idMaterial, desiredAmount) {
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
        for (const [idIngredient, amountInReceipt] of Object.entries(receipt.ingredientes)) {
            materialsCraftingTree.push({
                from: idIngredient,
                to: idMaterial,
                facility: receipt.unidade_producao,
                amount: amountInReceipt,
                icon: db[idIngredient].icon // TALVEZ PRECISE TROCAR PRA idMaterial
            });
            findIngredients(idIngredient, neededCycles * amountInReceipt);
        }
    }
    // STARTS RECURSION WITH 1 UNIT OF THE FINAL OUTCOME
    findIngredients(idFinalOutcome, 1);
    const outputResult = calculateBaseOutcome(rawMaterialNeeded, receiptFinalOutcome);
    const multiplier = findPerfectMultiplier(outputResult);
    const formatedResult = formatToFrontend(outputResult, multiplier, idFinalOutcome);
    console.log(materialsCraftingTree);
    return {
        mats: formatedResult,
        graph: materialsCraftingTree
    };
}
