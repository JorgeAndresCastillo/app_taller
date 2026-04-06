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
    const { coche_id, tipo, descripcion, kilometraje, precio, siguiente_fecha, siguiente_kilometraje } = req.body;
    if (!coche_id || !tipo) return res.status(400).json({ msg: "Coche y tipo obligatorios" });
    const result = await pool.query(
      "INSERT INTO historial (coche_id, tipo, descripcion, kilometraje, precio, siguiente_fecha, siguiente_kilometraje) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [coche_id, tipo, descripcion, kilometraje, precio, siguiente_fecha, siguiente_kilometraje]
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
      query = "SELECT h.*, c.matricula, c.marca, c.modelo FROM historial h JOIN coches c ON h.coche_id = c.id ORDER BY h.fecha DESC";
      params = [];
    } else {
      query = "SELECT h.*, c.matricula, c.marca, c.modelo FROM historial h JOIN coches c ON h.coche_id = c.id WHERE c.cliente_id = $1 ORDER BY h.fecha DESC";
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.get("/coche/:coche_id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM historial WHERE coche_id = $1 ORDER BY fecha DESC",
      [req.params.coche_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
