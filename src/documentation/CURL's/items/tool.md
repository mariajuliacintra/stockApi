# toolCURL's

## 1. POST: Criar uma nova ferramenta

-  Campos obrigatórios: fkIdUser, name, aliases, brand, technicalSpecs, quantity, batchNumber, fkIdLocation
```
curl --location 'http://localhost:5000/stock/tool' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data '{
    "fkIdUser": 1,
    "name": "Serra Circular",
    "aliases": "Serra Elétrica",
    "brand": "Makita",
    "description": "Motor de Alta Potência",
    "technicalSpecs": "1500W, 5800 RPM, 7 1/4 polegadas, 127V",
    "quantity": 2,
    "lastMaintenance": "2025-07-20",
    "batchNumber": "SC-202507-012",
    "fkIdLocation": 1
}'
```

## 2. GET: Obter todas as ferramentas
```
curl --location 'http://localhost:5000/stock/tools' \
--header 'Authorization: {userToken}'
```

## 3. GET: Obter ferramenta por ID
```
curl --location 'http://localhost:5000/stock/tool/1' \
--header 'Authorization: {userToken}'
```

## 4. PUT: Atualizar ferramenta por ID

### Exemplo: alterando a quantidade da ferramenta. fkIdUser é obrigatório para a transação.

```
curl --location --request PUT 'http://localhost:5000/stock/tool/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 1,
    "name": "Martelo de Bola",
    "aliases": "Martelo de Mecânico, Marreta de Bola",
    "brand": "Stanley",
    "description": "Ferramenta Para Moldar Metal e Rebites",
    "technicalSpecs": "Cabo de Fibra de Vidro, 900g, 32oz",
    "quantity": 15,
    "lastMaintenance": "2025-06-05",
    "batchNumber": "MB-202506-003",
    "fkIdLocation": 2
}'
```

## 5. DELETE: Deletar ferramenta por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/tool/1' \
--header 'Authorization: {userToken}'
```
