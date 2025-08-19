-- Criar e usar o banco de dados
CREATE DATABASE IF NOT EXISTS stock;
USE stock;

-- Excluir tabelas existentes para garantir um ambiente limpo
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS location;

-- Tabela para armazenar informações de localização física de itens
CREATE TABLE location (
    idLocation INT PRIMARY KEY AUTO_INCREMENT,
    place VARCHAR(255) NOT NULL,
    locationCode VARCHAR(255) NOT NULL,
    UNIQUE(place, locationCode)
);

-- Tabela para armazenar informações de usuários
CREATE TABLE user (
    idUser INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashedPassword VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('user', 'manager')),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela para armazenar informações de itens
CREATE TABLE items (
    itemId INT PRIMARY KEY AUTO_INCREMENT,
    itemType VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    batchNumber VARCHAR(255) UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(itemType, name, brand)
);

-- Tabela para gerenciar o inventário e o estoque de cada item
CREATE TABLE inventory (
    inventoryId INT PRIMARY KEY AUTO_INCREMENT,
    fkItemId INT NOT NULL,
    lotNumber VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE,
    lastMaintenance DATE,
    fkIdLocation INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fkItemId) REFERENCES items(itemId),
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation),
    UNIQUE(fkItemId, lotNumber)
);

-- Tabela para registrar todas as movimentações de estoque (entrada, saída, ajuste)
CREATE TABLE transactions (
    idTransaction INT PRIMARY KEY AUTO_INCREMENT,
    fkIdUser INT NOT NULL,
    fkInventoryId INT NOT NULL,
    actionDescription ENUM('IN', 'OUT', 'AJUST') NOT NULL,
    quantityChange DECIMAL(10, 2) NOT NULL,
    oldQuantity DECIMAL(10, 2),
    newQuantity DECIMAL(10, 2),
    transactionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fkIdUser) REFERENCES user(idUser),
    FOREIGN KEY (fkInventoryId) REFERENCES inventory(inventoryId)
);

-- Criar índices para otimizar a busca nas tabelas
CREATE INDEX idxItemsName ON items(name);
CREATE INDEX idxItemsType ON items(itemType);
CREATE INDEX idxInventoryItemId ON inventory(fkItemId);
CREATE INDEX idxInventoryLocation ON inventory(fkIdLocation);
CREATE INDEX idxTransactionsInventoryId ON transactions(fkInventoryId);
CREATE INDEX idxTransactionsUser ON transactions(fkIdUser);
CREATE INDEX idxTransactionsDate ON transactions(transactionDate);

--- Inserir dados na tabela de localização ---
INSERT INTO location (place, locationCode) VALUES
('Prateleira', 'A1'), ('Prateleira', 'A2'), ('Prateleira', 'A3'),
('Armário', 'B1'), ('Armário', 'B2'), ('Armário', 'B3'),
('Gaveta', 'C1'), ('Gaveta', 'C2'), ('Gaveta', 'C3'),
('Depósito', 'D1'), ('Depósito', 'D2'), ('Depósito', 'D3');

--- Inserir dados na tabela de usuários ---
INSERT INTO user (name, email, hashedPassword, role) VALUES
('João Silva', 'joao.silva@sp.senai.br', '$2a$12$pUpODOURw.nIEgqGiT4sNuPPoesLu.9rg4dTyikxPGOiyMQUDzVZu', 'manager'),
('Maria Santos', 'maria.santos@sp.senai.br', '$2a$12$2uLf6ov665mPZRu6gBA7oufMhTC2mowcXEkSKw4H8Pbq27XPDn3Ca', 'user');

--- Inserir dados na tabela de itens ---
--- Ferramentas (tools) ---
INSERT INTO items (itemType, name, aliases, brand, description, technicalSpecs, batchNumber) VALUES
('tools', 'Martelo Unha', 'Martelo de Carpinteiro, Martelo Unha de Carpinteiro', 'Tramontina', 'Cabo de madeira', '500g', 'MRT-202501-001'),
('tools', 'Chave Fenda Philips', 'Chave Estrela, Chave Cruzada', 'Gedore', 'Ponta Philips', 'Ponta 6mm', 'CFP-202411-002'),
('tools', 'Furadeira Impacto', 'Martelete, Furadeira de Percussão', 'Bosch', 'Com Mandril', '700W, 127V', 'FDI-202506-003'),
('tools', 'Alicate Corte', 'Alicate de Universal, Alicate de Bico', 'Belzer', 'Cabo emborrachado', '8 polegadas', 'ALU-202503-004'),
('tools', 'Trena Medição', 'Fita Métrica, Fita de Medição', 'Starrett', 'Com trava automática', '5m', 'TRN-202412-005');

