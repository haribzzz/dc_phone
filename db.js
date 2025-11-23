// db.js
const sql = require('mssql');

const config = {
    user: 'papita90_SQLLogin_1',       // TU login de Somee
    password: 'DCPHONE2025',      // poné tu contraseña
    server: 'dc_phone_db.mssql.somee.com', 
    database: 'dc_phone_db',
    port: 1433,
    options: {
        encrypt: true,                 // obligatorio para servidores externos
        trustServerCertificate: true  // debe ir en false para Somee
    }
};

const connectionDB = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('🌐 Conectado a SQL Server SOMEE');
        return pool;
    })
    .catch(err => {
        console.error('❌ Error de conexión:', err);
    });

module.exports = { sql, connectionDB, config };
