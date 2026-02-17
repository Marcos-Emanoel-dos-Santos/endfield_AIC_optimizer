"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const calculo_1 = require("./calculo");
const checarCorMat_1 = require("./checarCorMat");
const db_json_1 = __importDefault(require("./db.json"));
const db = db_json_1.default;
const app = (0, express_1.default)();
const PORT = 3000;
const publicPath = path_1.default.join(__dirname, "..", "public");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(publicPath));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(publicPath, "index.html"));
});
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
app.get("/api/envioMats", (req, res) => {
    try {
        const listaDeItens = Object.entries(db)
            .filter(([idItem, dadosReceita]) => dadosReceita.oculto !== true)
            .map(([idItem, dadosReceita]) => {
            return {
                idItem: idItem,
                nome: dadosReceita.nome,
                icon: dadosReceita.icon,
                qualidade: dadosReceita.qualidade,
                unidadeProducao: dadosReceita.unidade_producao
            };
        });
        res.status(200).json({
            status: "ok",
            quantidade: listaDeItens.length,
            dados: listaDeItens
        });
    }
    catch (erro) {
        console.error("Erro na aquisição: ", erro);
    }
});
app.post("/api/envioCor", (req, res) => {
    const { mat } = req.body;
    try {
        const corMat = (0, checarCorMat_1.checarCorMat)(mat);
        res.json({
            status: "ok",
            cor: corMat
        });
    }
    catch (error) {
        res.status(400).json({
            status: "erro",
            mensagem: error instanceof Error ? error.message : "Erro desconhecido."
        });
    }
});
app.post("/api/envioMats", (req, res) => {
    const { filtro } = req.body;
    try {
        const outputsNecessarios = (0, calculo_1.calcularEficienciaMaxima)(filtro);
        res.json({
            status: "ok",
            recebido: filtro,
            dados: outputsNecessarios
        });
    }
    catch (error) {
        res.status(400).json({
            status: "erro",
            mensagem: error instanceof Error ? error.message : "Erro desconhecido."
        });
    }
});
