CREATE DATABASE IF NOT EXISTS stock;
USE stock;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS lots;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS image;

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
    technicalSpecs TEXT,
    sapCode INT UNIQUE,
    fkIdCategory INT NOT NULL,
    fkIdImage INT DEFAULT NULL,
    FOREIGN KEY (fkIdCategory) REFERENCES category(idCategory),
    FOREIGN KEY (fkIdImage) REFERENCES image(idImage) ON DELETE SET NULL
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

INSERT INTO category (categoryValue) VALUES
('Ferramenta'),
('Material'),
('Matéria Prima'),
('Equipamento'),
('Produto'),
('Diversos');

INSERT INTO location (place, code) VALUES
('Prateleira', 'A1'), ('Prateleira', 'A2'), ('Prateleira', 'A3'),
('Armário', 'B1'), ('Armário', 'B2'), ('Armário', 'B3'),
('Gaveta', 'C1'), ('Gaveta', 'C2'), ('Gaveta', 'C3'),
('Depósito', 'D1'), ('Depósito', 'D2'), ('Depósito', 'D3');

INSERT INTO user (name, email, hashedPassword, role) VALUES
('João Silva', 'joao.silva@sp.senai.br', '$2a$12$pUpODOURw.nIEgqGiT4sNuPPoesLu.9rg4dTyikxPGOiyMQUDzVZu', 'manager'),
('Vinicius Fogaça', 'vfogacacintra@gmail.com', '$2a$12$Dgp7DDOLi91NJYR0abt.yuwSy7dDHDuS3wp/QRw02rs06HqDMr8WS', 'manager'),
('Maria Santos', 'maria.santos@sp.senai.br', '$2a$12$2uLf6ov665mPZRu6gBA7oufMhTC2mowcXEkSKw4H8Pbq27XPDn3Ca', 'user');

INSERT INTO item (idItem, name, aliases, brand, description, technicalSpecs, fkIdCategory, sapCode, fkIdImage) VALUES
(1, 'Martelo Unha', 'Martelo de Carpinteiro, Martelo Unha de Carpinteiro', 'Tramontina', 'Cabo de madeira', '500g', 1, 202501001, NULL),
(2, 'Fita Isolante', 'Fita Elétrica, Fita Isoladora', '3M', 'Antichamas, preta', '19mm x 20m', 2, 202610009, NULL),
(3, 'Tinta Demarcação', 'Tinta de Sinalização, Spray de Marcação', 'Coral', 'Amarela, spray', '400ml', 5, 202702014, NULL),
(4, 'Pilhas AA', 'Baterias AA, Pilhas Alcalinas', 'Duracell', 'Alcalinas', '1.5V', 6, 202801001, NULL),
(5, 'Óleo de Corte', 'Fluido de Corte, Óleo de Usinagem', 'Quimatic', 'Fluido de corte integral', '1L', 3, 202612005, NULL);

INSERT INTO lots (idLot, lotNumber, quantity, expirationDate, fkIdLocation, fkIdItem) VALUES
(1, 1, 15.0, NULL, 1, 1),
(2, 1, 25.0, '2026-10-01', 2, 2),
(3, 1, 50.0, '2027-02-15', 3, 3),
(4, 1, 40.0, '2028-01-01', 7, 4),
(5, 1, 7.0, '2026-12-31', 11, 5);

INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES
(1, 1, 'IN', 15, 0, 15),
(1, 2, 'IN', 25.0, 0.0, 25.0),
(1, 3, 'IN', 50.0, 0.0, 50.0),
(1, 4, 'IN', 40.0, 0.0, 40.0),
(1, 5, 'IN', 7.0, 0.0, 7.0);