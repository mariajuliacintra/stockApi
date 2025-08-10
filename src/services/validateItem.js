const itemValidators = {};

function validateBaseFields(data) {
  if (!data.name || data.name.trim().length === 0) {
    return { success: false, message: 'O nome é obrigatório.' };
  }
  if (typeof data.name !== 'string' || data.name.trim().length < 3 || data.name.trim().length > 255) {
    return { success: false, message: 'O nome deve ser um texto entre 3 e 255 caracteres.' };
  }
  if (!data.fkIdLocation) {
    return { success: false, message: 'A localização (fkIdLocation) é obrigatória.' };
  }
  if (typeof data.fkIdLocation !== 'number' || !Number.isInteger(data.fkIdLocation) || data.fkIdLocation <= 0) {
    return { success: false, message: 'A localização deve ser um ID de número inteiro positivo.' };
  }
  if (!data.fkIdUser) {
    return { success: false, message: 'O usuário (fkIdUser) é obrigatório.' };
  }
  if (typeof data.fkIdUser !== 'number' || !Number.isInteger(data.fkIdUser) || data.fkIdUser <= 0) {
    return { success: false, message: 'O usuário deve ser um ID de número inteiro positivo.' };
  }
  return { success: true, message: 'Campos básicos válidos.' };
}

itemValidators.validateTool = (data) => {
  const baseValidation = validateBaseFields(data);
  if (!baseValidation.success) {
    return baseValidation;
  }

  if (!data.aliases || typeof data.aliases !== 'string') {
    return { success: false, message: 'Apelidos (aliases) são obrigatórios e devem ser um texto.' };
  }
  if (!data.brand || typeof data.brand !== 'string') {
    return { success: false, message: 'A marca (brand) é obrigatória e deve ser um texto.' };
  }
  if (!data.description || typeof data.description !== 'string') {
    return { success: false, message: 'A descrição é obrigatória e deve ser um texto.' };
  }
  if (!data.technicalSpecs || typeof data.technicalSpecs !== 'string') {
    return { success: false, message: 'As especificações técnicas são obrigatórias e devem ser um texto.' };
  }
  if (!data.quantity && data.quantity !== 0) {
    return { success: false, message: 'A quantidade é obrigatória.' };
  }
  if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity) || data.quantity < 0) {
    return { success: false, message: 'A quantidade deve ser um número inteiro não negativo.' };
  }
  if (!data.batchNumber || typeof data.batchNumber !== 'string') {
    return { success: false, message: 'O número do lote (batchNumber) é obrigatório e deve ser um texto.' };
  }
  if (data.lastMaintenance && isNaN(new Date(data.lastMaintenance))) {
    return { success: false, message: 'Data de manutenção inválida.' };
  }

  return { success: true, message: 'Ferramenta validada com sucesso.' };
};

itemValidators.validateMaterial = (data) => {
  const baseValidation = validateBaseFields(data);
  if (!baseValidation.success) {
    return baseValidation;
  }

  if (!data.aliases || typeof data.aliases !== 'string') {
    return { success: false, message: 'Apelidos (aliases) são obrigatórios e devem ser um texto.' };
  }
  if (!data.brand || typeof data.brand !== 'string') {
    return { success: false, message: 'A marca (brand) é obrigatória e deve ser um texto.' };
  }
  if (!data.quantity && data.quantity !== 0) {
    return { success: false, message: 'A quantidade é obrigatória.' };
  }
  if (typeof data.quantity !== 'number' || data.quantity < 0) {
    return { success: false, message: 'A quantidade deve ser um número não negativo.' };
  }
  if (!data.batchNumber || typeof data.batchNumber !== 'string') {
    return { success: false, message: 'O número do lote (batchNumber) é obrigatório e deve ser um texto.' };
  }
  if (data.expirationDate) {
    const expiration = new Date(data.expirationDate);
    if (isNaN(expiration)) {
      return { success: false, message: 'Data de validade inválida.' };
    }
    if (expiration < new Date()) {
      return { success: false, message: 'A data de validade não pode ser no passado.' };
    }
  }

  return { success: true, message: 'Material validado com sucesso.' };
};

