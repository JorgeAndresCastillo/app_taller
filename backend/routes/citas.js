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
    const { matricula, fecha, hora, descripcion } = req.body;
    if (!matricula || !fecha || !hora) {
      return res.status(400).json({ msg: "Matrícula, fecha y hora obligatorios" });
    }
    const coche = await pool.query("SELECT id, cliente_id FROM coches WHERE matricula = $1", [matricula]);
    if (coche.rows.length === 0) {
      return res.status(404).json({ msg: "Coche no encontrado" });
    }
    if (coche.rows[0].cliente_id !== req.user.id && req.user.rol === "cliente") {
      return res.status(403).json({ msg: "Solo puedes crear citas para tus coches" });
    }
    const result = await pool.query(
      "INSERT INTO citas (coche_id, cliente_id, fecha, hora, descripcion) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [coche.rows[0].id, req.user.id, fecha, hora, descripcion]
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
      query = "SELECT c.*, co.matricula, co.marca, co.modelo, u.nombre as cliente_nombre FROM citas c JOIN coches co ON c.coche_id = co.id JOIN usuarios u ON c.cliente_id = u.id ORDER BY c.fecha DESC, c.hora DESC";
      params = [];
    } else if (req.user.rol === "mecanico") {
      query = "SELECT c.*, co.matricula, co.marca, co.modelo, u.nombre as cliente_nombre, m.nombre as mecanico_nombre FROM citas c JOIN coches co ON c.coche_id = co.id JOIN usuarios u ON c.cliente_id = u.id LEFT JOIN usuarios m ON c.mecanico_id = m.id ORDER BY c.fecha DESC, c.hora DESC";
      params = [];
    } else {
      query = "SELECT c.*, co.matricula, co.marca, co.modelo FROM citas c JOIN coches co ON c.coche_id = co.id WHERE c.cliente_id = $1 ORDER BY c.fecha DESC, c.hora DESC";
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
    if (req.user.rol !== "admin" && req.user.rol !== "mecanico") {
      return res.status(403).json({ msg: "Solo admin o mecanico pueden cambiar estado" });
    }
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "aceptado", "rechazado", "en_proceso", "completada", "cancelada"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido" });
    }
    
    let query, params;
    if (req.user.rol === "mecanico" && estado === "aceptado") {
      query = "UPDATE citas SET estado = $1, mecanico_id = $2 WHERE id = $3 AND estado = 'pendiente' RETURNING *";
      params = [estado, req.user.id, req.params.id];
    } else {
      query = "UPDATE citas SET estado = $1 WHERE id = $2 RETURNING *";
      params = [estado, req.params.id];
    }
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ msg: "Cita no encontrada o ya fue procesada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
