CREATE DATABASE IF NOT EXISTS stock;
USE stock;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS tool;
DROP TABLE IF EXISTS material;
DROP TABLE IF EXISTS rawMaterial;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS diverses;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS location;

CREATE TABLE location (
    idLocation INT PRIMARY KEY AUTO_INCREMENT,
    place VARCHAR(255) NOT NULL,
    locationCode VARCHAR(255) NOT NULL,
    UNIQUE(place, locationCode)
);

CREATE TABLE user (
    idUser INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashedPassword VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('user', 'manager'))
);

CREATE TABLE tool (
    idTool INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity INT NOT NULL DEFAULT 0,
    lastMaintenance DATE,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE material (
    idMaterial INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE rawMaterial (
    idRawMaterial INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE equipment (
    idEquipment INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity INT NOT NULL DEFAULT 0,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE product (
    idProduct INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity INT NOT NULL DEFAULT 0,
    expirationDate DATE,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE diverses (
    idDiverses INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE transactions (
    idTransaction INT PRIMARY KEY AUTO_INCREMENT,
    fkIdUser INT NOT NULL,
    itemType VARCHAR(255) NOT NULL,
    itemId INT NOT NULL,
    actionDescription ENUM('IN', 'OUT', 'AJUST') NOT NULL,
    quantityChange DECIMAL(10, 2) NOT NULL,
    oldQuantity DECIMAL(10, 2),
    newQuantity DECIMAL(10, 2),
    transactionDate DATETIME NOT NULL,
    FOREIGN KEY (fkIdUser) REFERENCES user(idUser)
);

CREATE INDEX idxToolName ON tool(name);
CREATE INDEX idxToolFkIdLocation ON tool(fkIdLocation);
CREATE INDEX idxMaterialName ON material(name);
CREATE INDEX idxMaterialFkIdLocation ON material(fkIdLocation);
CREATE INDEX idxRawMaterialName ON rawMaterial(name);
CREATE INDEX idxRawMaterialFkIdLocation ON rawMaterial(fkIdLocation);
CREATE INDEX idxEquipmentName ON equipment(name);
CREATE INDEX idxEquipmentFkIdLocation ON equipment(fkIdLocation);
CREATE INDEX idxProductName ON product(name);
CREATE INDEX idxProductFkIdLocation ON product(fkIdLocation);
CREATE INDEX idxDiversesName ON diverses(name);
CREATE INDEX idxDiversesFkIdLocation ON diverses(fkIdLocation);
CREATE INDEX idxUserRole ON user(role);
CREATE INDEX idxTransactionsFkIdUser ON transactions(fkIdUser);
CREATE INDEX idxTransactionsDate ON transactions(transactionDate);
CREATE INDEX idxTransactionsAction ON transactions(actionDescription);
CREATE INDEX idxTransactionsItem ON transactions(itemType, itemId);

INSERT INTO location (place, locationCode) VALUES
('Prateleira', 'A1'),
('Prateleira', 'A2'),
('Prateleira', 'A3'),
('Armário', 'B1'),
('Armário', 'B2'),
('Armário', 'B3'),
('Gaveta', 'C1'),
('Gaveta', 'C2'),
('Gaveta', 'C3'),
('Depósito', 'D1'),
('Depósito', 'D2'),
('Depósito', 'D3');

INSERT INTO user (name, email, hashedPassword, role) VALUES
('João Silva', 'joao.silva@sp.senai.br', '$2a$12$pUpODOURw.nIEgqGiT4sNuPPoesLu.9rg4dTyikxPGOiyMQUDzVZu', 'manager'), -- Joao.1234
('Maria Santos', 'maria.santos@sp.senai.br', '$2a$12$2uLf6ov665mPZRu6gBA7oufMhTC2mowcXEkSKw4H8Pbq27XPDn3Ca', 'user'); -- Maria.2345

INSERT INTO tool (name, brand, description, technicalSpecs, quantity, lastMaintenance, batchNumber, fkIdLocation) VALUES
('Martelo Unha', 'Tramontina', 'Cabo Madeira', '500g', 15, '2025-01-10', 'MRT-202501-001', 1),
('Chave Fenda Philips', 'Gedore', 'Ponta Philips', '6mm', 30, '2024-11-20', 'CFP-202411-002', 1),
('Furadeira Impacto', 'Bosch', 'Com Mandril', '700W', 5, '2025-06-01', 'FDI-202506-003', 4),
('Alicate Universal', 'Belzer', 'Cabo Emborrachado', '8 Polegadas', 20, '2025-03-15', 'ALU-202503-004', 7),
('Trena Medição', 'Starrett', 'Com Trava Automática', '5m', 10, '2024-12-05', 'TRN-202412-005', 2),
('Nível Bolha', 'Lee Tool', '3 Bolhas, Magnético', '40cm', 8, '2025-04-20', 'NVB-202504-006', 2),
('Serra Circular', 'Makita', 'Lâmina Carboneto', '185mm', 3, '2025-06-15', 'SCR-202506-007', 5),
('Chave Grifo', 'Sparta', 'Tipo Stillson', '12 Polegadas', 6, '2025-05-01', 'CG-202505-008', 10),
('Rebitadeira', 'Vonder', 'Bico Intercambiável', NULL, 4, '2025-07-01', 'RBD-202507-009', 4),
('Esmerilhadeira', 'DeWalt', 'Disco Diamantado', '4 1/2 Polegadas', 7, '2025-06-25', 'ESM-202506-010', 6);

INSERT INTO material (name, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES
('Parafuso Sextavado', 'Ciser', 'Aço Carbono', NULL, 500.0, NULL, 'PSX-202507-006', 7),
('Porca Sextavada', 'Gerdau', 'Aço Zincado', NULL, 450.0, NULL, 'PST-202507-007', 7),
('Arruela Lisa', 'Votorantim', 'Aço Galvanizado', NULL, 600.0, NULL, 'ARL-202507-008', 8),
('Fita Isolante', '3M', 'Antichamas, Preta', '19mm x 20m', 25.0, '2026-10-01', 'FSL-202610-009', 2),
('Luvas Proteção', 'Danny', 'Tamanho G', NULL, 100.0, NULL, 'LVP-202507-010', 4),
('Fita Veda Rosca', 'Tigre', 'PTFE', '18mm x 10m', 35.0, NULL, 'FVR-202506-011', 9),
('Cabo Aço', 'Sideraço', 'Aço Galvanizado', '3mm x 50m', 15.0, NULL, 'CBL-202507-012', 11),
('Abraçadeira Nylon', 'HellermannTyton', 'Autotravante, Branca', '4.8mm x 200mm', 200.0, NULL, 'ABN-202507-013', 8),
('Tinta Demarcação', 'Coral', 'Amarela, Spray', '400ml', 50.0, '2027-02-15', 'TDT-202702-014', 3),
('Conector Elétrico', 'Wago', 'Automático', '3 Vias', 75.0, NULL, 'CEL-202507-015', 7);

INSERT INTO rawMaterial (name, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation) VALUES
('Barra de Ferro Redonda', 'ArcelorMittal', 'Aço Carbono', '10mm x 6m', 50.0, 'BF10-202507-001', 10),
('Chapa de Aço Carbono', 'Usiminas', 'Laminação a Frio', '1mm x 1m x 2m', 20.0, 'CA1-202506-005', 10),
('Tubo de Alumínio', 'Alcoa', 'Liga de Alumínio', '20mm x 3m', 30.0, 'TA20-202505-010', 11),
('Óleo Lubrificante', 'Shell', 'Multiviscoso', '20L', 5.0, 'OL-202504-015', 5),
('Fio Elétrico', 'Cobrecom', 'Cabo Flexível', '2.5mm² x 100m', 10.0, 'FE25-202507-020', 11),
('Bobina Cobre', 'Paranapanema', 'Fio Esmaltado', '1.5mm', 15.0, 'BCB-202506-021', 12),
('Lâmina de Acrílico', 'Cast Acrylic', 'Transparente', '2mm x 1.2m x 2.4m', 25.0, 'LMA-202507-022', 12),
('Bloco Borracha', 'Rubber Brasil', 'Borracha Sintética', '500mm x 500mm x 50mm', 8.0, 'BBL-202507-023', 10),
('Areia Industrial', 'Mineradora Delta', 'Granulometria Fina', '25kg', 100.0, 'ARI-202506-024', 12),
('Tinta Marcenaria', 'Montana', 'Branca, Galão', '3.6L', 22.0, 'TMA-202507-025', 11);

INSERT INTO equipment (name, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation) VALUES
('Avental Couro', 'Bracol', 'Para Soldagem', 'Tamanho Único', 8, 'ACL-202502-021', 4),
('Capacete Segurança', 'MSA', 'Com Viseira', NULL, 12, 'CSC-202501-022', 4),
('Óculos Proteção', 'Libus', 'Transparente, Anti-Embaçante', NULL, 50, 'OPR-202411-023', 5),
('Máscara Respiratória', '3M', 'Proteção PFF2', 'Com Válvula', 30, 'MRS-202503-024', 5),
('Protetor Auricular Concha', '3M', 'Tipo Concha', '26 dB', 25, 'PAC-202412-025', 5),
('Luva de Raspa', 'Promat', 'Punho 20cm', 'Tamanho G', 15, 'LDR-202507-026', 6),
('Cinto Segurança', '3M', 'Paraquedista', 'Com 3 Pontos', 5, 'CSG-202506-027', 6),
('Abafador Ruído', 'Danny', 'Arco Ajustável', '30 dB', 18, 'AR-202505-028', 4),
('Cinto Ferramentas', 'Vonder', 'Lona Reforçada', NULL, 9, 'CF-202504-029', 9),
('Mangueira Ar Comprimido', 'Macom', 'PVC com Tela', '10m', 11, 'MAC-202507-030', 6);

INSERT INTO product (name, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES
('Solvente Desengraxante', 'Quimisa', 'Industrial', '5L', 20, '2026-11-01', 'SDI-202611-026', 10),
('Adesivo Epóxi', 'Loctite', 'Bicomponente', '500g', 15, '2025-10-15', 'AEB-202510-027', 8),
('Tinta Spray', 'Suvinil', 'Fosca, Preta', '400ml', 30, '2027-05-20', 'TSF-202705-028', 1),
('Graxa Multiuso', 'Bardahl', 'Tubo de Aplicação', '1kg', 10, '2026-08-01', 'GMU-202608-029', 11),
('Kit Limpeza', 'Wurth', 'Pincéis e Panos', NULL, 5, NULL, 'KLF-202507-030', 4),
('Desmoldante', 'Tekbond', 'Spray de Silicone', '300ml', 12, '2027-03-01', 'DSV-202703-031', 12),
('Limpa Contato', 'Loctite', 'Eletrônico', '250ml', 25, '2026-12-10', 'LCE-202612-032', 3),
('Selante Acrílico', 'Sika', 'Branco, Calafetagem', '500g', 18, '2026-09-05', 'SAC-202609-033', 9),
('Massa Calafetar', 'Viapol', 'Vedação', '1kg', 8, NULL, 'MCA-202507-034', 10),
('Fita Dupla Face', '3M', 'Forte Fixação', '12mm x 20m', 22, NULL, 'FDF-202507-035', 2);

INSERT INTO diverses (name, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES
('Pilhas AA', 'Duracell', 'Alcalinas', '1.5V', 40.0, '2028-01-01', 'P-AA-202801-001', 7),
('Canetas Marcadoras', 'Faber-Castell', 'Ponta Fina', 'Preta', 12.0, NULL, 'CMF-202507-002', 8),
('Papel A4', 'Chamex', '75g/m²', 'Pacote 500 folhas', 5.0, NULL, 'PA4-202506-003', 1),
('Fita Crepe', 'Adelbras', 'Uso Geral', '24mm x 50m', 18.0, NULL, 'FC-202507-004', 2),
('Óleo de Corte', 'Quimatic', 'Fluido de Corte Integral', '1L', 7.0, '2026-12-31', 'OC-202612-005', 11),
('Cola Branca', 'Cascola', 'Extra forte', '500g', 10.0, '2027-04-15', 'CB-202704-006', 9),
('Limpador Multiuso', 'Veja', 'Gatilho', '500ml', 25.0, '2026-10-01', 'LM-202610-007', 3),
('Saco de Lixo', 'Embalixo', 'Reforçado, 100L', 'Preto', 50.0, NULL, 'SLR-202507-008', 12),
('Cartuchos de Tinta', 'HP', 'Preto e Colorido', 'Modelo 664', 3.0, '2027-02-20', 'CT-202702-009', 10),
('Esponja de Limpeza', '3M', 'Dupla Face', NULL, 30.0, NULL, 'EL-202507-010', 4);

INSERT INTO transactions (fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES
(1, 'tool', 3, 'OUT', -2, 5, 3, '2025-07-13 14:00:00'),
(2, 'material', 5, 'OUT', -20.0, 100.0, 80.0, '2025-07-13 14:05:00'),
(1, 'equipment', 1, 'OUT', -1, 8, 7, '2025-07-13 14:10:00'),
(2, 'product', 2, 'OUT', -5, 15, 10, '2025-07-13 14:15:00'),
(1, 'tool', 1, 'IN', 5, 15, 20, '2025-07-13 14:20:00'),
(2, 'material', 7, 'OUT', -10.0, 15.0, 5.0, '2025-07-13 14:25:00'),
(1, 'rawMaterial', 4, 'OUT', -3.0, 5.0, 2.0, '2025-07-13 14:30:00'),
(2, 'equipment', 3, 'IN', 10, 50, 60, '2025-07-13 14:35:00'),
(1, 'product', 1, 'OUT', -3, 20, 17, '2025-07-13 14:40:00'),
(2, 'tool', 2, 'OUT', -10, 30, 20, '2025-07-13 14:45:00'),
(1, 'tool', 3, 'AJUST', 0, 3, 3, '2025-07-14 09:00:00'),
(2, 'material', 4, 'AJUST', -5.0, 25.0, 20.0, '2025-07-14 10:30:00'),
(1, 'rawMaterial', 1, 'IN', 10.0, 50.0, 60.0, '2025-07-14 11:00:00'),
(2, 'product', 5, 'IN', 5, 0, 5, '2025-07-14 12:00:00');
