const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
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
    if (req.user.rol !== "admin") return res.status(403).json({ msg: "Solo admin" });
    const result = await pool.query("SELECT id, nombre, dni, email, movil, rol, creado_en FROM usuarios ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin") return res.status(403).json({ msg: "Solo admin" });
    const { nombre, dni, email, contraseña, movil, rol } = req.body;
    if (!nombre || !dni || !email || !contraseña || !movil) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }
    const userCheck = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 OR dni = $2 OR movil = $3",
      [email, dni, movil]
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ msg: "Usuario ya existe" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, dni, email, contraseña, movil, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, dni, email, movil, rol, creado_en",
      [nombre, dni, email, hashedPassword, movil, rol || "cliente"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.put("/:id/rol", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin") return res.status(403).json({ msg: "Solo admin" });
    const { rol } = req.body;
    const result = await pool.query(
      "UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre, dni, email, movil, rol",
      [rol, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin") return res.status(403).json({ msg: "Solo admin" });
    const coches = await pool.query("SELECT id FROM coches WHERE cliente_id = $1", [req.params.id]);
    for (const coche of coches.rows) {
      await pool.query("DELETE FROM historial WHERE coche_id = $1", [coche.id]);
    }
    await pool.query("DELETE FROM anomalias WHERE cliente_id = $1", [req.params.id]);
    await pool.query("DELETE FROM citas WHERE cliente_id = $1", [req.params.id]);
    await pool.query("DELETE FROM trabajos WHERE mecanico_id = $1", [req.params.id]);
    await pool.query("DELETE FROM coches WHERE cliente_id = $1", [req.params.id]);
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json({ msg: "Usuario eliminado" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
