# Usa a imagem base do Node.js Alpine
FROM node:alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/app

# Copia os arquivos de configuração do Node e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos da aplicação
COPY . .

# Expõe a porta que a aplicação irá rodar
EXPOSE 5000

# Adiciona o comando para iniciar a aplicação
CMD ["npm", "start"]