-- Cria o banco de dados 'stock' se ele não existir
CREATE DATABASE IF NOT EXISTS stock;
USE stock;

-- Exclui tabelas na ordem correta para evitar erros de chaves estrangeiras
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS toolLots;
DROP TABLE IF EXISTS materialLots;
DROP TABLE IF EXISTS rawMaterialLots;
DROP TABLE IF EXISTS equipmentLots;
DROP TABLE IF EXISTS productLots;
DROP TABLE IF EXISTS diversesLots;
DROP TABLE IF EXISTS tool;
DROP TABLE IF EXISTS material;
DROP TABLE IF EXISTS rawMaterial;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS diverses;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS location;

-- Tabela para armazenar informações de localização
CREATE TABLE location (
    idLocation INT PRIMARY KEY AUTO_INCREMENT,
    place VARCHAR(255) NOT NULL,
    locationCode VARCHAR(255) NOT NULL,
    UNIQUE(place, locationCode)
);

-- Tabela de usuários com as colunas createdAt e updatedAt adicionadas
CREATE TABLE user (
    idUser INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashedPassword VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('user', 'manager')),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela para ferramentas
CREATE TABLE tool (
    idTool INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

-- Tabela para lotes de ferramentas
CREATE TABLE toolLots (
    idToolLots INT PRIMARY KEY AUTO_INCREMENT,
    quantity INT NOT NULL DEFAULT 0,
    lastMaintenance DATE,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdTool INT NOT NULL,
    FOREIGN KEY (fkIdTool) REFERENCES tool(idTool)
);

-- Tabela para materiais
CREATE TABLE material (
    idMaterial INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

-- Tabela para lotes de materiais
CREATE TABLE materialLots (
    idMaterialLots INT PRIMARY KEY AUTO_INCREMENT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdMaterial INT NOT NULL,
    FOREIGN KEY (fkIdMaterial) REFERENCES material(idMaterial)
);

-- Tabela para matérias-primas
CREATE TABLE rawMaterial (
    idRawMaterial INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

-- Tabela para lotes de matérias-primas
CREATE TABLE rawMaterialLots (
    idRawMaterialLots INT PRIMARY KEY AUTO_INCREMENT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdRawMaterial INT NOT NULL,
    FOREIGN KEY (fkIdRawMaterial) REFERENCES rawMaterial(idRawMaterial)
);

-- Tabela para equipamentos
CREATE TABLE equipment (
    idEquipment INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idEquipment)
);

-- Tabela para lotes de equipamentos
CREATE TABLE equipmentLots (
    idEquipmentLots INT PRIMARY KEY AUTO_INCREMENT,
    quantity INT NOT NULL DEFAULT 0,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdEquipment INT NOT NULL,
    FOREIGN KEY (fkIdEquipment) REFERENCES equipment(idEquipment)
);

-- Tabela para produtos
CREATE TABLE product (
    idProduct INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idProduct)
);

-- Tabela para lotes de produtos
CREATE TABLE productLots (
    idProductLots INT PRIMARY KEY AUTO_INCREMENT,
    quantity INT NOT NULL DEFAULT 0,
    expirationDate DATE,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdProduct INT NOT NULL,
    FOREIGN KEY (fkIdProduct) REFERENCES product(idProduct)
);

-- Tabela para itens diversos
CREATE TABLE diverses (
    idDiverses INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idDiverses)
);

-- Tabela para lotes de itens diversos
CREATE TABLE diversesLots (
    idDiversesLots INT PRIMARY KEY AUTO_INCREMENT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE,
    batchNumber VARCHAR(255) UNIQUE,
    fkIdDiverses INT NOT NULL,
    FOREIGN KEY (fkIdDiverses) REFERENCES diverses(idDiverses)
);

