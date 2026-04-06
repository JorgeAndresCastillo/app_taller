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

router.post("/", authenticate, async (req, res) => {
  try {
    const { coche_id, descripcion, prioridad } = req.body;
    if (!coche_id || !descripcion) {
      return res.status(400).json({ msg: "Coche y descripción obligatorios" });
    }
    const result = await pool.query(
      "INSERT INTO anomalias (coche_id, cliente_id, descripcion, prioridad) VALUES ($1, $2, $3, $4) RETURNING *",
      [coche_id, req.user.id, descripcion, prioridad || "media"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.rol === "admin") {
      query = "SELECT a.*, c.matricula, c.marca, c.modelo, u.nombre as cliente_nombre FROM anomalias a JOIN coches c ON a.coche_id = c.id JOIN usuarios u ON a.cliente_id = u.id ORDER BY a.creado_en DESC";
      params = [];
    } else {
      query = "SELECT a.*, c.matricula, c.marca, c.modelo FROM anomalias a JOIN coches c ON a.coche_id = c.id WHERE a.cliente_id = $1 ORDER BY a.creado_en DESC";
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.put("/:id/estado", authenticate, async (req, res) => {
  try {
    const { estado } = req.body;
    const result = await pool.query(
      "UPDATE anomalias SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Anomalía no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
