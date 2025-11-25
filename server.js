const express = require('express');
const path = require('path');
const cors = require('cors');
const { sql, getConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ==================== MIDDLEWARE DE LOGGING ====================
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
    next();
});

// ==================== RUTAS PRINCIPALES ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== RUTAS DE PRODUCTOS ====================

// Obtener todos los productos
app.get('/productos', async (req, res) => {
    try {
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
        
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error en GET /productos:', err.message);
        res.json([]);
    }
});

// Obtener producto por ID
app.get('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Producto WHERE id_producto = @id AND esta_activo = 1');
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
    } catch (err) {
        console.error('❌ Error en GET /productos/:id:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto'
        });
    }
});

// Crear nuevo producto
app.post('/productos', async (req, res) => {
    try {
        const { nombre, marca, modelo, precio, stock, descripcion, imagen, id_categoria } = req.body;
        
        if (!nombre || !marca || !precio) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, marca y precio son obligatorios'
            });
        }
        
        const pool = await getConnection();
        const query = `
            INSERT INTO Producto (nombre, marca, modelo, precio, stock, descripcion, imagen, id_categoria)
            OUTPUT INSERTED.id_producto
            VALUES (@nombre, @marca, @modelo, @precio, @stock, @descripcion, @imagen, @id_categoria)
        `;
        
        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('marca', sql.VarChar, marca)
            .input('modelo', sql.VarChar, modelo || '')
            .input('precio', sql.Decimal(10,2), precio)
            .input('stock', sql.Int, stock || 0)
            .input('descripcion', sql.Text, descripcion || '')
            .input('imagen', sql.VarChar, imagen || '')
            .input('id_categoria', sql.Int, id_categoria || 1)
            .query(query);
        
        res.status(201).json({
            success: true,
            message: '✅ Producto creado correctamente',
            id: result.recordset[0].id_producto
        });
    } catch (err) {
        console.error('❌ Error en POST /productos:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al crear producto'
        });
    }
});

// Actualizar producto
app.put('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, marca, modelo, precio, stock, descripcion, imagen, esta_activo } = req.body;
        
        const pool = await getConnection();
        const query = `
            UPDATE Producto 
            SET nombre = @nombre,
                marca = @marca,
                modelo = @modelo,
                precio = @precio,
                stock = @stock,
                descripcion = @descripcion,
                imagen = @imagen,
                esta_activo = @esta_activo
            WHERE id_producto = @id
        `;
        
        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('marca', sql.VarChar, marca)
            .input('modelo', sql.VarChar, modelo || '')
            .input('precio', sql.Decimal(10,2), precio)
            .input('stock', sql.Int, stock || 0)
            .input('descripcion', sql.Text, descripcion || '')
            .input('imagen', sql.VarChar, imagen || '')
            .input('esta_activo', sql.Bit, esta_activo !== undefined ? esta_activo : 1)
            .input('id', sql.Int, id)
            .query(query);
        
        if (result.rowsAffected[0] > 0) {
            res.json({
                success: true,
                message: '✅ Producto actualizado correctamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: '❌ Producto no encontrado'
            });
        }
    } catch (err) {
        console.error('❌ Error en PUT /productos/:id:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto'
        });
    }
});

// Eliminar producto (desactivar)
app.delete('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE Producto SET esta_activo = 0 WHERE id_producto = @id');
        
        if (result.rowsAffected[0] > 0) {
            res.json({
                success: true,
                message: '✅ Producto eliminado correctamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: '❌ Producto no encontrado'
            });
        }
    } catch (err) {
        console.error('❌ Error en DELETE /productos/:id:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto'
        });
    }
});