-- Tabela para transações de estoque, agora referenciando os lotes
CREATE TABLE transactions (
    idTransaction INT PRIMARY KEY AUTO_INCREMENT,
    fkIdUser INT NOT NULL,
    itemType VARCHAR(255) NOT NULL,
    itemId INT NOT NULL, -- Agora refere-se ao id do lote
    actionDescription ENUM('IN', 'OUT', 'AJUST') NOT NULL,
    quantityChange DECIMAL(10, 2) NOT NULL,
    oldQuantity DECIMAL(10, 2),
    newQuantity DECIMAL(10, 2),
    transactionDate DATETIME NOT NULL,
    FOREIGN KEY (fkIdUser) REFERENCES user(idUser)
);

-- Índices para otimizar consultas
CREATE INDEX idxToolName ON tool(name);
CREATE INDEX idxToolFkIdLocation ON tool(fkIdLocation);
CREATE INDEX idxToolLotsFkIdTool ON toolLots(fkIdTool);
CREATE INDEX idxMaterialName ON material(name);
CREATE INDEX idxMaterialFkIdLocation ON material(fkIdLocation);
CREATE INDEX idxMaterialLotsFkIdMaterial ON materialLots(fkIdMaterial);
CREATE INDEX idxRawMaterialName ON rawMaterial(name);
CREATE INDEX idxRawMaterialFkIdLocation ON rawMaterial(fkIdLocation);
CREATE INDEX idxRawMaterialLotsFkIdRawMaterial ON rawMaterialLots(fkIdRawMaterial);
CREATE INDEX idxEquipmentName ON equipment(name);
CREATE INDEX idxEquipmentFkIdLocation ON equipment(fkIdLocation);
CREATE INDEX idxEquipmentLotsFkIdEquipment ON equipmentLots(fkIdEquipment);
CREATE INDEX idxProductName ON product(name);
CREATE INDEX idxProductFkIdLocation ON product(fkIdLocation);
CREATE INDEX idxProductLotsFkIdProduct ON productLots(fkIdProduct);
CREATE INDEX idxDiversesName ON diverses(name);
CREATE INDEX idxDiversesFkIdLocation ON diverses(fkIdLocation);
CREATE INDEX idxDiversesLotsFkIdDiverses ON diversesLots(fkIdDiverses);
CREATE INDEX idxUserRole ON user(role);
CREATE INDEX idxTransactionsFkIdUser ON transactions(fkIdUser);
CREATE INDEX idxTransactionsDate ON transactions(transactionDate);
CREATE INDEX idxTransactionsAction ON transactions(actionDescription);
CREATE INDEX idxTransactionsItem ON transactions(itemType, itemId);

-- Inserção de dados nas tabelas principais
INSERT INTO location (place, locationCode) VALUES
('Prateleira', 'A1'), ('Prateleira', 'A2'), ('Prateleira', 'A3'),
('Armário', 'B1'), ('Armário', 'B2'), ('Armário', 'B3'),
('Gaveta', 'C1'), ('Gaveta', 'C2'), ('Gaveta', 'C3'),
('Depósito', 'D1'), ('Depósito', 'D2'), ('Depósito', 'D3');

INSERT INTO user (name, email, hashedPassword, role) VALUES
('João Silva', 'joao.silva@sp.senai.br', '$2a$12$pUpODOURw.nIEgqGiT4sNuPPoesLu.9rg4dTyikxPGOiyMQUDzVZu', 'manager'),
('Maria Santos', 'maria.santos@sp.senai.br', '$2a$12$2uLf6ov665mPZRu6gBA7oufMhTC2mowcXEkSKw4H8Pbq27XPDn3Ca', 'user');

