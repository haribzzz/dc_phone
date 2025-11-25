// db.js - CONFIGURACIÓN CORREGIDA PARA SOMEE
const sql = require('mssql');

const config = {
    user: 'papita90_SQLLogin_1',       
    password: 'DCPHONE2025',      
    server: 'dc_phone_db.mssql.somee.com', 
    database: 'dc_phone_db',
    options: {
        encrypt: true,                    // SSL requerido
        trustServerCertificate: true,     // ⚠️ CAMBIA A true PARA SOMEE
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000
    }
};

// Conexión mejorada que no crashea el servidor
const getConnection = async () => {
    try {
        console.log('🔗 Intentando conectar a Somee...');
        const pool = await sql.connect(config);
        console.log('✅ CONECTADO A SOMEE - SSL configurado correctamente');
        return pool;
    } catch (err) {
        console.error('❌ ERROR DE CONEXIÓN:', err.message);
        console.log('💡 El servidor continuará pero sin base de datos');
        // No relanzamos el error para que el servidor no crashee
        throw err;
    }
};

// Exportar sin probar conexión al inicio
module.exports = { 
    sql, 
    getConnection,
    config 
};