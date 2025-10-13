const connect = require("../config/connect");

module.exports = class ApkController {
  // Upload do APK
  static async uploadApk(req, res) {
    const { nome_app, versao, descricao } = req.body;
    const apk = req.file?.buffer || null;
    const apk_tipo = req.file?.mimetype || null;

    if (!nome_app || !versao || !apk) {
      return res.status(400).json({ error: "Nome, versão e arquivo APK são obrigatórios" });
    }

    const query = `
      INSERT INTO apk_release (nome_app, versao, descricao, apk, apk_tipo)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [nome_app, versao, descricao || null, apk, apk_tipo];

    try {
      connect.query(query, values, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao enviar o APK" });
        }
        res.status(201).json({ message: "APK enviado com sucesso" });
      });
    } catch (error) {
      console.error("Erro interno do servidor:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  // Download do último APK disponível
  static async downloadApk(req, res) {
    const query = `
      SELECT apk, apk_tipo, nome_app, versao
      FROM apk_release
      ORDER BY criado_em DESC
      LIMIT 1
    `;

    try {
      connect.query(query, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao buscar APK" });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: "Nenhum APK disponível" });
        }

        const { apk, apk_tipo, nome_app, versao } = result[0];
        res.setHeader("Content-Type", apk_tipo || "application/vnd.android.package-archive");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${nome_app}-v${versao}.apk"`
        );
        res.send(apk);
      });
    } catch (error) {
      console.error("Erro interno do servidor:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