INSERT INTO tool (name, aliases, brand, description, technicalSpecs, fkIdLocation) VALUES
('Martelo Unha', 'Martelo de Carpinteiro, Martelo Unha de Carpinteiro', 'Tramontina', 'Cabo de madeira', '500g', 1),
('Chave Fenda Philips', 'Chave Estrela, Chave Cruzada', 'Gedore', 'Ponta Philips', 'Ponta 6mm', 1),
('Furadeira Impacto', 'Martelete, Furadeira de Percussão', 'Bosch', 'Com Mandril', '700W, 127V', 4),
('Alicate Corte', 'Alicate de Universal, Alicate de Bico', 'Belzer', 'Cabo emborrachado', '8 polegadas', 7),
('Trena Medição', 'Fita Métrica, Fita de Medição', 'Starrett', 'Com trava automática', '5m', 2),
('Nível Bolha', 'Nível de Mão, Nível de Pedreiro', 'Lee Tool', '3 bolhas, Magnético', '40cm', 2),
('Serra Circular', 'Serra de Disco, Serra Elétrica', 'Makita', 'Lâmina de carboneto', '185mm', 5),
('Chave Grifo', 'Chave Inglesa, Chave de Cano', 'Sparta', 'Tipo Stillson', '12 polegadas', 10),
('Rebitadeira', 'Rebitador, Alicate de Rebite', 'Vonder', 'Bico intercambiável', '2.4mm - 4.8mm', 4),
('Esmerilhadeira', 'Rebarbadora, Lixadeira', 'DeWalt', 'Disco diamantado', '850W, 4 1/2 Pol.', 6);

INSERT INTO material (name, aliases, brand, description, technicalSpecs, fkIdLocation) VALUES
('Parafuso Sextavado', 'Parafuso Allen, Parafuso de Cabeça Hexagonal', 'Ciser', 'Aço carbono', 'M8 x 50mm', 7),
('Porca Sextavada', 'Porca Hexagonal, Porca de Aperto', 'Gerdau', 'Aço zincado', 'Rosca M8', 7),
('Arruela Lisa', 'Arruela Plana, Arruela Simples', 'Votorantim', 'Aço galvanizado', 'M8, Diâmetro 16mm', 8),
('Fita Isolante', 'Fita Elétrica, Fita Isoladora', '3M', 'Antichamas, preta', '19mm x 20m', 2),
('Luvas Proteção', 'Luvas de Segurança, Luvas de Trabalho', 'Danny', 'Luva de proteção', 'Tamanho G', 4),
('Fita Veda Rosca', 'Fita de Teflon, Fita de Vedação', 'Tigre', 'PTFE', '18mm x 10m', 9),
('Cabo Aço', 'Corda de Aço, Cabo de Aço Trançado', 'Sideraço', 'Aço galvanizado', '3mm x 50m', 11),
('Abraçadeira Nylon', 'Abraçadeira Plástica, Enforca Gato', 'HellermannTyton', 'Autotravante, branca', '4.8mm x 200mm', 8),
('Tinta Demarcação', 'Tinta de Sinalização, Spray de Marcação', 'Coral', 'Amarela, spray', '400ml', 3),
('Conector Elétrico', 'Borne Elétrico, Conector de Fios', 'Wago', 'Automático', '3 vias', 7);

INSERT INTO rawMaterial (name, aliases, brand, description, technicalSpecs, fkIdLocation) VALUES
('Barra de Ferro Redonda', 'Vergalhão, Ferro Redondo', 'ArcelorMittal', 'Aço carbono', '10mm x 6m', 10),
('Chapa de Aço Carbono', 'Chapa de Metal, Folha de Aço', 'Usiminas', 'Laminação a frio', '1mm x 1m x 2m', 10),
('Tubo de Alumínio', 'Perfil de Alumínio, Cano de Alumínio', 'Alcoa', 'Liga de Alumínio', '20mm x 3m', 11),
('Óleo Lubrificante', 'Óleo Motor, Lubrificante Industrial', 'Shell', 'Multiviscoso', '20L', 5),
('Fio Elétrico', 'Cabo Flexível, Fio de Cobre', 'Cobrecom', 'Cabo flexível', '2.5mm² x 100m', 11),
('Bobina Cobre', 'Fio de Cobre Esmaltado, Fio de Bobinagem', 'Paranapanema', 'Fio esmaltado', '1.5mm', 12),
('Lâmina de Acrílico', 'Chapa de Acrílico, Folha de Acrílico', 'Cast Acrylic', 'Transparente', '2mm x 1.2m x 2.4m', 12),
('Bloco Borracha', 'Bloco de Vedação, Calço de Borracha', 'Rubber Brasil', 'Borracha sintética', '500mm x 500mm x 50mm', 10),
('Areia Industrial', 'Areia de Fundição, Areia de Construção', 'Mineradora Delta', 'Granulometria fina', '25kg', 12),
('Tinta Marcenaria', 'Tinta para Madeira, Verniz', 'Montana', 'Branca, galão', '3.6L', 11);

