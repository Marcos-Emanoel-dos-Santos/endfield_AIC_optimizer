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
