"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checarCorMat = checarCorMat;
const receitas_json_1 = __importDefault(require("./calculos/receitas.json"));
const db = receitas_json_1.default;
function checarCorMat(idItem) {
    const material = db[idItem];
    if (!material)
        return null;
    return material.qualidade;
}
