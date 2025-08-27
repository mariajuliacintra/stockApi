# Usa a imagem base do Node.js Alpine
FROM node:alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/app

# Copia os arquivos de configuração do Node e instala as dependências
COPY package*.json ./
RUN npm install

# Copia e adiciona permissão de execução ao script
# Adiciona a correção para quebras de linha do Windows
COPY wait-for-it.sh .
RUN chmod +x ./wait-for-it.sh && \
    sed -i 's/\r$//' ./wait-for-it.sh

# Instala o bash, que é necessário para o script `wait-for-it.sh`
RUN apk add --no-cache bash

# Copia o restante dos arquivos da aplicação
COPY . .

# Expõe a porta que a aplicação irá rodar
EXPOSE 5000

# Executa o script de espera e inicia a aplicação
CMD ["./wait-for-it.sh", "db:3307", "--", "npm", "start"]