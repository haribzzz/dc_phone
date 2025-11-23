const express = require('express');
const path = require('path');
const { sql, connectionDB, config } = require('./db'); // importar conexión

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------
// Archivos estáticos
// --------------------
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));

// --------------------
// Ruta principal
// --------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // index.html dentro de 'public'
});

// --------------------
// Ruta para obtener productos
// --------------------
app.get('/productos', async (req, res) => {
    try {
        const pool = await connectionDB; // conexión desde db.js
        const result = await pool.request().query('SELECT * FROM Producto');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).send('Error en el servidor');
    }
});

app.get('/promociones', async (req, res) => {
    try {
        const pool = await connectionDB;
        const result = await pool.request().query('SELECT * FROM Promocion'); // nombre de tabla en SQL
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener promociones:', err);
        res.status(500).send('Error en el servidor');
    }
});


// --------------------
// Probar conexión (opcional)
// --------------------
async function probarConexion() {
    try {
        await sql.connect(config);
        console.log('✅ Conexión exitosa a SQL Server');
    } catch (err) {
        console.error('❌ Error de conexión:', err);
    }
}
probarConexion();

// --------------------
// Iniciar servidor
// --------------------
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));