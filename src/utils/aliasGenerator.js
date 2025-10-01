const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI(process.env.GEMINIAPIKEY);

async function aliasGenerator(itemName) {
    if (!itemName) return [];

    const prompt = `
    Você é um gerador de nomes alternativos e aliases para produtos de hardware e ferramentas.
    Sua tarefa é analisar o nome do produto principal e sugerir APENAS aliases comuns e variações
    que as pessoas usariam ao se referir ao mesmo produto.

    Instruções:
    1. O nome alternativo deve ser um sinônimo ou uma descrição comum do produto.
    2. Gere 3 a 5 aliases relevantes.
    3. Retorne APENAS os aliases em uma lista separada por vírgulas.
       Não inclua nenhuma outra explicação, introdução ou formatação (como aspas, traços, etc.).

    Exemplos de entrada e saída (para fins de contexto):
    - "Martelo Unha" -> "Martelo de Unha", "Martelo para retirar pregos"
    - "Furadeira Impacto" -> "Martelete", "Furadeira com impacto"
    - "Óleo Lubrificante" -> "Óleo de Máquina", "Óleo para lubrificação"

    Agora, gere os aliases para o seguinte nome de produto: "${itemName}"
    `;

    const config = {
        temperature: 0.2,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: config,
        });

        const aliasesRaw = response.text.trim();

        if (!aliasesRaw) {
            return [];
        }

        const aliases = aliasesRaw.split(',')
            .map(alias => alias.trim())
            .filter(alias => alias.length > 0 && alias !== itemName);

        return aliases;

    } catch (error) {
        console.error("Erro ao gerar aliases com o Gemini:", error);
        return [];
    }
}

module.exports = { aliasGenerator };