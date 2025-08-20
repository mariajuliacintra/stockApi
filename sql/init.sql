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

CREATE TABLE tool (
    idTool INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity INT NOT NULL DEFAULT 0,
    lastMaintenance DATE,
    batchNumber VARCHAR(255) NOT NULL UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE material (
    idMaterial INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE,
    batchNumber VARCHAR(255) NOT NULL UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE rawMaterial (
    idRawMaterial INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    batchNumber VARCHAR(255) NOT NULL UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE equipment (
    idEquipment INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity INT NOT NULL DEFAULT 0,
    batchNumber VARCHAR(255) NOT NULL UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE product (
    idProduct INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity INT NOT NULL DEFAULT 0,
    expirationDate DATE,
    batchNumber VARCHAR(255) NOT NULL UNIQUE,
    fkIdLocation INT,
    FOREIGN KEY (fkIdLocation) REFERENCES location(idLocation)
);

CREATE TABLE diverses (
    idDiverses INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    aliases VARCHAR(255) DEFAULT NULL,
    brand VARCHAR(255),
    description TEXT,
    technicalSpecs TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    expirationDate DATE,
    batchNumber VARCHAR(255) NOT NULL UNIQUE,
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
    transactionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

INSERT INTO location (place, code) VALUES
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
('João Silva', 'joao.silva@sp.senai.br', '$2a$12$pUpODOURw.nIEgqGiT4sNuPPoesLu.9rg4dTyikxPGOiyMQUDzVZu', 'manager'),
('Maria Santos', 'maria.santos@sp.senai.br', '$2a$12$2uLf6ov665mPZRu6gBA7oufMhTC2mowcXEkSKw4H8Pbq27XPDn3Ca', 'user');

INSERT INTO tool (name, aliases, brand, description, technicalSpecs, quantity, lastMaintenance, batchNumber, fkIdLocation) VALUES
('Martelo Unha', 'Martelo de Carpinteiro, Martelo Unha de Carpinteiro', 'Tramontina', 'Cabo de madeira', '500g', 15, '2025-01-10', 'MRT-202501-001', 1),
('Chave Fenda Philips', 'Chave Estrela, Chave Cruzada', 'Gedore', 'Ponta Philips', 'Ponta 6mm', 30, '2024-11-20', 'CFP-202411-002', 1),
('Furadeira Impacto', 'Martelete, Furadeira de Percussão', 'Bosch', 'Com Mandril', '700W, 127V', 5, '2025-06-01', 'FDI-202506-003', 4),
('Alicate Corte', 'Alicate de Universal, Alicate de Bico', 'Belzer', 'Cabo emborrachado', '8 polegadas', 20, '2025-03-15', 'ALU-202503-004', 7),
('Trena Medição', 'Fita Métrica, Fita de Medição', 'Starrett', 'Com trava automática', '5m', 10, '2024-12-05', 'TRN-202412-005', 2),
('Nível Bolha', 'Nível de Mão, Nível de Pedreiro', 'Lee Tool', '3 bolhas, Magnético', '40cm', 8, '2025-04-20', 'NVB-202504-006', 2),
('Serra Circular', 'Serra de Disco, Serra Elétrica', 'Makita', 'Lâmina de carboneto', '185mm', 3, '2025-06-15', 'SCR-202506-007', 5),
('Chave Grifo', 'Chave Inglesa, Chave de Cano', 'Sparta', 'Tipo Stillson', '12 polegadas', 6, '2025-05-01', 'CG-202505-008', 10),
('Rebitadeira', 'Rebitador, Alicate de Rebite', 'Vonder', 'Bico intercambiável', '2.4mm - 4.8mm', 4, '2025-07-01', 'RBD-202507-009', 4),
('Esmerilhadeira', 'Rebarbadora, Lixadeira', 'DeWalt', 'Disco diamantado', '850W, 4 1/2 Pol.', 7, '2025-06-25', 'ESM-202506-010', 6);

INSERT INTO material (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES
('Parafuso Sextavado', 'Parafuso Allen, Parafuso de Cabeça Hexagonal', 'Ciser', 'Aço carbono', 'M8 x 50mm', 500.0, NULL, 'PSX-202507-006', 7),
('Porca Sextavada', 'Porca Hexagonal, Porca de Aperto', 'Gerdau', 'Aço zincado', 'Rosca M8', 450.0, NULL, 'PST-202507-007', 7),
('Arruela Lisa', 'Arruela Plana, Arruela Simples', 'Votorantim', 'Aço galvanizado', 'M8, Diâmetro 16mm', 600.0, NULL, 'ARL-202507-008', 8),
('Fita Isolante', 'Fita Elétrica, Fita Isoladora', '3M', 'Antichamas, preta', '19mm x 20m', 25.0, '2026-10-01', 'FSL-202610-009', 2),
('Luvas Proteção', 'Luvas de Segurança, Luvas de Trabalho', 'Danny', 'Luva de proteção', 'Tamanho G', 100.0, NULL, 'LVP-202507-010', 4),
('Fita Veda Rosca', 'Fita de Teflon, Fita de Vedação', 'Tigre', 'PTFE', '18mm x 10m', 35.0, NULL, 'FVR-202506-011', 9),
('Cabo Aço', 'Corda de Aço, Cabo de Aço Trançado', 'Sideraço', 'Aço galvanizado', '3mm x 50m', 15.0, NULL, 'CBL-202507-012', 11),
('Abraçadeira Nylon', 'Abraçadeira Plástica, Enforca Gato', 'HellermannTyton', 'Autotravante, branca', '4.8mm x 200mm', 200.0, NULL, 'ABN-202507-013', 8),
('Tinta Demarcação', 'Tinta de Sinalização, Spray de Marcação', 'Coral', 'Amarela, spray', '400ml', 50.0, '2027-02-15', 'TDT-202702-014', 3),
('Conector Elétrico', 'Borne Elétrico, Conector de Fios', 'Wago', 'Automático', '3 vias', 75.0, NULL, 'CEL-202507-015', 7);

INSERT INTO rawMaterial (name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation) VALUES
('Barra de Ferro Redonda', 'Vergalhão, Ferro Redondo', 'ArcelorMittal', 'Aço carbono', '10mm x 6m', 50.0, 'BF10-202507-001', 10),
('Chapa de Aço Carbono', 'Chapa de Metal, Folha de Aço', 'Usiminas', 'Laminação a frio', '1mm x 1m x 2m', 20.0, 'CA1-202506-005', 10),
('Tubo de Alumínio', 'Perfil de Alumínio, Cano de Alumínio', 'Alcoa', 'Liga de Alumínio', '20mm x 3m', 30.0, 'TA20-202505-010', 11),
('Óleo Lubrificante', 'Óleo Motor, Lubrificante Industrial', 'Shell', 'Multiviscoso', '20L', 5.0, 'OL-202504-015', 5),
('Fio Elétrico', 'Cabo Flexível, Fio de Cobre', 'Cobrecom', 'Cabo flexível', '2.5mm² x 100m', 10.0, 'FE25-202507-020', 11),
('Bobina Cobre', 'Fio de Cobre Esmaltado, Fio de Bobinagem', 'Paranapanema', 'Fio esmaltado', '1.5mm', 15.0, 'BCB-202506-021', 12),
('Lâmina de Acrílico', 'Chapa de Acrílico, Folha de Acrílico', 'Cast Acrylic', 'Transparente', '2mm x 1.2m x 2.4m', 25.0, 'LMA-202507-022', 12),
('Bloco Borracha', 'Bloco de Vedação, Calço de Borracha', 'Rubber Brasil', 'Borracha sintética', '500mm x 500mm x 50mm', 8.0, 'BBL-202507-023', 10),
('Areia Industrial', 'Areia de Fundição, Areia de Construção', 'Mineradora Delta', 'Granulometria fina', '25kg', 100.0, 'ARI-202506-024', 12),
('Tinta Marcenaria', 'Tinta para Madeira, Verniz', 'Montana', 'Branca, galão', '3.6L', 22.0, 'TMA-202507-025', 11);

INSERT INTO equipment (name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation) VALUES
('Avental Couro', 'Avental de Soldador, Avental de Proteção', 'Bracol', 'Para soldagem', 'Tamanho único', 8, 'ACL-202502-021', 4),
('Capacete Segurança', 'Capacete de Obra, Capacete de Proteção', 'MSA', 'Com viseira', 'Classe B, Tipo II', 12, 'CSC-202501-022', 4),
('Óculos Proteção', 'Óculos de Segurança, Óculos Epi', 'Libus', 'Transparente, anti-embaçante', 'Lente incolor', 50, 'OPR-202411-023', 5),
('Máscara Respiratória', 'Máscara de Proteção, Respirador', '3M', 'Proteção PFF2', 'PFF2', 30, 'MRS-202503-024', 5),
('Protetor Auricular Concha', 'Abafador de Ruído, Protetor de Ouvido', '3M', 'Tipo concha', '26 dB', 25, 'PAC-202412-025', 5),
('Luva de Raspa', 'Luva de Solda, Luva de Couro', 'Promat', 'Punho 20cm', 'Tamanho G, Punho 20cm', 15, 'LDR-202507-026', 6),
('Cinto Segurança', 'Cinto de Proteção, Cinto de Paraquedista', '3M', 'Paraquedista', '3 pontos de ancoragem', 5, 'CSG-202506-027', 6),
('Abafador Ruído', 'Protetor Auricular de Concha, Fone Abafador', 'Danny', 'Arco ajustável', '30 dB', 18, 'AR-202505-028', 4),
('Cinto Ferramentas', 'Cinto de Utilidades, Cinto Porta-Ferramentas', 'Vonder', 'Lona reforçada', '12 bolsos', 9, 'CF-202504-029', 9),
('Mangueira Ar Comprimido', 'Mangueira Pneumática, Mangueira de Compressor', 'Macom', 'PVC com tela', '10m, Diâmetro 3/8"', 11, 'MAC-202507-030', 6);

INSERT INTO product (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES
('Solvente Desengraxante', 'Limpa Peças, Removedor de Graxa', 'Quimisa', 'Industrial', '5L', 20, '2026-11-01', 'SDI-202611-026', 10),
('Adesivo Epóxi', 'Cola Epóxi, Resina Epóxi', 'Loctite', 'Bicomponente', '500g', 15, '2025-10-15', 'AEB-202510-027', 8),
('Tinta Spray', 'Tinta em Aerossol, Lata de Spray', 'Suvinil', 'Fosca, preta', '400ml', 30, '2027-05-20', 'TSF-202705-028', 1),
('Graxa Multiuso', 'Graxa para Rolamentos, Graxa Lubrificante', 'Bardahl', 'Tubo de aplicação', '1kg', 10, '2026-08-01', 'GMU-202608-029', 11),
('Kit Limpeza', 'Kit de Higienização, Kit de Manutenção', 'Wurth', 'Pincéis e panos', '5 peças', 5, NULL, 'KLF-202507-030', 4),
('Desmoldante', 'Agente Desmoldante, Spray de Silicone', 'Tekbond', 'Spray de silicone', '300ml', 12, '2027-03-01', 'DSV-202703-031', 12),
('Limpa Contato', 'Limpa Componentes Eletrônicos, Desoxidante', 'Loctite', 'Eletrônico', '250ml', 25, '2026-12-10', 'LCE-202612-032', 3),
('Selante Acrílico', 'Calafetador, Massa de Vedação', 'Sika', 'Branco, calafetagem', '500g', 18, '2026-09-05', 'SAC-202609-033', 9),
('Massa Calafetar', 'Massa de Vedação, Calafetagem', 'Viapol', 'Vedação', '1kg', 8, NULL, 'MCA-202507-034', 10),
('Fita Dupla Face', 'Fita Adesiva, Fita de Fixação', '3M', 'Forte fixação', '12mm x 20m', 22, NULL, 'FDF-202507-035', 2);

INSERT INTO diverses (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES
('Pilhas AA', 'Baterias AA, Pilhas Alcalinas', 'Duracell', 'Alcalinas', '1.5V', 40.0, '2028-01-01', 'P-AA-202801-001', 7),
('Canetas Marcadoras', 'Marcadores de Texto, Canetas de Quadro', 'Faber-Castell', 'Ponta fina', 'Ponta fina', 12.0, NULL, 'CMF-202507-002', 8),
('Papel A4', 'Folha Sulfite, Papel Branco', 'Chamex', '75g/m²', '75g/m², Pacote 500 folhas', 5.0, NULL, 'PA4-202506-003', 1),
('Fita Crepe', 'Fita de Pintor, Fita de Mascaramento', 'Adelbras', 'Uso geral', '24mm x 50m', 18.0, NULL, 'FC-202507-004', 2),
('Óleo de Corte', 'Fluido de Corte, Óleo de Usinagem', 'Quimatic', 'Fluido de corte integral', '1L', 7.0, '2026-12-31', 'OC-202612-005', 11),
('Cola Branca', 'Cola de Madeira, Cola Pva', 'Cascola', 'Extra forte', '500g', 10.0, '2027-04-15', 'CB-202704-006', 9),
('Limpador Multiuso', 'Produto de Limpeza, Desinfetante', 'Veja', 'Gatilho', '500ml', 25.0, '2026-10-01', 'LM-202610-007', 3),
('Saco de Lixo', 'Saco de Resíduos, Saco de Entulho', 'Embalixo', 'Reforçado, 100L', '100L', 50.0, NULL, 'SLR-202507-008', 12),
('Cartuchos de Tinta', 'Refil de Tinta, Toner', 'HP', 'Preto e colorido', 'Modelo 664', 3.0, '2027-02-20', 'CT-202702-009', 10),
('Esponja de Limpeza', 'Esponja de Lavar, Esponja Abrasiva', '3M', 'Dupla face', '10cm x 15cm', 30.0, NULL, 'EL-202507-010', 4);

INSERT INTO transactions (fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES
(1, 'tool', 1, 'IN', 15, 0, 15),
(1, 'tool', 2, 'IN', 30, 0, 30),
(1, 'tool', 3, 'IN', 5, 0, 5),
(1, 'tool', 4, 'IN', 20, 0, 20),
(1, 'tool', 5, 'IN', 10, 0, 10),
(1, 'tool', 6, 'IN', 8, 0, 8),
(1, 'tool', 7, 'IN', 3, 0, 3),
(1, 'tool', 8, 'IN', 6, 0, 6),
(1, 'tool', 9, 'IN', 4, 0, 4),
(1, 'tool', 10, 'IN', 7, 0, 7),
(1, 'material', 1, 'IN', 500.0, 0.0, 500.0),
(1, 'material', 2, 'IN', 450.0, 0.0, 450.0),
(1, 'material', 3, 'IN', 600.0, 0.0, 600.0),
(1, 'material', 4, 'IN', 25.0, 0.0, 25.0),
(1, 'material', 5, 'IN', 100.0, 0.0, 100.0),
(1, 'material', 6, 'IN', 35.0, 0.0, 35.0),
(1, 'material', 7, 'IN', 15.0, 0.0, 15.0),
(1, 'material', 8, 'IN', 200.0, 0.0, 200.0),
(1, 'material', 9, 'IN', 50.0, 0.0, 50.0),
(1, 'material', 10, 'IN', 75.0, 0.0, 75.0),
(1, 'rawMaterial', 1, 'IN', 50.0, 0.0, 50.0),
(1, 'rawMaterial', 2, 'IN', 20.0, 0.0, 20.0),
(1, 'rawMaterial', 3, 'IN', 30.0, 0.0, 30.0),
(1, 'rawMaterial', 4, 'IN', 5.0, 0.0, 5.0),
(1, 'rawMaterial', 5, 'IN', 10.0, 0.0, 10.0),
(1, 'rawMaterial', 6, 'IN', 15.0, 0.0, 15.0),
(1, 'rawMaterial', 7, 'IN', 25.0, 0.0, 25.0),
(1, 'rawMaterial', 8, 'IN', 8.0, 0.0, 8.0),
(1, 'rawMaterial', 9, 'IN', 100.0, 0.0, 100.0),
(1, 'rawMaterial', 10, 'IN', 22.0, 0.0, 22.0),
(1, 'equipment', 1, 'IN', 8, 0, 8),
(1, 'equipment', 2, 'IN', 12, 0, 12),
(1, 'equipment', 3, 'IN', 50, 0, 50),
(1, 'equipment', 4, 'IN', 30, 0, 30),
(1, 'equipment', 5, 'IN', 25, 0, 25),
(1, 'equipment', 6, 'IN', 15, 0, 15),
(1, 'equipment', 7, 'IN', 5, 0, 5),
(1, 'equipment', 8, 'IN', 18, 0, 18),
(1, 'equipment', 9, 'IN', 9, 0, 9),
(1, 'equipment', 10, 'IN', 11, 0, 11),
(1, 'product', 1, 'IN', 20, 0, 20),
(1, 'product', 2, 'IN', 15, 0, 15),
(1, 'product', 3, 'IN', 30, 0, 30),
(1, 'product', 4, 'IN', 10, 0, 10),
(1, 'product', 5, 'IN', 5, 0, 5),
(1, 'product', 6, 'IN', 12, 0, 12),
(1, 'product', 7, 'IN', 25, 0, 25),
(1, 'product', 8, 'IN', 18, 0, 18),
(1, 'product', 9, 'IN', 8, 0, 8),
(1, 'product', 10, 'IN', 22, 0, 22),
(1, 'diverses', 1, 'IN', 40.0, 0.0, 40.0),
(1, 'diverses', 2, 'IN', 12.0, 0.0, 12.0),
(1, 'diverses', 3, 'IN', 5.0, 0.0, 5.0),
(1, 'diverses', 4, 'IN', 18.0, 0.0, 18.0),
(1, 'diverses', 5, 'IN', 7.0, 0.0, 7.0),
(1, 'diverses', 6, 'IN', 10.0, 0.0, 10.0),
(1, 'diverses', 7, 'IN', 25.0, 0.0, 25.0),
(1, 'diverses', 8, 'IN', 50.0, 0.0, 50.0),
(1, 'diverses', 9, 'IN', 3.0, 0.0, 3.0),
(1, 'diverses', 10, 'IN', 30.0, 0.0, 30.0);
