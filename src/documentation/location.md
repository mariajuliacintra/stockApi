# locationCURL's

## 1. POST: Criar uma nova localização

- Campos obrigatórios: place, locationCode

```
curl --location 'http://localhost:5000/stock/location' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "place": "Nova Prateleira",
    "locationCode": "Z1"
}'
```

## 2. GET: Obter todas as localizações

```
curl --location 'http://localhost:5000/stock/locations' \
--header 'Authorization: {userToken}'
```

## 3. GET: Obter localização por ID

```
curl --location 'http://localhost:5000/stock/location/1' \
--header 'Authorization: {userToken}'
```

## 4. PUT: Atualizar localização por ID

```
curl --location --request PUT 'http://localhost:5000/stock/location/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "place": "Prateleira Grande",
    "locationCode": "A1-1"
}'
```

## 5. DELETE: Deletar localização por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/location/1' \
--header 'Authorization: {userToken}'
```
