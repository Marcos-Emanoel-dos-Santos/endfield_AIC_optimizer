export type Receita = {
    nome: string;
    tempo_base: number;
    qualidade: string;
    unidade_producao: string;
    output: number;
    icon: string;
    ingredientes: Record<string, number>;
    oculto?: boolean;
    recurso_base?: boolean;
    ingredientes_alternativos?: Record<string, number>
}
