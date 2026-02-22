function scrollSuave(target){
    target.scrollIntoView({
        behavior: "smooth",
        block: "start"
    })
}


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


// BUSCAR DADOS QUANDO COMPONENTE FOR CLICADO
document.getElementById('secao_materiais').addEventListener('click', async function(e) {
    const div = e.target.closest('.material_opcao');
    
    if (!div) return;

    // PARTE VISUAL
    const selecionadoAtualmente = document.querySelector('.material_opcao.selecionado');
    if (selecionadoAtualmente) {
        selecionadoAtualmente.classList.remove('selecionado');
    }
    div.classList.add('selecionado');

    // PARTE LÓGICA
    const valor = div.dataset.valor;
    
    try {
        const resposta = await fetch("/api/envioMats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filter: valor })
        });

        const resultado = await resposta.json();

        exibirResultados(resultado);
        
    } catch (erro) {
        console.error("Erro na aquisição: ", erro);
    }
});


function exibirResultados(resposta){
    console.log(resposta);

    const resultadosSection = document.getElementById('resultados');

    resultadosSection.innerHTML = ``;
    
    if(resposta.status !== "ok" || !resposta.dados){
        resultadosSection.innerHTML = "<p style='color:#FF0000'>Erro ao processar dados</p>";
        return;
    }

    const listaMateriais = resposta.dados.mats;
    const dadosParaGrafo = resposta.dados.graph;

    const listaIngredientesSection = document.createElement('section');
    listaIngredientesSection.classList.add('resultado_subSection');
    listaIngredientesSection.classList.add('resultado_ingredientes');
    const ingredientes = listaMateriais.slice(0, -1);
    const produto = listaMateriais.slice(-1);

    const listaIngredientesHtml = ingredientes.map(item => {
        return `
        <span class="nome"><img src="${item.icone}" alt="${item.nome}">${item.nome}:</span>
        <span class="qtd">${item.quantidade}</span>
        `
    }).join('');

    const produtoFinalHtml = produto.map(item => {
        return `
        <span class="nome"><img src="${item.icone}" alt="${item.nome}">${item.nome}:</span>
        <span class="qtd">${item.quantidade}</span>
        `
    }).join('');

    listaIngredientesSection.innerHTML = `
    <h2>Ingredientes necessários</h2>
    ${listaIngredientesHtml}
    <h2>Produção final</h2>
    ${produtoFinalHtml}
    `;

    resultadosSection.appendChild(listaIngredientesSection);
    scrollSuave(resultadosSection);
}

document.addEventListener("DOMContentLoaded", carregarMateriais);