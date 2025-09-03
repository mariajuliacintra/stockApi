CREATE DATABASE IF NOT EXISTS stock;
USE stock;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS location;

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
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE item (
    idItem INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE DEFAULT NULL,
    lastMaintenance DATE DEFAULT NULL,
    batchCode VARCHAR(255) NOT NULL,
    lotNumber INT NOT NULL,
    UNIQUE(batchCode, lotNumber),
    category ENUM('tool', 'material', 'rawMaterial', 'equipment', 'product', 'diverses') NOT NULL,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE transactions (
    idTransaction INT PRIMARY KEY AUTO_INCREMENT,
    fkIdUser INT NOT NULL,
    fkIdItem INT NOT NULL,
    actionDescription ENUM('IN', 'OUT', 'AJUST') NOT NULL,
    quantityChange DECIMAL(10, 2) NOT NULL,
    oldQuantity DECIMAL(10, 2),
    newQuantity DECIMAL(10, 2),
    transactionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fkIdUser) REFERENCES user(idUser),
    FOREIGN KEY (fkIdItem) REFERENCES item(idItem) ON DELETE CASCADE
);

CREATE INDEX idxItemName ON item(name);
CREATE INDEX idxItemCategory ON item(category);
CREATE INDEX idxItemFkIdLocation ON item(fkIdLocation);
CREATE INDEX idxItemExpirationDate ON item(expirationDate);
CREATE INDEX idxUserRole ON user(role);
CREATE INDEX idxTransactionsFkIdUser ON transactions(fkIdUser);
CREATE INDEX idxTransactionsFkIdItem ON transactions(fkIdItem);
CREATE INDEX idxTransactionsDate ON transactions(transactionDate);
CREATE INDEX idxTransactionsAction ON transactions(actionDescription);

INSERT INTO location (place, code) VALUES
('Prateleira', 'A1'), ('Prateleira', 'A2'), ('Prateleira', 'A3'),
('Armário', 'B1'), ('Armário', 'B2'), ('Armário', 'B3'),
('Gaveta', 'C1'), ('Gaveta', 'C2'), ('Gaveta', 'C3'),
('Depósito', 'D1'), ('Depósito', 'D2'), ('Depósito', 'D3');

INSERT INTO user (name, email, hashedPassword, role) VALUES
('João Silva', 'joao.silva@sp.senai.br', '$2a$12$pUpODOURw.nIEgqGiT4sNuPPoesLu.9rg4dTyikxPGOiyMQUDzVZu', 'manager'),
('Vinicius Fogaça', 'vfogacacintra@gmail.com', '$2a$12$Dgp7DDOLi91NJYR0abt.yuwSy7dDHDuS3wp/QRw02rs06HqDMr8WS', 'manager'),
('Maria Santos', 'maria.santos@sp.senai.br', '$2a$12$2uLf6ov665mPZRu6gBA7oufMhTC2mowcXEkSKw4H8Pbq27XPDn3Ca', 'user');

INSERT INTO item (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, lastMaintenance, batchCode, lotNumber, category, fkIdLocation) VALUES
('Martelo Unha', 'Martelo de Carpinteiro, Martelo Unha de Carpinteiro', 'Tramontina', 'Cabo de madeira', '500g', 15, NULL, '2025-01-10', 'MRT-202501-001', 1, 'tool', 1),
('Fita Isolante', 'Fita Elétrica, Fita Isoladora', '3M', 'Antichamas, preta', '19mm x 20m', 25.0, '2026-10-01', NULL, 'FSL-202610-009', 1, 'material', 2),
('Tinta Demarcação', 'Tinta de Sinalização, Spray de Marcação', 'Coral', 'Amarela, spray', '400ml', 50.0, '2027-02-15', NULL, 'TDT-202702-014', 1, 'product', 3),
('Pilhas AA', 'Baterias AA, Pilhas Alcalinas', 'Duracell', 'Alcalinas', '1.5V', 40.0, '2028-01-01', NULL, 'P-AA-202801-001', 1, 'diverses', 7),
('Óleo de Corte', 'Fluido de Corte, Óleo de Usinagem', 'Quimatic', 'Fluido de corte integral', '1L', 7.0, '2026-12-31', NULL, 'OC-202612-005', 1, 'rawMaterial', 11);

INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES
(1, 1, 'IN', 15, 0, 15),
(1, 2, 'IN', 25.0, 0.0, 25.0),
(1, 3, 'IN', 50.0, 0.0, 50.0),
(1, 4, 'IN', 40.0, 0.0, 40.0),
(1, 5, 'IN', 7.0, 0.0, 7.0);
