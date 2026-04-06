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
    const { matricula, marca, modelo, año, kilometraje } = req.body;
    if (!matricula) return res.status(400).json({ msg: "Matrícula obligatoria" });

    const result = await pool.query(
      "INSERT INTO coches (matricula, marca, modelo, año, kilometraje, cliente_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [matricula, marca, modelo, año, kilometraje, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ msg: "Matrícula ya existe" });
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.rol === "admin") {
      query = "SELECT c.*, u.nombre as cliente_nombre FROM coches c JOIN usuarios u ON c.cliente_id = u.id";
      params = [];
    } else {
      query = "SELECT * FROM coches WHERE cliente_id = $1";
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
    const { marca, modelo, año, kilometraje } = req.body;
    const result = await pool.query(
      "UPDATE coches SET marca = COALESCE($1, marca), modelo = COALESCE($2, modelo), año = COALESCE($3, año), kilometraje = COALESCE($4, kilometraje) WHERE id = $5 AND cliente_id = $6 RETURNING *",
      [marca, modelo, año, kilometraje, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Coche no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.delete("/:matricula", authenticate, async (req, res) => {
  try {
    const coche = await pool.query("SELECT id FROM coches WHERE matricula = $1", [req.params.matricula]);
    if (coche.rows.length === 0) return res.status(404).json({ msg: "Coche no encontrado" });
    const cocheId = coche.rows[0].id;
    await pool.query("DELETE FROM historial WHERE coche_id = $1", [cocheId]);
    await pool.query("DELETE FROM citas WHERE coche_id = $1", [cocheId]);
    await pool.query("DELETE FROM trabajos WHERE coche_id = $1", [cocheId]);
    await pool.query("DELETE FROM anomalias WHERE coche_id = $1", [cocheId]);
    let query, params;
    if (req.user.rol === "admin") {
      query = "DELETE FROM coches WHERE matricula = $1 RETURNING *";
      params = [req.params.matricula];
    } else {
      query = "DELETE FROM coches WHERE matricula = $1 AND cliente_id = $2 RETURNING *";
      params = [req.params.matricula, req.user.id];
    }
    const result = await pool.query(query, params);
    res.json({ msg: "Coche eliminado" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
