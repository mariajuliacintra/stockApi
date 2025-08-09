# equipmentCURL's

## 1. POST: Criar um novo equipamento

-  Campos obrigatórios: fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation

```
curl --location 'http://localhost:5000/stock/equipment' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 1,
    "name": "Furadeira de Bancada",
    "aliases": "Furadao, Broca de Bancada",
    "brand": "Bosch",
    "description": "Equipamento Para Furos Precisos em Superfícies",
    "technicalSpecs": "1000W, 127V, Mandril 16mm",
    "quantity": 1,
    "batchNumber": "FB-202508-001",
    "fkIdLocation": 4
}'
```

## 2. GET: Obter todos os equipamentos

```
curl --location 'http://localhost:5000/stock/equipments' \
--header 'Authorization: {userToken}'
```

## 3. GET: Obter equipamento por ID

```
curl --location 'http://localhost:5000/stock/equipment/1' \
--header 'Authorization: {userToken}'
```

## 4. PUT: Atualizar equipamento por ID

### Exemplo: alterando a quantidade do equipamento. fkIdUser é obrigatório para a transação.

```
curl --location --request PUT 'http://localhost:5000/stock/equipment/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 2,
    "name": "Furadeira de Bancada",
    "aliases": "Furadao, Broca de Bancada",
    "brand": "Bosch",
    "description": "Equipamento para Furos Precisos em Superfícies",
    "technicalSpecs": "1000W, 127V, Mandril 16mm",
    "quantity": 2,
    "batchNumber": "FB-202508-001",
    "fkIdLocation": 4
}'
```

## 5. DELETE: Deletar equipamento por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/equipment/1' \
--header 'Authorization: {userToken}'
```
