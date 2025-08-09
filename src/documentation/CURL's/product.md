# productCURL's

## 1. POST: Criar um novo produto

-  Campos obrigatórios: fkIdUser, name, aliases, brand, quantity, expirationDate, batchNumber, fkIdLocation

```
curl --location 'http://localhost:5000/stock/product' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 1,
    "name": "Solvente Desengraxante",
    "aliases": "Limpa Peças, Removedor de Graxa",
    "brand": "Quimisa",
    "description": "Industrial",
    "technicalSpecs": "5L",
    "quantity": 25,
    "expirationDate": "2026-11-01",
    "batchNumber": "SDI-202611-026",
    "fkIdLocation": 10
}'
```

## 2. GET: Obter todos os produtos

```
curl --location 'http://localhost:5000/stock/products' \
--header 'Authorization: {userToken}'
```

## 3. GET: Obter produto por ID

```
curl --location 'http://localhost:5000/stock/product/1' \
--header 'Authorization: {userToken}'
```

## 4. PUT: Atualizar produto por ID

### Exemplo: alterando a quantidade do produto. fkIdUser é obrigatório para a transação.

```
curl --location --request PUT 'http://localhost:5000/stock/product/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 2,
    "name": "Solvente Desengraxante",
    "aliases": "Limpa Peças, Removedor de Graxa",
    "brand": "Quimisa",
    "description": "Industrial",
    "technicalSpecs": "5L",
    "quantity": 25,
    "expirationDate": "2026-11-01",
    "batchNumber": "SDI-202611-026",
    "fkIdLocation": 10
}'
```

## 5. DELETE: Deletar produto por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/product/1' \
--header 'Authorization: {userToken}'
```
