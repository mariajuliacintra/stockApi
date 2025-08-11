# transactionCURL's

## 1. POST: Criar uma nova transação

-  Campos obrigatórios: fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity

```
curl --location 'http://localhost:5000/stock/transaction' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 1,
    "itemType": "tool",
    "itemId": 1,
    "actionDescription": "IN",
    "quantityChange": 5,
    "oldQuantity": 15,
    "newQuantity": 20
}'
```

## 2. GET: Obter todas as transações

```
curl --location 'http://localhost:5000/stock/transactions' \
--header 'Authorization: {userToken}'
```

## 3. GET: Obter transação por ID

```
curl --location 'http://localhost:5000/stock/transaction/1' \
--header 'Authorization: {userToken}'
```

## 4. PUT: Atualizar transação por ID

### Exemplo: alterando os dados de uma transação existente.

```
curl --location --request PUT 'http://localhost:5000/stock/transaction/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "fkIdUser": 1,
    "itemType": "tool",
    "itemId": 3,
    "actionDescription": "OUT",
    "quantityChange": -1,
    "oldQuantity": 5,
    "newQuantity": 4
}'
```

## 5. DELETE: Deletar transação por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/transaction/1' \
--header 'Authorization: {userToken}'
```
