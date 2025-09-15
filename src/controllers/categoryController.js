const { queryAsync, handleResponse } = require('../utils/functions');

module.exports = class CategoryController {
    static async getCategories(req, res) {
        try {
            const query = "SELECT * FROM category";
            const categories = await queryAsync(query);
            return handleResponse(res, 200, { success: true, message: "Categorias obtidas com sucesso.", data: categories, arrayName: "categories" });
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getCategoryById(req, res) {
        const { idCategory } = req.params;
        try {
            const query = "SELECT * FROM category WHERE idCategory = ?";
            const category = await queryAsync(query, [idCategory]);
            if (category.length === 0) {
                return handleResponse(res, 404, { success: false, error: "Categoria não encontrada.", details: "O ID da categoria fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Categoria obtida com sucesso.", data: category[0], arrayName: "category" });
        } catch (error) {
            console.error("Erro ao buscar categoria por ID:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createCategory(req, res) {
        const { categoryValue } = req.body;
        try {
            if (!categoryValue) {
                return handleResponse(res, 400, { success: false, error: "Campo obrigatório ausente", details: "O nome da categoria é obrigatório." });
            }
            const query = "INSERT INTO category (categoryValue) VALUES (?)";
            const values = [categoryValue];
            const result = await queryAsync(query, values);
            return handleResponse(res, 201, { success: true, message: "Categoria criada com sucesso!", data: { categoryId: result.insertId }, arrayName: "category" });
        } catch (error) {
            console.error("Erro ao criar categoria:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateCategory(req, res) {
        const { idCategory } = req.params;
        const { categoryValue } = req.body;
        try {
            if (!categoryValue) {
                return handleResponse(res, 400, { success: false, error: "Campo obrigatório ausente", details: "O nome da categoria é obrigatório." });
            }
            const query = "UPDATE category SET categoryValue = ? WHERE idCategory = ?";
            const values = [categoryValue, idCategory];
            const result = await queryAsync(query, values);
            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { success: false, error: "Categoria não encontrada.", details: "O ID da categoria fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Categoria atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar categoria:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteCategory(req, res) {
        const { idCategory } = req.params;
        try {
            const query = "DELETE FROM category WHERE idCategory = ?";
            const result = await queryAsync(query, [idCategory]);
            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { success: false, error: "Categoria não encontrada.", details: "O ID da categoria fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Categoria excluída com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir categoria:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }
};