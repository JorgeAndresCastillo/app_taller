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
    const { coche_id, fecha, hora, descripcion } = req.body;
    if (!coche_id || !fecha || !hora) {
      return res.status(400).json({ msg: "Coche, fecha y hora obligatorios" });
    }
    const result = await pool.query(
      "INSERT INTO citas (coche_id, cliente_id, fecha, hora, descripcion) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [coche_id, req.user.id, fecha, hora, descripcion]
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
      query = "SELECT c.*, co.matricula, co.marca, co.modelo, u.nombre as cliente_nombre FROM citas c JOIN coches co ON c.coche_id = co.id JOIN usuarios u ON c.cliente_id = u.id WHERE c.mecanico_id = $1 ORDER BY c.fecha DESC, c.hora DESC";
      params = [req.user.id];
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

router.put("/:id/asignar", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ msg: "Solo admin puede asignar mecánicos" });
    }
    const { mecanico_id } = req.body;
    const result = await pool.query(
      "UPDATE citas SET mecanico_id = $1, estado = 'asignada' WHERE id = $2 RETURNING *",
      [mecanico_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Cita no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.put("/:id/estado", authenticate, async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "asignada", "en_proceso", "completada", "cancelada"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido" });
    }
    const result = await pool.query(
      "UPDATE citas SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Cita no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
