SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS stock

CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE stock;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS lots;
DROP TABLE IF EXISTS itemSpec;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS image;
DROP TABLE IF EXISTS technicalSpec;

CREATE TABLE technicalSpec (
    idTechnicalSpec INT PRIMARY KEY AUTO_INCREMENT,
    technicalSpecKey VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE category (
    idCategory INT PRIMARY KEY AUTO_INCREMENT,
    categoryValue VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE location (
    idLocation INT PRIMARY KEY AUTO_INCREMENT,
    place VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    UNIQUE(place, code)
);

CREATE TABLE user (
    idUser INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashedPassword VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('user', 'manager')),
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE image (
    idImage INT PRIMARY KEY AUTO_INCREMENT,
    imageData LONGBLOB NOT NULL,
    imageType VARCHAR(255) NOT NULL
);

CREATE TABLE item (
    idItem INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    sapCode INT UNIQUE,
    minimumStock INT DEFAULT NULL,
    fkIdCategory INT NOT NULL,
    fkIdImage INT DEFAULT NULL,
    FOREIGN KEY (fkIdCategory) REFERENCES category(idCategory),
    FOREIGN KEY (fkIdImage) REFERENCES image(idImage) ON DELETE SET NULL
);

CREATE TABLE itemSpec (
    idItemSpec INT PRIMARY KEY AUTO_INCREMENT,
    fkIdItem INT NOT NULL,
    fkIdTechnicalSpec INT NOT NULL,
    specValue VARCHAR(255) NOT NULL,
    FOREIGN KEY (fkIdItem) REFERENCES item(idItem) ON DELETE CASCADE,
    FOREIGN KEY (fkIdTechnicalSpec) REFERENCES technicalSpec(idTechnicalSpec),
    UNIQUE(fkIdItem, fkIdTechnicalSpec)
);

CREATE TABLE lots (
    idLot INT PRIMARY KEY AUTO_INCREMENT,
    lotNumber INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE DEFAULT NULL,
    fkIdLocation INT,
    fkIdItem INT NOT NULL,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation),
    FOREIGN KEY (fkIdItem) REFERENCES item(idItem) ON DELETE CASCADE,
    UNIQUE(fkIdItem, lotNumber)
);

CREATE TABLE transactions (
    idTransaction INT PRIMARY KEY AUTO_INCREMENT,
    fkIdUser INT NOT NULL,
    fkIdLot INT NOT NULL,
    actionDescription ENUM('IN', 'OUT', 'AJUST') NOT NULL,
    quantityChange DECIMAL(10, 2) NOT NULL,
    oldQuantity DECIMAL(10, 2),
    newQuantity DECIMAL(10, 2),
    transactionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fkIdUser) REFERENCES user(idUser),
    FOREIGN KEY (fkIdLot) REFERENCES lots(idLot) ON DELETE CASCADE
);

CREATE INDEX idxItemName ON item(name);
CREATE INDEX idxItemCategory ON item(fkIdCategory);
CREATE INDEX idxLotsFkIdLocation ON lots(fkIdLocation);
CREATE INDEX idxLotsExpirationDate ON lots(expirationDate);
CREATE INDEX idxUserRole ON user(role);
CREATE INDEX idxTransactionsFkIdUser ON transactions(fkIdUser);
CREATE INDEX idxTransactionsFkLot ON transactions(fkIdLot);
CREATE INDEX idxTransactionsDate ON transactions(transactionDate);
CREATE INDEX idxTransactionsAction ON transactions(actionDescription);
CREATE INDEX idxItemFkIdImage ON item(fkIdImage);
CREATE INDEX idxItemSpecFkIdItem ON itemSpec(fkIdItem);
CREATE INDEX idxItemSpecFkIdTechnicalSpec ON itemSpec(fkIdTechnicalSpec);

INSERT INTO technicalSpec (technicalSpecKey) VALUES
('Peso'), ('Voltagem'), ('Potencia'), ('Comprimento'), ('Largura'),
('Altura'), ('Cor'), ('Material'), ('Capacidade'), ('Temperatura De Operação'),
('Umidade De Operação'), ('Frequência'), ('Vida Útil'), ('Resistência'),
('Tensão Máxima'), ('Corrente Máxima'), ('Dimensões');

INSERT INTO category (categoryValue) VALUES
('Ferramenta'), ('Material'), ('Matéria Prima'),
('Equipamento'), ('Produto'), ('Diversos');

INSERT INTO location (place, code) VALUES
('Prateleira', 'A1'), ('Prateleira', 'A2'), ('Prateleira', 'A3'),
('Armário', 'B1'), ('Armário', 'B2'), ('Armário', 'B3'),
('Gaveta', 'C1'), ('Gaveta', 'C2'), ('Gaveta', 'C3'),
('Depósito', 'D1'), ('Depósito', 'D2'), ('Depósito', 'D3');

INSERT INTO user (name, email, hashedPassword, role) VALUES
('Vinicius Fogaça', 'vinicius.f.cintra@aluno.senai.br', '$2a$12$ppohx.brUJB2QYW5Xd/xTOefsNrDYspO7XgAhGSLpht4vsirIodV.', 'manager');