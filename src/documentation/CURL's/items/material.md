# materialCURL's

## 1. POST: Criar um novo material

-  Campos obrigatórios: fkIdUser, name, aliases, quantity, batchNumber, fkIdLocation

```
curl --location 'http://localhost:5000/stock/material' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 1,
    "name": "Parafuso Sextavado",
    "aliases": "Parafuso Allen, Parafuso de Cabeça Hexagonal",
    "brand": "Ciser",
    "description": "Aço Carbono",
    "technicalSpecs": null,
    "quantity": 100.00,
    "expirationDate": "2026-08-01",
    "batchNumber": "PSX-202507-006",
    "fkIdLocation": 7
}'
```

## 2. GET: Obter todos os materiais

```
curl --location 'http://localhost:5000/stock/materials' \
--header 'Authorization: {userToken}'
```

## 3. GET: Obter material por ID

```
curl --location 'http://localhost:5000/stock/material/1' \
--header 'Authorization: {userToken}'
```

# 4. PUT: Atualizar material por ID

### Exemplo: alterando a quantidade do material. fkIdUser é obrigatório para a transação.

```
curl --location --request PUT 'http://localhost:5000/stock/material/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 2,
    "name": "Parafuso Sextavado",
    "aliases": "Parafuso Allen, Parafuso de Cabeça Hexagonal",
    "brand": "Ciser",
    "description": "Aço Carbono",
    "technicalSpecs": null,
    "quantity": 550.00,
    "expirationDate": null,
    "batchNumber": "PSX-202507-006",
    "fkIdLocation": 7
}'
```

## 5. DELETE: Deletar material por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/material/1' \
--header 'Authorization: {userToken}'
```