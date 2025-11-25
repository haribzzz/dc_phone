const express = require('express');
const path = require('path');
const cors = require('cors');

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

// ==================== RUTA LOGIN (DEBE IR PRIMERO) ====================
app.post('/login', async (req, res) => {
    const { nombre_usuario, password, email } = req.body;

    console.log('🔐 Intento de login para:', { nombre_usuario, email });
    console.log('📧 Datos recibidos:', { nombre_usuario, email, password: '***' });

    // Usuario válido
    const validUser = {
        username: 'admin',
        password: 'CieloAzul2025',
        email: 'admin@dcphone.com'
    };

    try {
        // Verificación con usuario, email y contraseña
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
            console.log('❌ Esperado:', validUser);
            console.log('❌ Recibido:', { nombre_usuario, email, password });
            
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

// ==================== RUTAS DE PRODUCTOS ====================
app.get('/productos', async (req, res) => {
    try {
        console.log('🔍 Solicitando productos...');
        // Simulamos datos para prueba
        const productos = [
            {
                id_producto: 1,
                nombre: "iPhone 15",
                marca: "Apple",
                precio: 999.99,
                stock: 10,
                descripcion: "Último modelo iPhone",
                imagen: "/images/iphone15.jpg",
                esta_activo: 1
            }
        ];
        
        console.log(`✅ ${productos.length} productos encontrados`);
        res.json(productos);
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

app.get('/status', (req, res) => {
    res.json({
        status: '✅ ONLINE',
        serverTime: new Date().toISOString()
    });
});

// ==================== ARCHIVOS ESTÁTICOS (AL FINAL) ====================
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Ruta principal - ÚLTIMA
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