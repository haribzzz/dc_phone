const express = require('express');
const path = require('path');
const cors = require('cors');
const { sql, getConnection } = require('./db'); // Asegúrate de tener este archivo

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================== MIDDLEWARE DE LOGGING ====================
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
    next();
});

// ==================== RUTA LOGIN ====================
app.post('/login', async (req, res) => {
    const { nombre_usuario, password, email } = req.body;

    console.log('🔐 Intento de login para:', { nombre_usuario, email });

    const validUser = {
        username: 'admin',
        password: 'CieloAzul2025',
        email: 'admin@dcphone.com'
    };

    try {
        if (nombre_usuario === validUser.username && 
            password === validUser.password &&
            email === validUser.email) {
            
            console.log('✅ Login exitoso: admin');
            
            res.json({ 
                success: true, 
                user: {
                    id: 1,
                    username: 'admin',
                    email: 'admin@dcphone.com',
                    role: 'administrador'
                },
                message: 'Bienvenido al sistema DC Phone'
            });
        } else {
            console.log('❌ Credenciales incorrectas');
            res.status(401).json({ 
                success: false, 
                message: 'Usuario, email o contraseña incorrectos' 
            });
        }
        
    } catch (error) {
        console.error('💥 Error en login:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor'
        });
    }
});

// ==================== RUTAS DE PRODUCTOS (CON BASE DE DATOS REAL) ====================
app.get('/productos', async (req, res) => {
    try {
        console.log('🔍 Solicitando productos desde BD...');
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                id_producto,
                nombre,
                marca,
                modelo,
                precio,
                stock,
                descripcion,
                imagen,
                esta_activo,
                fecha_creacion
            FROM Producto 
            WHERE esta_activo = 1
            ORDER BY fecha_creacion DESC
        `);
        
        console.log(`✅ ${result.recordset.length} productos encontrados en BD`);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error en GET /productos:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos: ' + err.message
        });
    }
});

// ==================== RUTAS DE DIAGNÓSTICO ====================
app.get('/health', (req, res) => {
    res.json({
        status: '✅ OK',
        message: 'Servidor DC Phone funcionando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/status', async (req, res) => {
    try {
        const pool = await getConnection();
        
        const dbInfo = await pool.request()
            .query('SELECT DB_NAME() as dbname');
            
        const counts = await pool.request()
            .query(`
                SELECT 'Producto' as tabla, COUNT(*) as total FROM Producto WHERE esta_activo = 1
                UNION ALL SELECT 'Usuario' as tabla, COUNT(*) as total FROM Usuario WHERE esta_activo = 1
                UNION ALL SELECT 'Promocion' as tabla, COUNT(*) as total FROM Promocion WHERE esta_activa = 1
            `);
        
        res.json({
            status: '✅ ONLINE',
            database: dbInfo.recordset[0].dbname,
            counts: counts.recordset,
            serverTime: new Date().toISOString()
        });
        
    } catch (err) {
        res.status(500).json({
            status: '❌ OFFLINE', 
            error: err.message
        });
    }
});

// ==================== ARCHIVOS ESTÁTICOS ====================
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== MANEJO DE ERRORES ====================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

app.use((err, req, res, next) => {
    console.error('💥 Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// ==================== INICIO DEL SERVIDOR ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 Servidor DC Phone ejecutándose...
📍 Puerto: ${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Iniciado: ${new Date().toISOString()}
🌐 Disponible en: http://localhost:${PORT}
    `);
});