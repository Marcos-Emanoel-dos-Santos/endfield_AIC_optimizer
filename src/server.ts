import express from "express";
import path from "path";

import { calculateMaximumEfficiency } from './calculoEficiencia';
import { checarCorMat } from "./checarCorMat";
import dadosReceita from './db.json';

const db: Record<string, any> = dadosReceita;

const app = express();

const publicPath = path.join(__dirname, "..", "public");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});


const PORT = 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});


app.get("/api/envioMats", (req: express.Request, res: express.Response) => {
  try{
    const listaDeItens = Object.entries(db)
    .filter(([idItem, dadosReceita]) => dadosReceita.oculto !== true)
    .map(([idItem, dadosReceita]) => {
      return {
        idItem: idItem,
        nome: dadosReceita.nome,
        icon: dadosReceita.icon,
        qualidade: dadosReceita.qualidade,
        unidadeProducao: dadosReceita.unidade_producao
      }
    });

    res.status(200).json({
      status: "ok",
      quantidade: listaDeItens.length,
      dados: listaDeItens
    })

  } catch(erro){
    console.error("Erro na aquisição: ", erro);
  }
})

app.post("/api/envioCor", (req: express.Request, res: express.Response) => {
  const { mat } = req.body;

  try{
    const corMat = checarCorMat(mat);
    res.json({
      status: "ok",
      cor: corMat
    })
  }
  catch(error){
    res.status(400).json({
      status: "erro",
      mensagem: error instanceof Error ? error.message : "Erro desconhecido."
    })
  }
});


app.post("/api/envioMats", (req: express.Request, res: express.Response) => {
    const { filter }: { filter: string } = req.body;

    try{
        const rawData = calculateMaximumEfficiency(filter);
        res.json({
            status: "ok",
            recebido: filter,
            dados: rawData
    })
    } catch(error){
        res.status(400).json({
            status: "erro",
            mensagem: error instanceof Error ? error.message : "Erro desconhecido."
        });
    }
});
