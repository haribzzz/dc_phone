// db.js - CONFIGURACIÓN DEFINITIVA
const sql = require('mssql');

const config = {
    user: 'papita90_SQLLogin_1',       
    password: 'DCPHONE2025',      
    server: 'dc_phone_db.mssql.somee.com', 
    database: 'dc_phone_db',
    options: {
        encrypt: true,                    // SSL requerido
        trustServerCertificate: false,    // Somee tiene certificado válido
        enableArithAbort: true,
        connectTimeout: 60000,           // Timeout más largo
        requestTimeout: 60000,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1.2'
        }
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000
    }
};

// Conexión con manejo robusto de errores
const getConnection = async () => {
    try {
        const pool = await sql.connect(config);
        console.log('✅ CONECTADO A SOMEE - Base de datos restaurada');
        
        // Verificar conexión con consulta simple
        await pool.request().query('SELECT 1 as status');
        console.log('✅ Verificación de conexión exitosa');
        
        return pool;
    } catch (err) {
        console.error('❌ ERROR DE CONEXIÓN:', err.message);
        console.error('🔍 Código:', err.code);
        
        if (err.code === 'ELOGIN') {
            console.log('💡 Verifica usuario/contraseña en Somee');
        } else if (err.code === 'EDB') {
            console.log('💡 La base de datos puede estar en proceso de restauración');
        }
        
        throw err;
    }
};

// Probar conexión al cargar
getConnection().catch(err => {
    console.log('⚠️ La base de datos puede estar en proceso de restauración');
    console.log('🕒 Espera 2-3 minutos y reinicia el servidor');
});

module.exports = { 
    sql, 
    connectionDB: getConnection(),
    getConnection,
    config 
};