--- Materiais (materials) ---
INSERT INTO items (itemType, name, aliases, brand, description, technicalSpecs, batchNumber) VALUES
('materials', 'Parafuso Sextavado', 'Parafuso Allen, Parafuso de Cabeça Hexagonal', 'Ciser', 'Aço carbono', 'M8 x 50mm', 'PSX-202507-006'),
('materials', 'Porca Sextavada', 'Porca Hexagonal, Porca de Aperto', 'Gerdau', 'Aço zincado', 'Rosca M8', 'PST-202507-007'),
('materials', 'Arruela Lisa', 'Arruela Plana, Arruela Simples', 'Votorantim', 'Aço galvanizado', 'M8, Diâmetro 16mm', 'ARL-202507-008'),
('materials', 'Fita Isolante', 'Fita Elétrica, Fita Isoladora', '3M', 'Antichamas, preta', '19mm x 20m', 'FSL-202610-009'),
('materials', 'Luvas Proteção', 'Luvas de Segurança, Luvas de Trabalho', 'Danny', 'Luva de proteção', 'Tamanho G', 'LVP-202507-010');

--- Matérias-primas (rawMaterials) ---
INSERT INTO items (itemType, name, aliases, brand, description, technicalSpecs, batchNumber) VALUES
('rawMaterials', 'Barra de Ferro Redonda', 'Vergalhão, Ferro Redondo', 'ArcelorMittal', 'Aço carbono', '10mm x 6m', 'BF10-202507-001'),
('rawMaterials', 'Chapa de Aço Carbono', 'Chapa de Metal, Folha de Aço', 'Usiminas', 'Laminação a frio', '1mm x 1m x 2m', 'CA1-202506-005'),
('rawMaterials', 'Tubo de Alumínio', 'Perfil de Alumínio, Cano de Alumínio', 'Alcoa', 'Liga de Alumínio', '20mm x 3m', 'TA20-202505-010'),
('rawMaterials', 'Óleo Lubrificante', 'Óleo Motor, Lubrificante Industrial', 'Shell', 'Multiviscoso', '20L', 'OL-202504-015'),
('rawMaterials', 'Fio Elétrico', 'Cabo Flexível, Fio de Cobre', 'Cobrecom', 'Cabo flexível', '2.5mm² x 100m', 'FE25-202507-020');

--- Equipamentos (equipments) ---
INSERT INTO items (itemType, name, aliases, brand, description, technicalSpecs, batchNumber) VALUES
('equipments', 'Avental Couro', 'Avental de Soldador, Avental de Proteção', 'Bracol', 'Para soldagem', 'Tamanho único', 'ACL-202502-021'),
('equipments', 'Capacete Segurança', 'Capacete de Obra, Capacete de Proteção', 'MSA', 'Com viseira', 'Classe B, Tipo II', 'CSC-202501-022'),
('equipments', 'Óculos Proteção', 'Óculos de Segurança, Óculos Epi', 'Libus', 'Transparente, anti-embaçante', 'Lente incolor', 'OPR-202411-023'),
('equipments', 'Máscara Respiratória', 'Máscara de Proteção, Respirador', '3M', 'Proteção PFF2', 'PFF2', 'MRS-202503-024'),
('equipments', 'Protetor Auricular Concha', 'Abafador de Ruído, Protetor de Ouvido', '3M', 'Tipo concha', '26 dB', 'PAC-202412-025');

--- Produtos (products) ---
INSERT INTO items (itemType, name, aliases, brand, description, technicalSpecs, batchNumber) VALUES
('products', 'Solvente Desengraxante', 'Limpa Peças, Removedor de Graxa', 'Quimisa', 'Industrial', '5L', 'SDI-202611-026'),
('products', 'Adesivo Epóxi', 'Cola Epóxi, Resina Epóxi', 'Loctite', 'Bicomponente', '500g', 'AEB-202510-027'),
('products', 'Tinta Spray', 'Tinta em Aerossol, Lata de Spray', 'Suvinil', 'Fosca, preta', '400ml', 'TSF-202705-028'),
('products', 'Graxa Multiuso', 'Graxa para Rolamentos, Graxa Lubrificante', 'Bardahl', 'Tubo de aplicação', '1kg', 'GMU-202608-029'),
('products', 'Kit Limpeza', 'Kit de Higienização, Kit de Manutenção', 'Wurth', 'Pincéis e panos', '5 peças', 'KLF-202507-030');

