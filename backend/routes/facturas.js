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
    if (req.user.rol !== "admin") return res.status(403).json({ msg: "Solo admin" });
    const { cliente_id, cita_id, detalles } = req.body;
    if (!detalles || detalles.length === 0) {
      return res.status(400).json({ msg: "Detalles requeridos" });
    }
    const total = detalles.reduce((sum, d) => sum + (d.precio * d.cantidad), 0);
    const facturaResult = await pool.query(
      "INSERT INTO facturas (cliente_id, cita_id, total) VALUES ($1, $2, $3) RETURNING *",
      [cliente_id, cita_id, total]
    );
    const facturaId = facturaResult.rows[0].id;
    for (const detalle of detalles) {
      await pool.query(
        "INSERT INTO factura_detalles (factura_id, descripcion, cantidad, precio, subtotal) VALUES ($1, $2, $3, $4, $5)",
        [facturaId, detalle.descripcion, detalle.cantidad, detalle.precio, detalle.precio * detalle.cantidad]
      );
    }
    const facturaCompleta = await pool.query(
      "SELECT f.*, fd.* FROM facturas f LEFT JOIN factura_detalles fd ON f.id = fd.factura_id WHERE f.id = $1",
      [facturaId]
    );
    res.status(201).json(facturaCompleta.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.rol === "admin") {
      query = "SELECT f.*, u.nombre as cliente_nombre FROM facturas f JOIN usuarios u ON f.cliente_id = u.id ORDER BY f.fecha DESC";
      params = [];
    } else {
      query = "SELECT f.* FROM facturas f WHERE f.cliente_id = $1 ORDER BY f.fecha DESC";
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const factura = await pool.query(
      "SELECT f.*, u.nombre as cliente_nombre FROM facturas f JOIN usuarios u ON f.cliente_id = u.id WHERE f.id = $1",
      [req.params.id]
    );
    if (factura.rows.length === 0) return res.status(404).json({ msg: "Factura no encontrada" });
    const detalles = await pool.query("SELECT * FROM factura_detalles WHERE factura_id = $1", [req.params.id]);
    res.json({ ...factura.rows[0], detalles: detalles.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

router.put("/:id/estado", authenticate, async (req, res) => {
  try {
    if (req.user.rol !== "admin") return res.status(403).json({ msg: "Solo admin" });
    const { estado } = req.body;
    const result = await pool.query("UPDATE facturas SET estado = $1 WHERE id = $2 RETURNING *", [estado, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: "Factura no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

module.exports = router;
