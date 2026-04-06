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
    const { cita_id, coche_id, descripcion, precio } = req.body;
    if (!descripcion) return res.status(400).json({ msg: "Descripción obligatoria" });
    const result = await pool.query(
      "INSERT INTO trabajos (cita_id, coche_id, mecanico_id, descripcion, precio) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [cita_id, coche_id, req.user.id, descripcion, precio]
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
      query = "SELECT t.*, c.matricula, c.marca, c.modelo, m.nombre as mecanico_nombre FROM trabajos t JOIN coches c ON t.coche_id = c.id JOIN usuarios m ON t.mecanico_id = m.id";
      params = [];
    } else if (req.user.rol === "mecanico") {
      query = "SELECT t.*, c.matricula, c.marca, c.modelo FROM trabajos t JOIN coches c ON t.coche_id = c.id WHERE t.mecanico_id = $1";
      params = [req.user.id];
    } else {
      query = "SELECT t.*, c.matricula, c.marca, c.modelo FROM trabajos t JOIN coches c ON t.coche_id = c.id JOIN coches co ON t.coche_id = co.id WHERE co.cliente_id = $1";
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { descripcion, precio, estado } = req.body;
    const result = await pool.query(
      "UPDATE trabajos SET descripcion = COALESCE($1, descripcion), precio = COALESCE($2, precio), estado = COALESCE($3, estado) WHERE id = $4 AND mecanico_id = $5 RETURNING *",
      [descripcion, precio, estado, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Trabajo no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
