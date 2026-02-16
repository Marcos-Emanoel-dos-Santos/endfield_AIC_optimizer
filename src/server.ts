import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

const publicPath = path.join(__dirname, "..", "public");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});


import { checarCorMat } from "./checarCorMat";

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


import { calcularEficienciaMaxima } from './calculos/calculo';

app.post("/api/envioMats", (req: express.Request, res: express.Response) => {
    const { filtro }: { filtro: string } = req.body;

    try{
        const outputsNecessarios = calcularEficienciaMaxima(filtro);
        res.json({
            status: "ok",
            recebido: filtro,
            dados: outputsNecessarios
    })
    } catch(error){
        res.status(400).json({
            status: "erro",
            mensagem: error instanceof Error ? error.message : "Erro desconhecido."
        });
    }
});