INSERT INTO equipment (name, aliases, brand, description, technicalSpecs, fkIdLocation) VALUES
('Avental Couro', 'Avental de Soldador, Avental de Proteção', 'Bracol', 'Para soldagem', 'Tamanho único', 4),
('Capacete Segurança', 'Capacete de Obra, Capacete de Proteção', 'MSA', 'Com viseira', 'Classe B, Tipo II', 4),
('Óculos Proteção', 'Óculos de Segurança, Óculos Epi', 'Libus', 'Transparente, anti-embaçante', 'Lente incolor', 5),
('Máscara Respiratória', 'Máscara de Proteção, Respirador', '3M', 'Proteção PFF2', 'PFF2', 5),
('Protetor Auricular Concha', 'Abafador de Ruído, Protetor de Ouvido', '3M', 'Tipo concha', '26 dB', 5),
('Luva de Raspa', 'Luva de Solda, Luva de Couro', 'Promat', 'Punho 20cm', 'Tamanho G, Punho 20cm', 6),
('Cinto Segurança', 'Cinto de Proteção, Cinto de Paraquedista', '3M', 'Paraquedista', '3 pontos de ancoragem', 6),
('Abafador Ruído', 'Protetor Auricular de Concha, Fone Abafador', 'Danny', 'Arco ajustável', '30 dB', 4),
('Cinto Ferramentas', 'Cinto de Utilidades, Cinto Porta-Ferramentas', 'Vonder', 'Lona reforçada', '12 bolsos', 9),
('Mangueira Ar Comprimido', 'Mangueira Pneumática, Mangueira de Compressor', 'Macom', 'PVC com tela', '10m, Diâmetro 3/8"', 6);

INSERT INTO product (name, aliases, brand, description, technicalSpecs, fkIdLocation) VALUES
('Solvente Desengraxante', 'Limpa Peças, Removedor de Graxa', 'Quimisa', 'Industrial', '5L', 10),
('Adesivo Epóxi', 'Cola Epóxi, Resina Epóxi', 'Loctite', 'Bicomponente', '500g', 8),
('Tinta Spray', 'Tinta em Aerossol, Lata de Spray', 'Suvinil', 'Fosca, preta', '400ml', 1),
('Graxa Multiuso', 'Graxa para Rolamentos, Graxa Lubrificante', 'Bardahl', 'Tubo de aplicação', '1kg', 11),
('Kit Limpeza', 'Kit de Higienização, Kit de Manutenção', 'Wurth', 'Pincéis e panos', '5 peças', 4),
('Desmoldante', 'Agente Desmoldante, Spray de Silicone', 'Tekbond', 'Spray de silicone', '300ml', 12),
('Limpa Contato', 'Limpa Componentes Eletrônicos, Desoxidante', 'Loctite', 'Eletrônico', '250ml', 3),
('Selante Acrílico', 'Calafetador, Massa de Vedação', 'Sika', 'Branco, calafetagem', '500g', 9),
('Massa Calafetar', 'Massa de Vedação, Calafetagem', 'Viapol', 'Vedação', '1kg', 10),
('Fita Dupla Face', 'Fita Adesiva, Fita de Fixação', '3M', 'Forte fixação', '12mm x 20m', 2);

