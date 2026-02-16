const divArray = document.querySelectorAll('.material_opcao');
divArray.forEach(div => {
    div.addEventListener('click', async function() {
        // parte visual
        const selecionadoAtualmente = document.querySelector('.material_opcao.selecionado');
        if(selecionadoAtualmente){
            selecionadoAtualmente.classList.remove('selecionado')
        };

        div.classList.add('selecionado');


        // parte lógica
        const valor = div.dataset.valor;
        
        try{
            const resposta = await fetch("/api/envioMats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({filtro: valor})
            })

            const dados = await resposta.json();
            console.log(dados);
        }
        catch(erro){
            console.error("Erro na aquisição: ", erro);
        }
        
    });
});

async function atribuirCorBordaItens(){
    for(const div of divArray){
    const material = div.dataset.valor;
        try{
            const resposta = await fetch("/api/envioCor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({mat: material})
                })

            const dados = await resposta.json();
            const corEsperada = dados.cor;
            
            const img = div.querySelector("img");
            switch(corEsperada){
                case "branco":
                    img.classList.add('borda_branca');
                    break;
                case "verde":
                    img.classList.add('borda_verde');
                    break;
                case "azul":
                    img.classList.add('borda_azul');
                    break;
                case "roxo":
                    img.classList.add('borda_roxa');
                default:
                    break;

            }
    }
        catch(erro){
            console.error("Erro na aquisição: ", erro);
        }
    }
}


document.addEventListener("DOMContentLoaded", atribuirCorBordaItens);