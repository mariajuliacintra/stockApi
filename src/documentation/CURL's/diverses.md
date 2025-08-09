# diversesCURL's

## 1. POST: Criar um novo item diverso

-  Campos obrigatórios: fkIdUser, name, aliases, quantity, batchNumber, fkIdLocation

```
curl --location 'http://localhost:5000/stock/diverses' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 1,
    "name": "Pilhas AA",
    "aliases": "Pilhas Alcalinas, Baterias AA",
    "brand": "Duracell",
    "description": "Pilhas alcalinas de 1.5V para Diversos Equipamentos",
    "technicalSpecs": "1.5V",
    "quantity": 100.00,
    "expirationDate": "2028-12-31",
    "batchNumber": "P-AA-202812-001",
    "fkIdLocation": 7
}'
```

## 2. GET: Obter todos os itens diversos

```
curl --location 'http://localhost:5000/stock/diverses-items' \
--header 'Authorization: {userToken}'
```

## 3. GET: Obter item diverso por ID

```
curl --location 'http://localhost:5000/stock/diverses/1' \
--header 'Authorization: {userToken}'
```

## 4. PUT: Atualizar item diverso por ID

### Exemplo: alterando a quantidade do item 1. fkIdUser é obrigatório para a transação.

```
curl --location --request PUT 'http://localhost:5000/stock/diverses/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 2,
    "name": "Pilhas AA",
    "aliases": "Pilhas Alcalinas, Baterias AA",
    "brand": "Duracell",
    "description": "Pilhas alcalinas de 1.5V para diversos equipamentos.",
    "technicalSpecs": "1.5V",
    "quantity": 50.00,
    "expirationDate": "2028-12-31",
    "batchNumber": "P-AA-202812-001",
    "fkIdLocation": 7
}'
```

## 5. DELETE: Deletar item diverso por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/diverses/1' \
--header 'Authorization: {userToken}'
```