INSERT INTO diverses (name, aliases, brand, description, technicalSpecs, fkIdLocation) VALUES
('Pilhas AA', 'Baterias AA, Pilhas Alcalinas', 'Duracell', 'Alcalinas', '1.5V', 7),
('Canetas Marcadoras', 'Marcadores de Texto, Canetas de Quadro', 'Faber-Castell', 'Ponta fina', 'Ponta fina', 8),
('Papel A4', 'Folha Sulfite, Papel Branco', 'Chamex', '75g/m²', '75g/m², Pacote 500 folhas', 1),
('Fita Crepe', 'Fita de Pintor, Fita de Mascaramento', 'Adelbras', 'Uso geral', '24mm x 50m', 2),
('Óleo de Corte', 'Fluido de Corte, Óleo de Usinagem', 'Quimatic', 'Fluido de corte integral', '1L', 11),
('Cola Branca', 'Cola de Madeira, Cola Pva', 'Cascola', 'Extra forte', '500g', 9),
('Limpador Multiuso', 'Produto de Limpeza, Desinfetante', 'Veja', 'Gatilho', '500ml', 3),
('Saco de Lixo', 'Saco de Resíduos, Saco de Entulho', 'Embalixo', 'Reforçado, 100L', '100L', 12),
('Cartuchos de Tinta', 'Refil de Tinta, Toner', 'HP', 'Preto e colorido', 'Modelo 664', 10),
('Esponja de Limpeza', 'Esponja de Lavar, Esponja Abrasiva', '3M', 'Dupla face', '10cm x 15cm', 4);

-- Inserção de dados nas tabelas de lote (agora com fk do item principal)
INSERT INTO toolLots (fkIdTool, quantity, lastMaintenance, batchNumber) VALUES
(1, 15, '2025-01-10', 'MRT-202501-001'),
(2, 30, '2024-11-20', 'CFP-202411-002'),
(3, 5, '2025-06-01', 'FDI-202506-003'),
(4, 20, '2025-03-15', 'ALU-202503-004'),
(5, 10, '2024-12-05', 'TRN-202412-005'),
(6, 8, '2025-04-20', 'NVB-202504-006'),
(7, 3, '2025-06-15', 'SCR-202506-007'),
(8, 6, '2025-05-01', 'CG-202505-008'),
(9, 4, '2025-07-01', 'RBD-202507-009'),
(10, 7, '2025-06-25', 'ESM-202506-010');

INSERT INTO materialLots (fkIdMaterial, quantity, expirationDate, batchNumber) VALUES
(1, 500.0, NULL, 'PSX-202507-006'),
(2, 450.0, NULL, 'PST-202507-007'),
(3, 600.0, NULL, 'ARL-202507-008'),
(4, 25.0, '2026-10-01', 'FSL-202610-009'),
(5, 100.0, NULL, 'LVP-202507-010'),
(6, 35.0, NULL, 'FVR-202506-011'),
(7, 15.0, NULL, 'CBL-202507-012'),
(8, 200.0, NULL, 'ABN-202507-013'),
(9, 50.0, '2027-02-15', 'TDT-202702-014'),
(10, 75.0, NULL, 'CEL-202507-015');

INSERT INTO rawMaterialLots (fkIdRawMaterial, quantity, batchNumber) VALUES
(1, 50.0, 'BF10-202507-001'),
(2, 20.0, 'CA1-202506-005'),
(3, 30.0, 'TA20-202505-010'),
(4, 5.0, 'OL-202504-015'),
(5, 10.0, 'FE25-202507-020'),
(6, 15.0, 'BCB-202506-021'),
(7, 25.0, 'LMA-202507-022'),
(8, 8.0, 'BBL-202507-023'),
(9, 100.0, 'ARI-202506-024'),
(10, 22.0, 'TMA-202507-025');

