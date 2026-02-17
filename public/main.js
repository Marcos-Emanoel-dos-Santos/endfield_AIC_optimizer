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


async function carregarMateriais(){
    const resposta = await fetch("/api/envioMats");
    const json = await resposta.json();
    const dados = json.dados;
    const secaoGeralMateriais = document.getElementById('secao_materiais');

    const tradutorBorda = {
        "branco": "borda_branca",
        "verde": "borda_verde",
        "azul": "borda_azul",
        "roxo": "borda_roxa",
    };


    secaoGeralMateriais.innerHTML = ``;

    const categorias = dados.reduce((acc, item) => {
        const cat = item.unidadeProducao;
        if(!acc[cat]) acc[cat] = [];

        acc[cat].push(item);
        return acc
    }, {});

    for(const [nomeCategoria, itens] of Object.entries(categorias)){
        const secaoEspecifica = document.createElement('section');
        const classe = nomeCategoria.toLowerCase().split(' ').pop();
        secaoEspecifica.className = `secao_especifica ${classe};`

        secaoEspecifica.innerHTML = `
        <h2 class="titulo_secao_materiais">${nomeCategoria}</h2>
        <div class="material_lista">
            ${itens.map(item => `
                <div class="material_opcao" data-valor="${item.idItem}">
                    <img src="${item.icon}" alt="${item.nome}" class="${tradutorBorda[item.qualidade]}">
                    <p>${item.nome}</p>
                </div>
            `).join('')
            }
        </div>
        `;

        secaoGeralMateriais.appendChild(secaoEspecifica);
    }
}


document.addEventListener("DOMContentLoaded", carregarMateriais);