itemValidators.validateRawMaterial = (data) => {
  const baseValidation = validateBaseFields(data);
  if (!baseValidation.success) {
    return baseValidation;
  }

  if (!data.aliases || typeof data.aliases !== 'string') {
    return { success: false, message: 'Apelidos (aliases) são obrigatórios e devem ser um texto.' };
  }
  if (!data.brand || typeof data.brand !== 'string') {
    return { success: false, message: 'A marca (brand) é obrigatória e deve ser um texto.' };
  }
  if (!data.quantity && data.quantity !== 0) {
    return { success: false, message: 'A quantidade é obrigatória.' };
  }
  if (typeof data.quantity !== 'number' || data.quantity < 0) {
    return { success: false, message: 'A quantidade deve ser um número não negativo.' };
  }
  if (!data.batchNumber || typeof data.batchNumber !== 'string') {
    return { success: false, message: 'O número do lote (batchNumber) é obrigatório e deve ser um texto.' };
  }

  return { success: true, message: 'Matéria-prima validada com sucesso.' };
};

itemValidators.validateEquipment = (data) => {
  const baseValidation = validateBaseFields(data);
  if (!baseValidation.success) {
    return baseValidation;
  }

  if (!data.aliases || typeof data.aliases !== 'string') {
    return { success: false, message: 'Apelidos (aliases) são obrigatórios e devem ser um texto.' };
  }
  if (!data.brand || typeof data.brand !== 'string') {
    return { success: false, message: 'A marca (brand) é obrigatória e deve ser um texto.' };
  }
  if (!data.description || typeof data.description !== 'string') {
    return { success: false, message: 'A descrição é obrigatória e deve ser um texto.' };
  }
  if (!data.technicalSpecs || typeof data.technicalSpecs !== 'string') {
    return { success: false, message: 'As especificações técnicas são obrigatórias e devem ser um texto.' };
  }
  if (!data.quantity && data.quantity !== 0) {
    return { success: false, message: 'A quantidade é obrigatória.' };
  }
  if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity) || data.quantity < 0) {
    return { success: false, message: 'A quantidade deve ser um número inteiro não negativo.' };
  }
  if (!data.batchNumber || typeof data.batchNumber !== 'string') {
    return { success: false, message: 'O número do lote (batchNumber) é obrigatório e deve ser um texto.' };
  }

  return { success: true, message: 'Equipamento validado com sucesso.' };
};

itemValidators.validateProduct = (data) => {
  const baseValidation = validateBaseFields(data);
  if (!baseValidation.success) {
    return baseValidation;
  }

  if (!data.aliases || typeof data.aliases !== 'string') {
    return { success: false, message: 'Apelidos (aliases) são obrigatórios e devem ser um texto.' };
  }
  if (!data.brand || typeof data.brand !== 'string') {
    return { success: false, message: 'A marca (brand) é obrigatória e deve ser um texto.' };
  }
  if (!data.quantity && data.quantity !== 0) {
    return { success: false, message: 'A quantidade é obrigatória.' };
  }
  if (typeof data.quantity !== 'number' || data.quantity < 0) {
    return { success: false, message: 'A quantidade deve ser um número não negativo.' };
  }
  if (!data.batchNumber || typeof data.batchNumber !== 'string') {
    return { success: false, message: 'O número do lote (batchNumber) é obrigatório e deve ser um texto.' };
  }
  if (!data.expirationDate) {
    return { success: false, message: 'A data de validade é obrigatória.' };
  }
  const expiration = new Date(data.expirationDate);
  if (isNaN(expiration)) {
    return { success: false, message: 'Data de validade inválida.' };
  }
  if (expiration < new Date()) {
    return { success: false, message: 'A data de validade não pode ser no passado.' };
  }

  return { success: true, message: 'Produto validado com sucesso.' };
};

itemValidators.validateDiverses = (data) => {
  const baseValidation = validateBaseFields(data);
  if (!baseValidation.success) {
    return baseValidation;
  }

  if (!data.aliases || typeof data.aliases !== 'string') {
    return { success: false, message: 'Apelidos (aliases) são obrigatórios e devem ser um texto.' };
  }
  if (!data.quantity && data.quantity !== 0) {
    return { success: false, message: 'A quantidade é obrigatória.' };
  }
  if (typeof data.quantity !== 'number' || data.quantity < 0) {
    return { success: false, message: 'A quantidade deve ser um número não negativo.' };
  }
  if (!data.batchNumber || typeof data.batchNumber !== 'string') {
    return { success: false, message: 'O número do lote (batchNumber) é obrigatório e deve ser um texto.' };
  }
  if (data.brand && typeof data.brand !== 'string') {
    return { success: false, message: 'A marca (brand) deve ser um texto.' };
  }
  if (data.expirationDate) {
    const expiration = new Date(data.expirationDate);
    if (isNaN(expiration)) {
      return { success: false, message: 'Data de validade inválida.' };
    }
    if (expiration < new Date()) {
      return { success: false, message: 'A data de validade não pode ser no passado.' };
    }
  }

  return { success: true, message: 'Item diverso validado com sucesso.' };
};

module.exports = itemValidators;
