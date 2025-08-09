# userCURL's

## 1. POST: Registrar um novo usuário

- Campos obrigatórios: name, email, password, confirmPassword

```
curl --location 'http://localhost:5000/stock/user/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Vinicius Fogaça",
    "email": "vinicius.f.cintra@aluno.senai.br",
    "password": "Vinicius.3456",
    "confirmPassword": "Vinicius.3456"
}'
```

## 2. POST: Verificar o registro

### Este comando finaliza o registro do usuário com o código enviado por e-mail.

```
curl --location 'http://localhost:5000/stock/user/verify-register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "vinicius.f.cintra@aluno.senai.br",
    "code": "{mailCode}"
}'
```

## 3. POST: Fazer login do usuário

-  Campos obrigatórios: email, password

```
curl --location 'http://localhost:5000/stock/user/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "joao.silva@sp.senai.br",
    "password": "Joao.1234"
}'
```

## 4. GET: Obter todos os usuários

#### Requer um token de autenticação válido.

```
curl --location 'http://localhost:5000/stock/users' \
--header 'Authorization: {userToken}'
```

## 5. PUT: Atualizar usuário por ID

### Exemplo 1: alterando apenas o nome e a senha. A alteração de e-mail é um processo separado.

```
curl --location --request PUT 'http://localhost:5000/stock/user/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "name": "Vinicius Fogaça Cintra",
    "password": "Vinicius.9871",
    "confirmPassword": "Vinicius.9871"
}'
```

### Exemplo 2: alterando o e-mail. Isso iniciará o processo de verificação por e-mail.

```
curl --location --request PUT 'http://localhost:5000/stock/user/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "email": "novo.email@aluno.senai.br",
    "password": "Vinicius.9871",
    "confirmPassword": "Vinicius.9871"
}'
```

## 6. POST: Verificar a atualização de e-mail

### Este comando finaliza a atualização do e-mail com o código enviado para o novo endereço.

```
curl --location 'http://localhost:5000/stock/user/verify-update' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "novo.email@aluno.senai.br",
    "code": "{mailCode}"
}'
```

## 7. DELETE: Deletar usuário por ID

```
curl --location --request DELETE 'http://localhost:5000/stock/user/1' \
--header 'Authorization: {userToken}'
```
