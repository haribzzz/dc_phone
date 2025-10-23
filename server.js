const express = require('express');
const path = require('path');
const { sql, connectDB, config } = require('./db'); // <-- importamos conexión
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

app.use('/images', express.static(path.join(__dirname, 'images')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Conectar a la base de datos al iniciar el servidor
connectDB();

// Ruta para obtener productos
app.get('/productos', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Producto');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});