--- Diversos (diverses) ---
INSERT INTO items (itemType, name, aliases, brand, description, technicalSpecs, batchNumber) VALUES
('diverses', 'Pilhas AA', 'Baterias AA, Pilhas Alcalinas', 'Duracell', 'Alcalinas', '1.5V', 'P-AA-202801-001'),
('diverses', 'Canetas Marcadoras', 'Marcadores de Texto, Canetas de Quadro', 'Faber-Castell', 'Ponta fina', 'Ponta fina', 'CMF-202507-002'),
('diverses', 'Papel A4', 'Folha Sulfite, Papel Branco', 'Chamex', '75g/m²', '75g/m², Pacote 500 folhas', 'PA4-202506-003'),
('diverses', 'Fita Crepe', 'Fita de Pintor, Fita de Mascaramento', 'Adelbras', 'Uso geral', '24mm x 50m', 'FC-202507-004'),
('diverses', 'Óleo de Corte', 'Fluido de Corte, Óleo de Usinagem', 'Quimatic', 'Fluido de corte integral', '1L', 'OC-202612-005');

--- Inserir dados na tabela de inventário ---
INSERT INTO inventory (fkItemId, lotNumber, quantity, expirationDate, lastMaintenance, fkIdLocation) VALUES
(1, 'MRT-202501-001/0000', 15.0, NULL, '2025-01-10', 1),
(2, 'CFP-202411-002/0000', 30.0, NULL, '2024-11-20', 1),
(3, 'FDI-202506-003/0000', 5.0, NULL, '2025-06-01', 4),
(4, 'ALU-202503-004/0000', 20.0, NULL, '2025-03-15', 7),
(5, 'TRN-202412-005/0000', 10.0, NULL, '2024-12-05', 2),
(6, 'NVB-202504-006/0000', 8.0, NULL, '2025-04-20', 2),
(7, 'SCR-202506-007/0000', 3.0, NULL, '2025-06-15', 5),
(8, 'CG-202505-008/0000', 6.0, NULL, '2025-05-01', 10),
(9, 'RBD-202507-009/0000', 4.0, NULL, '2025-07-01', 4),
(10, 'ESM-202506-010/0000', 7.0, NULL, '2025-06-25', 6),
(11, 'PSX-202507-006/0000', 500.0, NULL, NULL, 7),
(12, 'PST-202507-007/0000', 450.0, NULL, NULL, 7),
(13, 'ARL-202507-008/0000', 600.0, NULL, NULL, 8),
(14, 'FSL-202610-009/0000', 25.0, '2026-10-01', NULL, 2),
(15, 'LVP-202507-010/0000', 100.0, NULL, NULL, 4),
(16, 'FVR-202506-011/0000', 35.0, NULL, NULL, 9),
(17, 'CBL-202507-012/0000', 15.0, NULL, NULL, 11),
(18, 'ABN-202507-013/0000', 200.0, NULL, NULL, 8),
(19, 'TDT-202702-014/0000', 50.0, '2027-02-15', NULL, 3),
(20, 'CEL-202507-015/0000', 75.0, NULL, NULL, 7),
(21, 'BF10-202507-001/0000', 50.0, NULL, NULL, 10),
(22, 'CA1-202506-005/0000', 20.0, NULL, NULL, 10),
(23, 'TA20-202505-010/0000', 30.0, NULL, NULL, 11),
(24, 'OL-202504-015/0000', 5.0, NULL, NULL, 5),
(25, 'FE25-202507-020/0000', 10.0, NULL, NULL, 11),
(26, 'BCB-202506-021/0000', 15.0, NULL, NULL, 12),
(27, 'LMA-202507-022/0000', 25.0, NULL, NULL, 12),
(28, 'BBL-202507-023/0000', 8.0, NULL, NULL, 10),
(29, 'ARI-202506-024/0000', 100.0, NULL, NULL, 12),
(30, 'TMA-202507-025/0000', 22.0, NULL, NULL, 11);

--- Inserir dados na tabela de transações ---
INSERT INTO transactions (fkIdUser, fkInventoryId, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES
(1, 3, 'OUT', -2.0, 5.0, 3.0, '2025-07-13 14:00:00'),
(2, 15, 'OUT', -20.0, 100.0, 80.0, '2025-07-13 14:05:00'),
(1, 1, 'IN', 5.0, 15.0, 20.0, '2025-07-13 14:20:00'),
(2, 17, 'OUT', -10.0, 15.0, 5.0, '2025-07-13 14:25:00'),
(1, 24, 'OUT', -3.0, 5.0, 2.0, '2025-07-13 14:30:00'),
(2, 2, 'OUT', -10.0, 30.0, 20.0, '2025-07-13 14:45:00'),
(1, 3, 'AJUST', 0.0, 3.0, 3.0, '2025-07-14 09:00:00'),
(2, 14, 'AJUST', -5.0, 25.0, 20.0, '2025-07-14 10:30:00'),
(1, 21, 'IN', 10.0, 50.0, 60.0, '2025-07-14 11:00:00');