// ==================== RUTAS DE AUTENTICACIÓN ====================
app.post('/login', async (req, res) => {
    const { nombre_usuario, password } = req.body;

    console.log('🔐 Intento de login para:', nombre_usuario);

    if (!nombre_usuario?.trim() || !password?.trim()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Usuario y contraseña son requeridos' 
        });
    }

    try {
        const pool = await getConnection();
        
        const query = `
            SELECT id_usuario, nombre_usuario, email, rol 
            FROM Usuario 
            WHERE nombre_usuario = @nombre_usuario 
            AND password_hash = HASHBYTES('SHA2_256', @password)
            AND esta_activo = 1
        `;

        const result = await pool.request()
            .input('nombre_usuario', sql.VarChar, nombre_usuario.trim())
            .input('password', sql.VarChar, password)
            .query(query);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            console.log('✅ Login exitoso:', user.nombre_usuario);
            
            res.json({ 
                success: true, 
                user: {
                    id: user.id_usuario,
                    username: user.nombre_usuario,
                    email: user.email,
                    role: user.rol
                },
                message: 'Bienvenido al sistema'
            });
        } else {
            console.log('❌ Credenciales incorrectas para:', nombre_usuario);
            res.status(401).json({ 
                success: false, 
                message: 'Usuario o contraseña incorrectos' 
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

// ==================== RUTAS DE CONTACTO ====================
app.get('/contacto', async (req, res) => {
    try {
        const pool = await getConnection();
        
        const result = await pool.request()
            .query("SELECT TOP 1 * FROM Contacto ORDER BY id_contacto");
        
        if (result.recordset.length > 0) {
            res.json({
                success: true,
                data: result.recordset[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No se encontraron datos de contacto'
            });
        }
    } catch (error) {
        console.error('❌ Error en GET /contacto:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener datos de contacto'
        });
    }
});

app.put('/contacto/:id', async (req, res) => {
    const { id } = req.params;
    const { whatsapp, facebook, instagram, direccion, horario } = req.body;

    if (!whatsapp || !direccion || !horario) {
        return res.status(400).json({
            success: false,
            message: 'WhatsApp, dirección y horario son obligatorios'
        });
    }

    try {
        const pool = await getConnection();
        
        const query = `
            UPDATE Contacto 
            SET whatsapp = @whatsapp,
                facebook = @facebook,
                instagram = @instagram, 
                direccion = @direccion,
                horario = @horario
            WHERE id_contacto = @id
        `;

        const result = await pool.request()
            .input('whatsapp', sql.VarChar, whatsapp)
            .input('facebook', sql.VarChar, facebook || '')
            .input('instagram', sql.VarChar, instagram || '')
            .input('direccion', sql.VarChar, direccion)
            .input('horario', sql.VarChar, horario)
            .input('id', sql.Int, id)
            .query(query);

        if (result.rowsAffected[0] > 0) {
            res.json({
                success: true,
                message: '✅ Contacto actualizado correctamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: '❌ No se encontró el contacto'
            });
        }
    } catch (error) {
        console.error('❌ Error en PUT /contacto/:id:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar contacto'
        });
    }
});

// ==================== RUTAS DE PROMOCIONES ====================

// Obtener todas las promociones activas
app.get('/promociones', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT * FROM Promocion 
            WHERE esta_activa = 1 
            AND fecha_fin >= GETDATE()
            ORDER BY fecha_inicio DESC
        `);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error en GET /promociones:', err.message);
        res.json([]);
    }
});

// Crear nueva promoción
app.post('/promociones', async (req, res) => {
    try {
        const { nombre, descripcion, descuento, fecha_inicio, fecha_fin, id_producto } = req.body;
        
        // Validaciones básicas
        if (!nombre || !descuento || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, descuento, fecha_inicio y fecha_fin son obligatorios'
            });
        }

        if (descuento < 1 || descuento > 100) {
            return res.status(400).json({
                success: false,
                message: 'El descuento debe estar entre 1% y 100%'
            });
        }

        const pool = await getConnection();
        const query = `
            INSERT INTO Promocion (nombre, descripcion, descuento, fecha_inicio, fecha_fin, id_producto)
            OUTPUT INSERTED.*
            VALUES (@nombre, @descripcion, @descuento, @fecha_inicio, @fecha_fin, @id_producto)
        `;
        
        const result = await pool.request()
            .input('nombre', sql.VarChar(150), nombre)
            .input('descripcion', sql.Text, descripcion || '')
            .input('descuento', sql.Decimal(5,2), descuento)
            .input('fecha_inicio', sql.DateTime, fecha_inicio)
            .input('fecha_fin', sql.DateTime, fecha_fin)
            .input('id_producto', sql.Int, id_producto || null)
            .query(query);
        
        const nuevaPromocion = result.recordset[0];
        
        res.status(201).json({
            success: true,
            message: '✅ Promoción creada correctamente',
            data: nuevaPromocion
        });
    } catch (err) {
        console.error('❌ Error en POST /promociones:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al crear promoción: ' + err.message
        });
    }
});

// Actualizar promoción
app.put('/promociones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, descuento, fecha_inicio, fecha_fin, id_producto, esta_activa } = req.body;
        
        const pool = await getConnection();
        const query = `
            UPDATE Promocion 
            SET nombre = @nombre,
                descripcion = @descripcion,
                descuento = @descuento,
                fecha_inicio = @fecha_inicio,
                fecha_fin = @fecha_fin,
                id_producto = @id_producto,
                esta_activa = @esta_activa
            WHERE id_promocion = @id
        `;
        
        const result = await pool.request()
            .input('nombre', sql.VarChar(150), nombre)
            .input('descripcion', sql.Text, descripcion || '')
            .input('descuento', sql.Decimal(5,2), descuento)
            .input('fecha_inicio', sql.DateTime, fecha_inicio)
            .input('fecha_fin', sql.DateTime, fecha_fin)
            .input('id_producto', sql.Int, id_producto || null)
            .input('esta_activa', sql.Bit, esta_activa !== undefined ? esta_activa : 1)
            .input('id', sql.Int, id)
            .query(query);
        
        if (result.rowsAffected[0] > 0) {
            res.json({
                success: true,
                message: '✅ Promoción actualizada correctamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: '❌ Promoción no encontrada'
            });
        }
    } catch (err) {
        console.error('❌ Error en PUT /promociones/:id:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar promoción'
        });
    }
});

// Eliminar promoción
app.delete('/promociones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Promocion WHERE id_promocion = @id');
        
        if (result.rowsAffected[0] > 0) {
            res.json({
                success: true,
                message: '✅ Promoción eliminada correctamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: '❌ Promoción no encontrada'
            });
        }
    } catch (err) {
        console.error('❌ Error en DELETE /promociones/:id:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar promoción'
        });
    }
});

// Obtener promoción por ID
app.get('/promociones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Promocion WHERE id_promocion = @id');
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({
                success: false,
                message: 'Promoción no encontrada'
            });
        }
    } catch (err) {
        console.error('❌ Error en GET /promociones/:id:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la promoción'
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
                SELECT 'Producto' as tabla, COUNT(*) as total FROM Producto
                UNION ALL SELECT 'Usuario' as tabla, COUNT(*) as total FROM Usuario
                UNION ALL SELECT 'Contacto' as tabla, COUNT(*) as total FROM Contacto
                UNION ALL SELECT 'Promocion' as tabla, COUNT(*) as total FROM Promocion
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

// ==================== MANEJO DE ERRORES ====================

// Ruta no encontrada - CORREGIDO
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('💥 Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// ==================== INICIO DEL SERVIDOR ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Iniciado: ${new Date().toISOString()}`);
    console.log(`🌐 Disponible en: http://localhost:${PORT}`);
});

// ==================== MANEJO DE CIERRE GRACIOSO ====================
process.on('SIGINT', async () => {
    console.log('🛑 Cerrando servidor...');
    try {
        await sql.close();
        console.log('✅ Conexiones de BD cerradas');
    } catch (err) {
        console.error('❌ Error cerrando conexiones:', err);
    }
    process.exit(0);
});