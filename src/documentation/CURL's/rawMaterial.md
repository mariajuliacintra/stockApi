# rawMaterialCURL's


## 1. POST: Criar uma nova matéria-prima

-  Campos obrigatórios: fkIdUser, name, aliases, brand, quantity, batchNumber, fkIdLocation

```
curl --location 'http://localhost:5000/stock/rawMaterial' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 1,
    "name": "Barra de Aço",
    "aliases": "Vergalhão, Aço Carbono",
    "brand": "ArcelorMittal",
    "description": "Barra de aço para Uso Estrutural",
    "technicalSpecs": "10mm x 6m",
    "quantity": 55,
    "batchNumber": "BA-202508-001",
    "fkIdLocation": 10
}'
```

## 2. GET: Obter todas as matérias-primas

```
curl --location 'http://localhost:5000/stock/rawMaterials' \
--header 'Authorization: {userToken}'
```

## 3. GET: Obter matéria-prima por ID

```
curl --location 'http://localhost:5000/stock/rawMaterial/1' \
--header 'Authorization: {userToken}'
```

## 4. PUT: Atualizar matéria-prima por ID

### Exemplo: alterando a quantidade da matéria-prima. fkIdUser é obrigatório para a transação.

```
curl --location --request PUT 'http://localhost:5000/stock/rawMaterial/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 2,
    "name": "Barra de Aço",
    "aliases": "Vergalhão, Aço Carbono",
    "brand": "ArcelorMittal",
    "description": "Barra de aço para uso estrutural.",
    "technicalSpecs": "10mm x 6m",
    "quantity": 65.00,
    "batchNumber": "BA-202508-001",
    "fkIdLocation": 10
}'
```

## 5. DELETE: Deletar matéria-prima por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/rawMaterial/1' \
--header 'Authorization: {userToken}'
```
