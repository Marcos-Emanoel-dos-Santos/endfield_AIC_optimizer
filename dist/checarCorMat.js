"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checarCorMat = checarCorMat;
const db_json_1 = __importDefault(require("./db.json"));
const db = db_json_1.default;
function checarCorMat(idItem) {
    const material = db[idItem];
    if (!material)
        return null;
    return material.qualidade;
}