INSERT INTO equipmentLots (fkIdEquipment, quantity, batchNumber) VALUES
(1, 8, 'ACL-202502-021'),
(2, 12, 'CSC-202501-022'),
(3, 50, 'OPR-202411-023'),
(4, 30, 'MRS-202503-024'),
(5, 25, 'PAC-202412-025'),
(6, 15, 'LDR-202507-026'),
(7, 5, 'CSG-202506-027'),
(8, 18, 'AR-202505-028'),
(9, 9, 'CF-202504-029'),
(10, 11, 'MAC-202507-030');

INSERT INTO productLots (fkIdProduct, quantity, expirationDate, batchNumber) VALUES
(1, 20, '2026-11-01', 'SDI-202611-026'),
(2, 15, '2025-10-15', 'AEB-202510-027'),
(3, 30, '2027-05-20', 'TSF-202705-028'),
(4, 10, '2026-08-01', 'GMU-202608-029'),
(5, 5, NULL, 'KLF-202507-030'),
(6, 12, '2027-03-01', 'DSV-202703-031'),
(7, 25, '2026-12-10', 'LCE-202612-032'),
(8, 18, '2026-09-05', 'SAC-202609-033'),
(9, 8, NULL, 'MCA-202507-034'),
(10, 22, NULL, 'FDF-202507-035');

INSERT INTO diversesLots (fkIdDiverses, quantity, expirationDate, batchNumber) VALUES
(1, 40.0, '2028-01-01', 'P-AA-202801-001'),
(2, 12.0, NULL, 'CMF-202507-002'),
(3, 5.0, NULL, 'PA4-202506-003'),
(4, 18.0, NULL, 'FC-202507-004'),
(5, 7.0, '2026-12-31', 'OC-202612-005'),
(6, 10.0, '2027-04-15', 'CB-202704-006'),
(7, 25.0, '2026-10-01', 'LM-202610-007'),
(8, 50.0, NULL, 'SLR-202507-008'),
(9, 3.0, '2027-02-20', 'CT-202702-009'),
(10, 30.0, NULL, 'EL-202507-010');

-- Inserção de dados nas transações, agora referenciando os IDs dos lotes
INSERT INTO transactions (fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES
(1, 'toolLots', 3, 'OUT', -2, 5, 3, '2025-07-13 14:00:00'),
(2, 'materialLots', 5, 'OUT', -20.0, 100.0, 80.0, '2025-07-13 14:05:00'),
(1, 'equipmentLots', 1, 'OUT', -1, 8, 7, '2025-07-13 14:10:00'),
(2, 'productLots', 2, 'OUT', -5, 15, 10, '2025-07-13 14:15:00'),
(1, 'toolLots', 1, 'IN', 5, 15, 20, '2025-07-13 14:20:00'),
(2, 'materialLots', 7, 'OUT', -10.0, 15.0, 5.0, '2025-07-13 14:25:00'),
(1, 'rawMaterialLots', 4, 'OUT', -3.0, 5.0, 2.0, '2025-07-13 14:30:00'),
(2, 'equipmentLots', 3, 'IN', 10, 50, 60, '2025-07-13 14:35:00'),
(1, 'productLots', 1, 'OUT', -3, 20, 17, '2025-07-13 14:40:00'),
(2, 'toolLots', 2, 'OUT', -10, 30, 20, '2025-07-13 14:45:00'),
(1, 'toolLots', 3, 'AJUST', 0, 3, 3, '2025-07-14 09:00:00'),
(2, 'materialLots', 4, 'AJUST', -5.0, 25.0, 20.0, '2025-07-14 10:30:00'),
(1, 'rawMaterialLots', 1, 'IN', 10.0, 50.0, 60.0, '2025-07-14 11:00:00'),
(2, 'productLots', 5, 'IN', 5, 0, 5, '2025-07-14 12:00:00');
