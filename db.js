const sql = require('mssql');

const config = {
    user: 'AdminDC',
    password: 'DCPHONE2025!',
    server: 'PAPITA_SALADA\\DCPHONESQL', // <-- usa el nombre correcto del servidor
    database: 'dc_phone',
    options: {
        trustServerCertificate: true, // <-- era un punto y coma, debía ser una coma
        encrypt: true
    },
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log('Conectado a SQL Server correctamente');
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
    }
}

module.exports = { sql, connectDB, config };