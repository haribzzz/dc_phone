// db.js
const sql = require('mssql');

// Configuración de conexión
const config = {
    user: 'sa',                       // tu usuario SQL Server
    password: 'DCPHONE2025!',        // tu contraseña
    server: 'localhost\\BASEDCPHONE', // tu instancia
    database: 'dc_phone3',            // tu base de datos
    options: {
        encrypt: false,               // false para local
        trustServerCertificate: true  // evita errores de certificado
    }
};

// Crear y exportar el pool de conexión
const connectionDB = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Conectado a SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('❌ Error de conexión:', err);
    });

module.exports = { sql, connectionDB, config };