const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token requerido" });
  try {
    req.user = jwt.verify(token, "TU_SECRETO_SUPER_SEGURO");
    next();
  } catch {
    res.status(401).json({ msg: "Token inválido" });
  }
};

router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY creado_en DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.put("/:id/leida", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE notificaciones SET leida = TRUE WHERE id = $1 AND usuario_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Notificación no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.put("/leidas", authenticate, async (req, res) => {
  try {
    await pool.query("UPDATE notificaciones SET leida = TRUE WHERE usuario_id = $1", [req.user.id]);
    res.json({ msg: "Todas marcadas como leídas" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

const crearNotificacion = async (usuario_id, tipo, mensaje) => {
  try {
    await pool.query(
      "INSERT INTO notificaciones (usuario_id, tipo, mensaje) VALUES ($1, $2, $3)",
      [usuario_id, tipo, mensaje]
    );
  } catch (err) {
    console.error(err.message);
  }
};

const enviarEmail = async (email, asunto, mensaje) => {
  console.log(`[EMAIL] Para: ${email}, Asunto: ${asunto}, Mensaje: ${mensaje}`);
};

const enviarWhatsApp = async (telefono, mensaje) => {
  console.log(`[WHATSAPP] Para: ${telefono}, Mensaje: ${mensaje}`);
};

module.exports = router;
module.exports.crearNotificacion = crearNotificacion;
module.exports.enviarEmail = enviarEmail;
module.exports.enviarWhatsApp = enviarWhatsApp;
