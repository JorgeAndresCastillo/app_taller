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
    if (req.user.rol !== "admin" && req.user.rol !== "mecanico") return res.status(403).json({ msg: "Solo admin o mecanico" });
    const { nombre, descripcion, categoria, stock, precio_compra, precio_venta, minimo_stock } = req.body;
    if (!nombre) return res.status(400).json({ msg: "Nombre obligatorio" });
    const result = await pool.query(
      "INSERT INTO inventario (nombre, descripcion, categoria, stock, precio_compra, precio_venta, minimo_stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [nombre, descripcion, categoria, stock || 0, precio_compra, precio_venta, minimo_stock || 5]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin" && req.user.rol !== "mecanico" && req.user.rol !== "cliente") {
      return res.status(403).json({ msg: "Acceso denegado" });
    }
    const result = await pool.query("SELECT * FROM inventario ORDER BY nombre");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin" && req.user.rol !== "mecanico") return res.status(403).json({ msg: "Solo admin o mecanico" });
    const { stock, precio_venta } = req.body;
    const result = await pool.query(
      "UPDATE inventario SET stock = COALESCE($1, stock), precio_venta = COALESCE($2, precio_venta) WHERE id = $3 RETURNING *",
      [stock, precio_venta, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin" && req.user.rol !== "mecanico") return res.status(403).json({ msg: "Solo admin o mecanico" });
    const result = await pool.query("DELETE FROM inventario WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: "Producto no encontrado" });
    res.json({ msg: "Producto eliminado" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.get("/alerta", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin" && req.user.rol !== "mecanico") return res.status(403).json({ msg: "Solo admin o mecanico" });
    const result = await pool.query("SELECT * FROM inventario WHERE stock <= minimo_stock");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
