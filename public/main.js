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
        const cat = item.unidade_producao;
        if(!acc[cat]) acc[cat] = [];

        acc[cat].push(item);
        return acc
    }, {});

    for(const [nomeCategoria, itens] of Object.entries(categorias)){
        const secaoEspecifica = document.createElement('section');
        const classe = nomeCategoria.toLowerCase().split(' ').pop();
        secaoEspecifica.className = `secao_especifica ${classe}`

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

function createIngredientsResult(listaMateriais){
    const listaIngredientesSection = document.createElement('section');
    listaIngredientesSection.classList.add('result_subSection');
    listaIngredientesSection.classList.add('result_ingredientes');
    const ingredientes = listaMateriais.slice(0, -1);
    const produto = listaMateriais.slice(-1);

    const listaIngredientesHtml = ingredientes.map(item => {
        return `
        <span class="nome"><img src="${item.icon}" alt="${item.nome}">${item.nome}:</span>
        <span class="qtd">${item.amount}</span>
        `
    }).join('');

    const produtoFinalHtml = produto.map(item => {
        return `
        <span class="nome"><img src="${item.icon}" alt="${item.nome}">${item.nome}:</span>
        <span class="qtd">${item.amount}</span>
        `
    }).join('');

    listaIngredientesSection.innerHTML = `
    <h2>Ingredientes necessários</h2>
    ${listaIngredientesHtml}
    <h2>Produção final</h2>
    ${produtoFinalHtml}
    `;

    return listaIngredientesSection;
}


function createGraphResult(graphData){
    const graphSection = document.createElement('section');
    graphSection.classList.add('result_subSection');
    graphSection.classList.add('result_graph');

    const nodesMap = new Map();
    const edges = [];

    graphData.forEach(graphConnection => {
        if(!nodesMap.has(graphConnection.from)){
            nodesMap.set(graphConnection.from, {
                id: graphConnection.from,
                label:  `${graphConnection.from} (${graphConnection.amount})`,
                font: {color: '#000000', strokeWidth: 2},
                shape: 'circularImage',
                image: graphConnection.icon
            })
        }
        if(!nodesMap.has(graphConnection.to)){
            nodesMap.set(graphConnection.to, {
                id: graphConnection.to,
                label: `${graphConnection.to} (${graphConnection.toAmount})`,
                font: {color: '#000000', strokeWidth: 2},
                shape: 'circularImage',
                image: graphConnection.toIcon
            })
        }
        edges.push({
            from: graphConnection.from,
            to: graphConnection.to,
            label: graphConnection.unidade_producao,
            arrows: 'to',
            font: {color: '#000000', strokeWidth: 2}
        });
    });

    const networkData = {
        nodes: Array.from(nodesMap.values()),
        edges: edges
    }
    const options = {
        nodes: {
            size: 30,
            font: {color: '#000000', size: 12, vadjust: 0}
        },
        layout: {
            hierarchical: {
                direction: 'LR',
                sortMethod: 'directed',
                levelSeparation: 250
            }
        },
        physics: true
    }

    return {section: graphSection, data: networkData, options: options};
}


function exibirResultados(resposta){
    console.log(resposta);

    const resultadosSection = document.getElementById('resultados');

    resultadosSection.innerHTML = ``;
    
    if(resposta.status !== "ok" || !resposta.dados){
        resultadosSection.innerHTML = "<p style='color:#FF0000'>Erro ao processar dados</p>";
        return;
    }

    const listaMateriais = resposta.dados.mats;
    const graphData = resposta.dados.graph;


    const listaIngredientesSection = createIngredientsResult(listaMateriais);
    resultadosSection.appendChild(listaIngredientesSection);


    const graphObj = createGraphResult(graphData);
    const referenceHeight = listaIngredientesSection.offsetHeight;
    graphObj.section.style.height = Math.max(referenceHeight, 400) + "px";
    resultadosSection.appendChild(graphObj.section);


    new vis.Network(graphObj.section, graphObj.data, graphObj.options);

    scrollSuave(resultadosSection);
}

document.addEventListener("DOMContentLoaded", carregarMateriais);