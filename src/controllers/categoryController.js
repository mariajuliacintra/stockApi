const { queryAsync, handleResponse } = require('../utils/functions');

module.exports = class CategoryController {
    static async getCategories (req, res) {
        try {
            const query = "SELECT * FROM category";
            const categories = await queryAsync(query);
            handleResponse(res, 200, categories);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getCategoryById (req, res) {
        const { idCategory } = req.params;
        try {
            const query = "SELECT * FROM category WHERE idCategory = ?";
            const category = await queryAsync(query, [idCategory]);

            if (category.length === 0) {
                return handleResponse(res, 404, { message: "Categoria não encontrada." });
            }

            handleResponse(res, 200, category[0]);
        } catch (error) {
            console.error("Erro ao buscar categoria por ID:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createCategory (req, res) {
        const { categoryValue } = req.body;
        try {
            if (!categoryValue) {
                return handleResponse(res, 400, { message: "O nome da categoria é obrigatório." });
            }

            const query = "INSERT INTO category (categoryValue) VALUES (?)";
            const values = [categoryValue];
            const result = await queryAsync(query, values);

            handleResponse(res, 201, { message: "Categoria criada com sucesso!", categoryId: result.insertId });
        } catch (error) {
            console.error("Erro ao criar categoria:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateCategory (req, res) {
        const { idCategory } = req.params;
        const { categoryValue } = req.body;
        try {
            if (!categoryValue) {
                return handleResponse(res, 400, { message: "O nome da categoria é obrigatório." });
            }
            
            const query = "UPDATE category SET categoryValue = ? WHERE idCategory = ?";
            const values = [categoryValue, idCategory];
            const result = await queryAsync(query, values);

            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { message: "Categoria não encontrada." });
            }

            handleResponse(res, 200, { message: "Categoria atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar categoria:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteCategory (req, res) {
        const { idCategory } = req.params;
        try {
            const query = "DELETE FROM category WHERE idCategory = ?";
            const result = await queryAsync(query, [idCategory]);

            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { message: "Categoria não encontrada." });
            }

            handleResponse(res, 200, { message: "Categoria excluída com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir categoria:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }
};