# itemCURL's

## 1. POST: Criar um novo item ou adicionar quantidade a um lote existente

- name: Nome do item

- brand: Marca do item

- quantity: Quantidade a ser adicionada (para um novo item, é a quantidade inicial)

- expirationDate: (Opcional) Data de validade para lotes. Se fornecida, a lógica de lote se aplica.

- batchCode: Código base do lote (Código SIPAT)

- category: Categoria do item

- fkIdLocation: ID da localização

- fkIdUser: ID do usuário que realiza a operação

- Outros campos: aliases, description, technicalSpecs, lastMaintenance (opcionais)

```
curl --location 'http://localhost:5000/stock/item' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
  "name": "Parafuso M8",
  "brand": "Sider",
  "quantity": 150,
  "expirationDate": "2025-12-31",
  "batchCode": "PAR-202501",
  "category": "material",
  "fkIdLocation": 1,
  "fkIdUser": 1
}'
```

## 2. PUT: Atualizar um item (movimentação ou ajuste de estoque)

- isAjust: (Booleano) true para ajuste, false para movimentação (entrada/saída), quantity:

- Se isAjust é true: A nova quantidade total do item.

- Se isAjust é false: O delta de quantidade (positivo para entrada, negativo para saída).

- Outros campos: name, aliases, brand, description, technicalSpecs, expirationDate, lastMaintenance, batchCode, lotNumber, category, fkIdLocation, fkIdUser

### Exemplo 1: Movimentação (Saída)

```
curl --location --request PUT 'http://localhost:5000/stock/item/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
  "quantity": -25,
  "isAjust": false,
  "name": "Parafuso M8",
  "aliases": "Parafuso, Porca",
  "brand": "Sider",
  "description": "Parafuso de Aço com Rosca M8",
  "technicalSpecs": "50mm",
  "expirationDate": "2025-12-31",
  "lastMaintenance": null,
  "batchCode": "PAR-202501",
  "lotNumber": 1,
  "category": "material",
  "fkIdLocation": 1,
  "fkIdUser": 1
}'
```

### Exemplo 2: Ajuste de Estoque

```
curl --location --request PUT 'http://localhost:5000/stock/item/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
  "quantity": 100,
  "isAjust": true,
  "name": "Parafuso M8",
  "aliases": "Parafuso, Porca",
  "brand": "Sider",
  "description": "Parafuso de Aço com Rosca M8",
  "technicalSpecs": "50mm",
  "expirationDate": "2025-12-31",
  "lastMaintenance": null,
  "batchCode": "PAR-202501",
  "lotNumber": 1,
  "category": "material",
  "fkIdLocation": 1,
  "fkIdUser": 1
}'
```

## 3. POST: Retirar itens (lógica FEFO)

- name: Nome do item

- brand: Marca do item

- quantityToWithdraw: A quantidade total a ser retirada, que será processada nos lotes mais antigos.

- fkIdUser: ID do usuário que realiza a operação

```
curl --location --request POST 'http://localhost:5000/stock/item/withdraw' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
  "name": "Parafuso M8",
  "brand": "Sider",
  "quantityToWithdraw": 50,
  "fkIdUser": 1
}'
```

## 4. GET: Obter todos os itens

```
curl --location 'http://localhost:5000/stock/item' \
--header 'Authorization: {userToken}'
```

## 5. GET: Obter itens por categoria

```
curl --location --globoff 'http://localhost:5000/stock/item/material' \
--header 'Authorization: {userToken}'
```

## 6. DELETE: Deletar item por ID

```
curl --location --globoff --request DELETE 'http://localhost:5000/stock/item/1' \
--header 'Authorization: {userToken}'
```