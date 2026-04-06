const express = require('express');
const app = express();
const port = 3000;

// Para leer JSON desde requests
app.use(express.json());

// Conectar rutas de auth
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend del taller funcionando ✅');
});

// Arrancar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});