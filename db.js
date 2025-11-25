// db.js - CONFIGURACIÓN CORREGIDA
const sql = require('mssql');

const config = {
    user: 'papita90_SQLLogin_1',       
    password: 'DCPHONE2025',      
    server: 'dc_phone_db.mssql.somee.com', 
    database: 'dc_phone_db',
    options: {
        encrypt: true,                    // SSL requerido
        trustServerCertificate: true,     // ⚠️ TRUE para Somee
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000
    }
};

const getConnection = async () => {
    try {
        const pool = await sql.connect(config);
        console.log('✅ CONECTADO A SOMEE');
        return pool;
    } catch (err) {
        console.error('❌ Error BD:', err.message);
        throw err;
    }
};

module.exports = { sql, getConnection, config };