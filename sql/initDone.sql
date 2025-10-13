CREATE DATABASE IF NOT EXISTS stock;
USE stock;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS lots;
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
    technicalSpecs JSON DEFAULT NULL,
    sapCode INT UNIQUE,
    minimumStock INT DEFAULT NULL,
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

INSERT INTO technicalSpec (technicalSpecKey) VALUES
('Peso'),
('Voltagem'),
('Potencia'),
('Comprimento'),
('Largura'),
('Altura'),
('Cor'),
('Material'),
('Capacidade'),
('Temperatura De Operação'),
('Umidade De Operação'),
('Frequência'),
('Vida Útil'),
('Resistência'),
('Tensão Máxima'),
('Corrente Máxima'),
('Dimensões');

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

INSERT INTO item (name, aliases, brand, description, technicalSpecs, sapCode, minimumStock, fkIdCategory, fkIdImage) VALUES
('Aço ABNT 1010 / 20 Ø 2” x 143mm', 'Aço 1010, Aço para usinagem', 'Acind', 'Aço cilíndrico para usinagem em tornearia', '{"8": "Aço ABNT 1010/20", "17": "Ø 2\\" x 143mm"}', 1003198, 10, 3, NULL),
('Aço ABNT 1010 / 20 Ø 2” x 137mm', 'Aço 1010, Aço para usinagem', 'Acind', 'Aço cilíndrico para usinagem em tornearia', '{"8": "Aço ABNT 1010/20", "17": "Ø 2\\" x 137mm"}', 1003197, 10, 3, NULL),
('Aço ABNT 1010 / 20 Ø 2” x 115mm', 'Aço 1010, Aço para usinagem', 'Acind', 'Aço cilíndrico para usinagem em tornearia', '{"8": "Aço ABNT 1010/20", "17": "Ø 2\\" x 115mm"}', 1003195, 10, 3, NULL),
('Aço ABNT 1010 / 20 Ø 2” x 45mm', 'Aço 1010, Aço para usinagem', 'Acind', 'Aço cilíndrico para usinagem em tornearia', '{"8": "Aço ABNT 1010/20", "17": "Ø 2\\" x 45mm"}', 1001583, 10, 3, NULL),
('Aço ABNT 1010 / 20 Ø 2” x 50mm', 'Aço 1010, Aço para usinagem', 'Acind', 'Aço cilíndrico para usinagem em tornearia', '{"8": "Aço ABNT 1010/20", "17": "Ø 2\\" x 50mm"}', 1014521, 10, 3, NULL),
('Alumínio Ø 3/4" x 130mm', 'Alumínio para usinagem', 'Metalúrgica', 'Barra de alumínio para usinagem em tornearia', '{"8": "Alumínio", "17": "Ø 3/4\\" x 130mm"}', 1014532, 10, 3, NULL),
('Aço ABNT 1010 / 20 Ø 2” x 65mm', 'Aço 1010, Aço para usinagem', 'Acind', 'Aço cilíndrico para usinagem em tornearia', '{"8": "Aço ABNT 1010/20", "17": "Ø 2\\" x 65mm"}', 1001584, 10, 3, NULL),
('Aço ABNT 1010 / 20 tref. quad. 3/8” x 75mm', 'Aço 1010, Aço trefilado quadrado', 'Acind', 'Aço trefilado quadrado para usinagem em tornearia', '{"8": "Aço ABNT 1010/20", "17": "tref. quad. 3/8\\" x 75mm"}', 1001614, 10, 3, NULL),
('Alumínio Ø 3/4” mm x 65 mm', 'Alumínio para usinagem', 'Metalúrgica', 'Barra de alumínio para usinagem em tornearia', '{"8": "Alumínio", "17": "Ø 3/4\\" mm x 65 mm"}', 1001712, 10, 3, NULL),
('Aço ABNT 1010 / 20 Laminado chato 5/8” x 2 ½” x 65mm', 'Aço laminado chato', 'Acind', 'Aço laminado chato para ajustagem', '{"8": "Aço ABNT 1010/20", "17": "chato 5/8\\" x 2 1/2\\" x 65mm"}', 1014525, 10, 3, NULL),
('Chapa de Cobre Eletrolítico 1,47 x 70 x 133mm', 'Chapa de Cobre', 'Metalúrgica', 'Chapa de cobre eletrolítico para ajustagem', '{"8": "Cobre Eletrolítico", "17": "1,47 x 70 x 133mm"}', 1002228, 10, 3, NULL),
('Aço ABNT 1010 / 20 Laminado chato 1” x 2 ½” x 55mm', 'Aço laminado chato', 'Acind', 'Aço laminado chato para ajustagem', '{"8": "Aço ABNT 1010/20", "17": "chato 1\\" x 2 1/2\\" x 55mm"}', 1001488, 10, 3, NULL),
('Aço ABNT 1010 / 20 Laminado chato ¾” x 1 ¼” x 55mm', 'Aço laminado chato', 'Acind', 'Aço laminado chato para ajustagem', '{"8": "Aço ABNT 1010/20", "17": "chato 3/4\\" x 1 1/4\\" x 55mm"}', 1014527, 10, 3, NULL),
('Aço ABNT 1010 / 20 Laminado chato ¾” x 3 ½” x 85mm', 'Aço laminado chato', 'Acind', 'Aço laminado chato para ajustagem', '{"8": "Aço ABNT 1010/20", "17": "chato 3/4\\" x 3 1/2\\" x 85mm"}', 1001531, 10, 3, NULL),
('Aço ABNT 1010 / 20 trefil.o Ø 5/16” x 110mm', 'Aço trefilado', 'Acind', 'Aço trefilado para ajustagem', '{"8": "Aço ABNT 1010/20", "17": "trefil.o Ø 5/16\\" x 110mm"}', 1001641, 10, 3, NULL),
('Aço ABNT 1010 / 20 Laminado chato 1 ¼” x 2 ½” x 55mm', 'Aço laminado chato', 'Acind', 'Aço laminado chato para ajustagem', '{"8": "Aço ABNT 1010/20", "17": "chato 1 1/4\\" x 2 1/2\\" x 55mm"}', 1014528, 10, 3, NULL),
('Aço ABNT 1010 / 20 Tref. quad. 1 ¾” x 64mm', 'Aço trefilado quadrado', 'Acind', 'Aço trefilado quadrado para ajustagem', '{"8": "Aço ABNT 1010/20", "17": "Tref. quad. 1 3/4\\" x 64mm"}', 1003869, 10, 3, NULL),
('Bronze TM-23 Ø1"x170mm', 'Bronze para usinagem', 'Metalúrgica', 'Bronze para usinagem em máquinas', '{"8": "Bronze TM-23", "17": "Ø1\\"x170mm"}', 1020430, 10, 3, NULL),
('Aço ABNT 1010 / 20 Lam. Ø 1” x 175mm', 'Aço laminado', 'Acind', 'Aço laminado para usinagem em máquinas', '{"8": "Aço ABNT 1010/20", "17": "Lam. Ø 1\\" x 175mm"}', 1003874, 10, 3, NULL),
('Aço ABNT 1010 / 20 Lam. Ø 2” x 70mm', 'Aço laminado', 'Acind', 'Aço laminado para usinagem em máquinas', '{"8": "Aço ABNT 1010/20", "17": "Lam. Ø 2\\" x 70mm"}', 1012137, 10, 3, NULL),
('Alumínio 6351 T6 Ø 2" x 16mm', 'Alumínio para usinagem', 'Metalúrgica', 'Alumínio para usinagem em máquinas', '{"8": "Alumínio 6351 T6", "17": "Ø 2\\" x 16mm"}', 1012117, 10, 3, NULL),
('Alumínio 6351 T6 Ø 30mm x 16mm', 'Alumínio para usinagem', 'Metalúrgica', 'Alumínio para usinagem em máquinas', '{"8": "Alumínio 6351 T6", "17": "Ø 30mm x 16mm"}', 1020431, 10, 3, NULL),
('Aço ABNT1010/1020Lam.Ch.1"x 2.1/4"x105mm', 'Aço laminado chato', 'Acind', 'Aço laminado chato para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Lam.Ch.1\\"x 2.1/4\\"x105mm"}', 1012142, 10, 3, NULL),
('Aço ABNT1010/1020Tref.Ch. 1/2"x 1"x 144mm', 'Aço trefilado chato', 'Acind', 'Aço trefilado chato para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Tref.Ch. 1/2\\"x 1\\"x 144mm"}', 1020432, 10, 3, NULL),
('Aço ABNT1010/1020Tref.Ch.1/2"x 1" x 68mm', 'Aço trefilado chato', 'Acind', 'Aço trefilado chato para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Tref.Ch.1/2\\"x 1\\" x 68mm"}', 1012134, 10, 3, NULL),
('Aço ABNT1010/1020Lam.Ø1"x265mm', 'Aço laminado', 'Acind', 'Aço laminado para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Lam.Ø1\\"x265mm"}', 1012143, 10, 3, NULL),
('Ferro fundido cinzento Ø2 1/2"x56mm', 'Ferro fundido', 'Metalúrgica', 'Ferro fundido cinzento para usinagem em máquinas', '{"8": "Ferro fundido cinzento", "17": "Ø2 1/2\\"x56mm"}', 1020433, 10, 3, NULL),
('Aço ABNT1010/1020Tref.Ø1"x286mm', 'Aço trefilado', 'Acind', 'Aço trefilado para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Tref.Ø1\\"x286mm"}', 1012150, 10, 3, NULL),
('Aço ABNT1010/1020Tref.Ø8mmx50mm', 'Aço trefilado', 'Acind', 'Aço trefilado para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Tref.Ø8mmx50mm"}', 1012135, 10, 3, NULL),
('Latão Ø11/4"x30mm', 'Latão para usinagem', 'Metalúrgica', 'Latão para usinagem em máquinas', '{"8": "Latão", "17": "Ø11/4\\"x30mm"}', 1012129, 10, 3, NULL),
('Aço ABNT1010/1020Tref.Ch.1/2"x11/2"x64mm', 'Aço trefilado chato', 'Acind', 'Aço trefilado chato para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Tref.Ch.1/2\\"x11/2\\"x64mm"}', 1012133, 10, 3, NULL),
('Aço ABNT1010/1020Lam.Ch.3/4"x 2 3/4"x114mm', 'Aço laminado chato', 'Acind', 'Aço laminado chato para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Lam.Ch.3/4\\"x 2 3/4\\"x114mm"}', 1012146, 10, 3, NULL),
('BronzeTM23 Ø1"x120mm', 'Bronze para usinagem', 'Metalúrgica', 'Bronze para usinagem em máquinas', '{"8": "BronzeTM23", "17": "Ø1\\"x120mm"}', 1012128, 10, 3, NULL),
('Aço ABNT1010/1020Tref. Ø3/4"X170mm', 'Aço trefilado', 'Acind', 'Aço trefilado para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Tref. Ø3/4\\"X170mm"}', 1012149, 10, 3, NULL),
('Latão Ø1"x90mm', 'Latão para usinagem', 'Metalúrgica', 'Latão para usinagem em máquinas', '{"8": "Latão", "17": "Ø1\\"x90mm"}', 1012131, 10, 3, NULL),
('Alumínio 6351 T6 Ø11/4"x17mm', 'Alumínio para usinagem', 'Metalúrgica', 'Alumínio para usinagem em máquinas', '{"8": "Alumínio 6351 T6", "17": "Ø11/4\\"x17mm"}', 1012118, 10, 3, NULL),
('Aço ABNT1010/1020 Lam.Ch.3/4"x2"x105m', 'Aço laminado chato', 'Acind', 'Aço laminado chato para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Lam.Ch.3/4\\"x2\\"x105m"}', 1012147, 10, 3, NULL),
('Aço ABNT1010/1020Lam.Ch.1/2"x4"x154m', 'Aço laminado chato', 'Acind', 'Aço laminado chato para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Lam.Ch.1/2\\"x4\\"x154m"}', 1012141, 10, 3, NULL),
('Aço ABNT1010/1020Tref.Red.3/4"x136mm', 'Aço trefilado redondo', 'Acind', 'Aço trefilado redondo para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Tref.Red.3/4\\"x136mm"}', 1012136, 10, 3, NULL),
('Latão Ø11/8"x40mm', 'Latão para usinagem', 'Metalúrgica', 'Latão para usinagem em máquinas', '{"8": "Latão", "17": "Ø11/8\\"x40mm"}', 1012130, 10, 3, NULL),
('Aço ABNT1010/1020 Lam.Quad.11/2"x40mm', 'Aço laminado quadrado', 'Acind', 'Aço laminado quadrado para usinagem em máquinas', '{"8": "Aço ABNT1010/1020", "17": "Lam.Quad.11/2\\"x40mm"}', 1012132, 10, 3, NULL),
('Poliacetal Ø 20 x 55 mm', 'Poliacetal para usinagem', 'PLASTICO IND', 'Poliacetal para usinagem em máquinas CNC', '{"8": "Poliacetal", "17": "Ø 20 x 55 mm"}', 1020434, 10, 3, NULL),
('Alumínio 6351 T6 Ø 1.¾” x 40 mm', 'Alumínio para usinagem', 'Metalúrgica', 'Alumínio para usinagem em máquinas CNC', '{"8": "Alumínio 6351 T6", "17": "Ø 1.¾\\" x 40 mm"}', 1020436, 10, 3, NULL),
('Alumínio 6351 T6 Ø 1.¾” x 74 mm', 'Alumínio para usinagem', 'Metalúrgica', 'Alumínio para usinagem em máquinas CNC', '{"8": "Alumínio 6351 T6", "17": "Ø 1.¾\\" x 74 mm"}', 1020437, 10, 3, NULL),
('Aço ABNT 1010/1020 Lam. Ø 2.½” x 40 mm', 'Aço laminado', 'Acind', 'Aço laminado para usinagem em máquinas CNC', '{"8": "Aço ABNT 1010/1020", "17": "Lam. Ø 2.½\\" x 40 mm"}', 1003191, 10, 3, NULL),
('Bronze TM 23 Ø 7/8” x 100 mm', 'Bronze para usinagem', 'Metalúrgica', 'Bronze para usinagem em máquinas CNC', '{"8": "Bronze TM 23", "17": "Ø 7/8\\" x 100 mm"}', 1020435, 10, 3, NULL),
('Alumínio 6351 T6 Ø 2” x 117 mm', 'Alumínio para usinagem', 'Metalúrgica', 'Alumínio para usinagem em máquinas CNC', '{"8": "Alumínio 6351 T6", "17": "Ø 2\\" x 117 mm"}', 1012125, 10, 3, NULL),
('Alumínio 6351 T6 Ø 2.½” x 95 mm', 'Alumínio para usinagem', 'Metalúrgica', 'Alumínio para usinagem em máquinas CNC', '{"8": "Alumínio 6351 T6", "17": "Ø 2.½\\" x 95 mm"}', 1020438, 10, 3, NULL),
('Aço ABNT 1010/1020 Lam. □ 2” x 104 mm', 'Aço laminado quadrado', 'Acind', 'Aço laminado quadrado para usinagem em fresagem CNC', '{"8": "Aço ABNT 1010/1020", "17": "Lam. □ 2\\" x 104 mm"}', 1020439, 10, 3, NULL),
('Alumínio 6351 T6 CH 1.¼” x 4” x 160mm', 'Alumínio chato', 'Metalúrgica', 'Alumínio chato para usinagem em fresagem CNC', '{"8": "Alumínio 6351 T6", "17": "CH 1.¼\\" x 4\\" x 160mm"}', 1020440, 10, 3, NULL),
('Aço ABNT 1010/1020 Lam. □ 1.½” x 125 mm', 'Aço laminado quadrado', 'Acind', 'Aço laminado quadrado para usinagem em fresagem CNC', '{"8": "Aço ABNT 1010/1020", "17": "Lam. □ 1.½\\" x 125 mm"}', 1020441, 10, 3, NULL),
('Aço ABNT 1010/1020 Lam. CH 1”x 1.¾” x 104 mm', 'Aço laminado chato', 'Acind', 'Aço laminado chato para usinagem em fresagem CNC', '{"8": "Aço ABNT 1010/1020", "17": "Lam. CH 1\\"x 1.¾\\" x 104 mm"}', 1020442, 10, 3, NULL),
('Alumínio 6351 T6 □ 4” x 50 mm', 'Alumínio quadrado', 'Metalúrgica', 'Alumínio quadrado para usinagem em fresagem CNC', '{"8": "Alumínio 6351 T6", "17": "□ 4\\" x 50 mm"}', 1020443, 10, 3, NULL),
('Aço ABNT 1010/20   1/2" x 1 1/2" x 83', 'Aço 1010, Aço laminado chato', 'ACIND', 'Aço laminado chato para usinagem', '{"8": "Aço ABNT 1010/20", "17": "1/2\\"\\" x 1 1/2\\"\\" x 83mm"}', 1020023, 10, 3, NULL),
('Aço ABNT 1010/20   3/4" X 113 X 85', 'Aço 1010, Aço laminado chato', 'ACIND', 'Aço laminado chato para usinagem', '{"8": "Aço ABNT 1010/20", "17": "3/4\\"\\" X 113 X 85mm"}', 1025304, 10, 3, NULL),
('Aço ABNT 1010/20   1/2" X 7/8" X 83', 'Aço 1010, Aço laminado chato', 'ACIND', 'Aço laminado chato para usinagem', '{"8": "Aço ABNT 1010/20", "17": "1/2\\"\\" X 7/8\\"\\" X 83mm"}', 1025303, 10, 3, NULL),
('Aço ABNT 1010/20   CH 1,5 X 35 x 293', 'Aço 1010, Chapa', 'ACIND', 'Chapa de aço para proteção', '{"8": "Aço ABNT 1010/20", "17": "CH 1,5 X 35 x 293mm"}', 1020014, 10, 3, NULL),
('Aço ABNT 1010/20   CH 1,5 X 110 X 60', 'Aço 1010, Chapa', 'ACIND', 'Chapa de aço para proteção', '{"8": "Aço ABNT 1010/20", "17": "CH 1,5 X 110 X 60mm"}', 1020793, 10, 3, NULL),
('Aço ABNT 1010/20   7/8" X 1/4" X 160', 'Aço 1010, Barra redonda', 'ACIND', 'Barra de aço para alavanca', '{"8": "Aço ABNT 1010/20", "17": "7/8\\"\\" X 1/4\\"\\" X 160mm"}', 1020822, 10, 3, NULL),
('Aço ABNT 1010/20   CH 1,5 X 95 X 143', 'Aço 1010, Chapa', 'ACIND', 'Chapa de aço para calha', '{"8": "Aço ABNT 1010/20", "17": "CH 1,5 X 95 X 143mm"}', 1020015, 10, 3, NULL),
('Aço ABNT 1010/20   Lam. Ø 2" X 180', 'Aço 1010, Aço laminado', 'ACIND', 'Aço laminado para eixo', '{"8": "Aço ABNT 1010/20", "17": "Lam. Ø 2\\"\\" X 180mm"}', 1014520, 10, 3, NULL),
('Aço ABNT 1010/20   Lam. Ø 1 1/2" X 145', 'Aço 1010, Aço laminado', 'ACIND', 'Aço laminado para eixo secundário', '{"8": "Aço ABNT 1010/20", "17": "Lam. Ø 1 1/2\\"\\" X 145mm"}', 1025305, 10, 3, NULL),
('Aço ABNT 1010/20  Tref.  Ø 1/2" X 125', 'Aço 1010, Aço trefilado redondo', 'ACIND', 'Aço trefilado redondo para tirante', '{"8": "Aço ABNT 1010/20", "17": "Tref.  Ø 1/2\\"\\" X 125mm"}', 1025302, 10, 3, NULL),
('Alumínio Laminado   Ø 1" X 100', 'Alumínio laminado', 'METALURGICA', 'Alumínio laminado para manípulo', '{"8": "Alumínio", "17": "Ø 1\\"\\" X 100mm"}', 1014531, 10, 3, NULL),
('Latão   Ø 1" X 25', 'Latão, Barra redonda', 'METALURGICA', 'Barra de latão para bucha', '{"8": "Latão", "17": "Ø 1\\"\\" X 25mm"}', 1020794, 10, 3, NULL),
('Aço ABNT 1010/20   CH 1/4" x 3/4" x 162', 'Aço 1010, Chapa', 'ACIND', 'Chapa de aço para pés', '{"8": "Aço ABNT 1010/20", "17": "CH 1/4\\"\\" x 3/4\\"\\" x 162mm"}', 1025260, 10, 3, NULL),
('Aço ABNT 1010/20   CH 1/4" x 125 x 162', 'Aço 1010, Chapa', 'ACIND', 'Chapa de aço para base', '{"8": "Aço ABNT 1010/20", "17": "CH 1/4\\"\\" x 125 x 162mm"}', 1025296, 10, 3, NULL),
('Chaveta AB 5x5x19 DIN 6885', 'Chaveta', NULL, 'Chaveta para fixação', '{"8": "Aço", "17": "5x5x19mm"}', 1020796, 10, 6, NULL),
('Parafuso allen com cabeça M5 x 25', 'Parafuso Allen', NULL, 'Parafuso de fixação', '{"8": "Aço", "17": "M5 x 25mm"}', 1042920, 10, 6, NULL),
('Parafuso allen com cabeça M6 x 20', 'Parafuso Allen', NULL, 'Parafuso de fixação', '{"8": "Aço", "17": "M6 x 20mm"}', 1002940, 10, 6, NULL),
('Parafuso cabeça chata com fenda M5 x 16', 'Parafuso Fenda', NULL, 'Parafuso de fixação', '{"8": "Aço", "17": "M5 x 16mm"}', 1020814, 10, 6, NULL),
('Parafuso panela com recesso em cruz M2 x 6', 'Parafuso Phillips', NULL, 'Parafuso de fixação', '{"8": "Aço", "17": "M2 x 6mm"}', 1020812, 10, 6, NULL),
('Parafuso panela com recesso em cruz M5 x 12', 'Parafuso Phillips', NULL, 'Parafuso de fixação', '{"8": "Aço", "17": "M5 x 12mm"}', 1020811, 10, 6, NULL),
('Arruela lisa 10mm', 'Arruela Lisa', NULL, 'Arruela de fixação', '{"8": "Aço", "17": "10mm"}', 1020816, 10, 6, NULL),
('Arruela lisa 16mm', 'Arruela Lisa', NULL, 'Arruela de fixação', '{"8": "Aço", "17": "16mm"}', 1020815, 10, 6, NULL),
('Arruela de pressão 16mm', 'Arruela de Pressão', NULL, 'Arruela de fixação', '{"8": "Aço", "17": "16mm"}', 1020817, 10, 6, NULL),
('Porca sextavada M2', 'Porca Sextavada', NULL, 'Porca de fixação', '{"8": "Aço", "17": "M2"}', 1020819, 10, 6, NULL),
('Porca sextavada M10', 'Porca Sextavada', NULL, 'Porca de fixação', '{"8": "Aço", "17": "M10"}', 1003067, 10, 6, NULL),
('Porca sextavada baixa M16', 'Porca Sextavada', NULL, 'Porca de fixação', '{"8": "Aço", "17": "M16"}', 1020818, 10, 6, NULL),
('Anel elástico 16 x 14', 'Anel Elástico', NULL, 'Anel de retenção', '{"8": "Aço", "17": "16 x 14mm"}', 1020012, 10, 6, NULL),
('Pino elástico 5 x 50mm', 'Pino Elástico', NULL, 'Pino de fixação', '{"8": "Aço", "17": "5 x 50mm"}', 1020017, 10, 6, NULL),
('Pino elástico 5 x 35mm', 'Pino Elástico', NULL, 'Pino de fixação', '{"8": "Aço", "17": "5 x 35mm"}', 1020810, 10, 6, NULL),
('Pino cilíndrico 5 h8 x 45mm', 'Pino Cilíndrico', NULL, 'Pino de precisão', '{"8": "Aço", "17": "5 h8 x 45mm"}', 1020807, 10, 6, NULL),
('Pino cilíndrico 5 h8 x 60mm', 'Pino Cilíndrico', NULL, 'Pino de precisão', '{"8": "Aço", "17": "5 h8 x 60mm"}', 1020806, 10, 6, NULL),
('Pino graxeiro M6', 'Pino Graxeiro', NULL, 'Pino para lubrificação', '{"8": "Aço", "17": "M6"}', 1020820, 10, 6, NULL),
('Retentor 02492 GR - 16 X 22 X 34', 'Retentor', NULL, 'Vedação', '{"8": "Borracha/Metal", "17": "16 X 22 X 34mm"}', 1020803, 10, 6, NULL),
('Retentor 02730 BRG - 17 x 30 x 7', 'Retentor', NULL, 'Vedação', '{"8": "Borracha/Metal", "17": "17 x 30 x 7mm"}', 1020802, 10, 6, NULL),
('Rolamento Rígido de Esferas 61903 ZZ', 'Rolamento', NULL, 'Rolamento de esferas', '{"8": "Aço", "17": "61903 ZZ"}', 1020805, 10, 6, NULL),
('Helicoil  M6 x 1 - M8 x 1,25', 'Helicoil', NULL, 'Rosca postiça', '{"8": "Aço Inox", "17": "M6 x 1 - M8 x 1,25mm"}', 1020821, 10, 6, NULL),
('Dobradiça 20 x 14mm', 'Dobradiça', NULL, 'Dobradiça metálica', '{"8": "Aço", "17": "20 x 14mm"}', 1020800, 10, 6, NULL),
('Engrenagem dente reto poliamida Z=14 M=2,5', 'Engrenagem', NULL, 'Engrenagem de poliamida', '{"8": "Poliamida", "17": "Z=14 M=2,5"}', 1026558, 10, 6, NULL),
('Engrenagem dente reto poliamida Z=17 M=2,5', 'Engrenagem', NULL, 'Engrenagem de poliamida', '{"8": "Poliamida", "17": "Z=17 M=2,5"}', 1026559, 10, 6, NULL),
('Policarbonato 80 x 55 x 3mm', 'Policarbonato', NULL, 'Placa de policarbonato', '{"8": "Policarbonato", "17": "80 x 55 x 3mm"}', 1020799, 10, 6, NULL),
('Policarbonato 200 x 80 x 3mm', 'Policarbonato', NULL, 'Placa de policarbonato', '{"8": "Policarbonato", "17": "200 x 80 x 3mm"}', 1020798, 10, 6, NULL);
