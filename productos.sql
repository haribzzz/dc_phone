INSERT INTO Producto (nombre, marca, modelo, precio, stock, id_categoria, descripcion, imagen, esta_activo, fecha_creacion)
VALUES 
('A06 4/128GB','Samsung','A06 4/128GB',90.00, 3, 1,'Smartphone Samsung A06 con 4GB RAM y 128GB de almacenamiento, ideal para tareas básicas y redes sociales.','images/GalaxyA06_4_128.jpeg',1,GETDATE()),
('A06 5G 4/128GB','Samsung','A06 5G 4/128GB',100.00, 2, 1,'Smartphone Samsung A06 5G con 4GB RAM y 128GB de almacenamiento, conectividad 5G para mayor velocidad.','images/GalaxyA06_5G_4_128.jpeg',1,GETDATE()),
('A07 4/64GB','Samsung','A07 4/64GB',110.00, 4, 1,'Smartphone Samsung A07 con 4GB RAM y 64GB de almacenamiento, batería de larga duración.','images/GalaxyA07_4_64.jpeg',1,GETDATE()),
('A07 4/128GB','Samsung','A07 4/128GB',120.00, 3, 1,'Smartphone Samsung A07 con 4GB RAM y 128GB de almacenamiento, ideal para multimedia y apps.','images/GalaxyA07_4_128.jpeg',1,GETDATE()),

-- Dispositivos más importantes / representativos
('A16 4G 6/128GB','Samsung','A16 4G 6/128GB',125.00, 6, 1,'Smartphone Samsung A16 4G con 6GB RAM y 128GB de almacenamiento, ideal para multitarea.','images/GalaxyA16_4G_4_128.jpeg',1,GETDATE()),
('A16 5G 6/128GB','Samsung','A16 5G 6/128GB',165.00, 4, 1,'Smartphone Samsung A16 5G con 6GB RAM y 128GB de almacenamiento, compatible con redes 5G.','images/GalaxyA06_5G_4_128.jpeg',1,GETDATE()),
('A36 5G 8/256GB','Samsung','A36 5G 8/256GB',220.00, 0, 1,'Smartphone Samsung A36 5G con 8GB RAM y 256GB de almacenamiento, óptimo para multitarea.','images/GalaxyA36_5G_8_256.jpeg',1,GETDATE()),
('A56 5G 12/256GB','Samsung','A56 5G 12/256GB',370.00, 4, 1,'Smartphone Samsung A56 5G con 12GB RAM y 256GB de almacenamiento, ideal para multitarea y alto rendimiento.','images/GalaxyA56_5G_12_256.jpeg',1,GETDATE()),
('S22 ULTRA 5G 128GB OPENBOX','Samsung','S22 ULTRA 5G 128GB',460.00, 2, 1,'Samsung Galaxy S22 Ultra 5G con 128GB de almacenamiento, cámara avanzada y diseño premium.','images/S22Ultra_5G_128.jpeg',1,GETDATE()),
('S23 ULTRA 5G 256GB OPENBOX','Samsung','S23 ULTRA 5G 256GB',590.00, 2, 1,'Samsung Galaxy S23 Ultra 5G con 256GB de almacenamiento, gran desempeño y cámara profesional.','images/S23Ultra_5G_256.jpeg',1,GETDATE()),
('S24 ULTRA 12/256GB','Samsung','S24 ULTRA 12/256GB',816.00, 6, 1,'Samsung Galaxy S24 Ultra con 12GB RAM y 256GB de almacenamiento, diseño premium y cámara avanzada.','images/S24Ultra_12_256.jpeg',1,GETDATE()),
('S25 ULTRA 12/512GB','Samsung','S25 ULTRA 12/512GB',1050.00, 5, 1,'Samsung Galaxy S25 Ultra con 12GB RAM y 512GB de almacenamiento, alto rendimiento y pantalla premium.','images/S25Ultra_12_512.jpeg',1,GETDATE()),
('Z FOLD7 12/512GB','Samsung','Z FOLD7 12/512GB',1550.00, 1, 1,'Samsung Z Fold7 con 12GB RAM y 512GB de almacenamiento, pantalla flexible y productividad máxima.','images/Z_FOLD7_12_512.jpeg',1,GETDATE());

INSERT INTO Producto (nombre, marca, modelo, precio, stock, id_categoria, descripcion, imagen, esta_activo, fecha_creacion)
VALUES
-- BLOQUE REALME
('Realme Note 50 3/64GB','Realme','Realme Note 50 3/64GB',120.00,5,1,'Realme Note 50 con 3GB RAM y 64GB almacenamiento, ideal para uso diario y redes sociales.','images/Realme_Note50_3_64.jpeg',1,GETDATE()),
('Realme C75 8/256GB','Realme','Realme C75 8/256GB',180.00,5,1,'Realme C75 con 8GB RAM y 256GB almacenamiento, excelente rendimiento para apps y fotos.','images/Realme_C75_8_256.jpeg',1,GETDATE());

INSERT INTO Producto (nombre, marca, modelo, precio, stock, id_categoria, descripcion, imagen, esta_activo, fecha_creacion)
VALUES 
-- BLOQUE BLU
('G43 2+2/64GB','BLU','G43 2+2/64GB',80.00,5,1,'BLU G43 con 2+2GB RAM y 64GB almacenamiento, ideal para uso básico.','images/G43_2_2_64.jpeg',1,GETDATE()),
('TANK MEGA tecla','BLU','TANK MEGA tecla',0.00,0,1,'BLU TANK MEGA, teléfono sencillo con teclado físico, buena batería.','images/TANK_MEGA_tecla.jpeg',0,GETDATE());

INSERT INTO Producto (nombre, marca, modelo, precio, stock, id_categoria, descripcion, imagen, esta_activo, fecha_creacion)
VALUES
-- Primeros 3 dispositivos
('Redmi A5 3/64GB','Xiaomi','Redmi A5 3/64GB',90.00,6,1,'Redmi A5 con 3GB RAM y 64GB almacenamiento, ideal para uso básico y redes sociales.','images/RedmiA5_3_64.jpeg',1,GETDATE()),
('Redmi A5 4/128GB','Xiaomi','Redmi A5 4/128GB',90.00,4,1,'Redmi A5 con 4GB RAM y 128GB almacenamiento, buen rendimiento para apps y fotos.','images/RedmiA5_4_128.jpeg',1,GETDATE()),
('Redmi 12 4/128GB','Xiaomi','Redmi 12 4/128GB',115.00,1,1,'Redmi 12 con 4GB RAM y 128GB almacenamiento, batería duradera y pantalla clara.','images/Redmi12_4_128.jpeg',1,GETDATE()),

-- Modelos representativos / más importantes
('Redmi 14C 8/256GB','Xiaomi','Redmi 14C 8/256GB',120.00,3,1,'Redmi 14C con 8GB RAM y 256GB almacenamiento, ideal para multitarea y juegos ligeros.','images/Redmi14C_8_256.jpeg',1,GETDATE()),
('Redmi 15 8/256GB','Xiaomi','Redmi 15 8/256GB',160.00,4,1,'Redmi 15 con 8GB RAM y 256GB almacenamiento, excelente para apps, fotos y videos.','images/Redmi15_8_256.jpeg',1,GETDATE()),
('Redmi Note 14 Pro Plus 5G 12/512GB','Xiaomi','Redmi Note 14 Pro Plus 5G 12/512GB',360.00,5,1,'Redmi Note 14 Pro Plus 5G con 12GB RAM y 512GB almacenamiento, potencia máxima y conectividad 5G.','images/RedmiNote14ProPlus_5G_12_512.jpeg',1,GETDATE()),
('Poco X7 12/512GB','POCO','Poco X7 12/512GB',275.00,2,1,'Poco X7 con 12GB RAM y 512GB almacenamiento, gran desempeño y batería duradera.','images/PocoX7_12_512.jpeg',1,GETDATE()),
('Poco X7 Pro 12/512GB','POCO','Poco X7 Pro 12/512GB',335.00,5,1,'Poco X7 Pro con 12GB RAM y 512GB almacenamiento, excelente para juegos y multimedia.','images/PocoX7_Pro_12_512.jpeg',1,GETDATE());

INSERT INTO Producto (nombre, marca, modelo, precio, stock, id_categoria, descripcion, imagen, esta_activo, fecha_creacion)
VALUES 
-- BLOQUE HONOR
-- Primeros 3 dispositivos
('HONOR Play 9A 4/128GB','HONOR','HONOR Play9A 4/128GB',80.00,6,1,'HONOR Play9A con 4GB RAM y 128GB almacenamiento, buen desempeño y cámara decente.','images/HONOR_Play9A_4_128.jpeg',1,GETDATE()),
('HONOR X5b 4/64GB','HONOR','HONOR X5b 4/64GB',87.00,4,1,'HONOR X5b con 4GB RAM y 64GB almacenamiento, teléfono ligero y funcional.','images/HONORX5b_4_64.jpeg',1,GETDATE()),
('HONOR X5b Plus 4/256GB','HONOR','HONOR X5b Plus 4/256GB',120.00,3,1,'HONOR X5b Plus con 4GB RAM y 256GB almacenamiento, espacio suficiente para apps y fotos.','images/HONORX5b_Plus_4_256.jpeg',1,GETDATE()),

-- Modelos representativos / más importantes
('HONOR X6b 6/256GB','HONOR','HONOR X6b 6/256GB',130.00,3,1,'HONOR X6b con 6GB RAM y 256GB almacenamiento, ideal para multitarea.','images/HONORX6b_6_256.jpeg',1,GETDATE()),
('HONOR X6c 8/256GB','HONOR','HONOR X6c 8/256GB',153.00,2,1,'HONOR X6c con 8GB RAM y 256GB almacenamiento, excelente para apps y juegos ligeros.','images/HONORX6c_8_256.jpeg',1,GETDATE()),
('HONOR X7c 8/256GB','HONOR','HONOR X7c 8/256GB',160.00,2,1,'HONOR X7c con 8GB RAM y 256GB almacenamiento, ideal para multitarea y multimedia.','images/HONORX7c_8_256.jpeg',1,GETDATE()),
('HONOR X8c 8/512GB','HONOR','HONOR X8c 8/512GB',265.00,2,1,'HONOR X8c con 8GB RAM y 512GB almacenamiento, gran capacidad para fotos y apps.','images/HONORX8c_8_512.jpeg',1,GETDATE()),
('HONOR Magic 7 Lite 8/512GB','HONOR','HONOR Magic 7 Lite 8/512GB',310.00,4,1,'HONOR Magic 7 Lite con 8GB RAM y 512GB almacenamiento, espacio extra para apps y fotos.','images/HONOR_Magic7LITE_8_512.jpeg',1,GETDATE()),
('HONOR 400 5G 12/512GB','HONOR','HONOR 400 5G 12/512GB',350.00,3,1,'HONOR 400 5G con 12GB RAM y 512GB almacenamiento, ideal para multitarea y multimedia.','images/HONOR400_5G_12_256.jpeg',1,GETDATE());

INSERT INTO Producto (nombre, marca, modelo, precio, stock, id_categoria, descripcion, imagen, esta_activo, fecha_creacion)
VALUES 
('INFINIX Smart 10 3/64GB','INFINIX','Smart 10 3/64GB',70.00, 8, 1,'Smartphone Infinix Smart 10 con 3GB RAM y 64GB de almacenamiento','images/INFINIX_SMART10_4G_3_64.jpeg',1,GETDATE()),
('INFINIX Hot 50i 8/256GB','INFINIX','Hot 50i 8/256GB',120.00, 4, 1,'Infinix Hot 50i con 8GB RAM y 256GB de almacenamiento, ideal para multimedia','images/INFINIX_Hot50i_8_256.jpeg',1,GETDATE()),
('INFINIX Note 40 5G 8/256GB','INFINIX','Note 40 5G 8/256GB',175.00, 3, 1,'Infinix Note 40 5G con 8GB RAM, 256GB y compatibilidad 5G','images/INFINIX_Note40_5G_8_256.jpeg',1,GETDATE()),
('INFINIX GT 30 Pro 5G 12/512GB','INFINIX','GT 30 Pro 5G 12/512GB',320.00, 5, 1,'Infinix GT 30 Pro 5G con 12GB RAM y 512GB almacenamiento','images/INFINIX_GT30Pro_5G_12_512.jpeg',1,GETDATE()),

('TECNO Spark Go1 4/128GB','TECNO','Spark Go 1 4/128GB',80.00, 2, 1,'TECNO Spark Go 1 con 4GB RAM y 128GB almacenamiento','images/TECNO_Spark_Go1_4_128.jpeg',1,GETDATE()),
('TECNO Spark 30c 8/256GB TRANSFORMERS','TECNO','Spark 30c 8/256GB',120.00, 3, 1,'TECNO Spark 30c edición Transformers con 8GB RAM y 256GB','images/TECNO_Spark30c_8_256.jpeg',1,GETDATE()),
('TECNO Camon 40 Pro 8/256GB','TECNO','Camon 40 Pro 8/256GB',230.00, 3, 1,'TECNO Camon 40 Pro con 8GB RAM y 256GB almacenamiento','images/TECNO_Camon40Pro_8_256.jpeg',1,GETDATE()),

('ITEL A50 4/64GB','ITEL','A50 4/64GB',65.00, 2, 1,'ITEL A50 con 4GB RAM y 64GB almacenamiento','images/ITELA50_4_64.jpeg',1,GETDATE()),
('Itel S25 Ultra 8/256GB','ITEL','S25 Ultra 8/256GB',160.00, 2, 1,'ITEL S25 Ultra con 8GB RAM y 256GB almacenamiento','images/ITELS25Ultra_8_256.jpeg',1,GETDATE()),

('Infinix XPad 11" 4/128GB','Infinix','XPad 11" 4/128GB',175.00, 2, 2,'Tablet Infinix XPad 11\" con 4GB RAM y 128GB almacenamiento','images/InfinixXpad11_4_128.jpeg',1,GETDATE()),
('Redmi Pad SE 8.7 4/128GB','Xiaomi','Redmi Pad SE 8.7 4/128GB',135.00, 1, 2,'Redmi Pad SE 8.7 con 4GB RAM y 128GB almacenamiento','images/RedmiPadSE_4_128.jpeg',1,GETDATE()),
('Galaxy Tab S10 Ultra 12/256GB WIFI','Samsung','Galaxy Tab S10 Ultra 12/256GB',840.00, 1, 2,'Samsung Galaxy Tab S10 Ultra con 12GB RAM y 256GB almacenamiento','images/GalaxyTabS10Ultra_12_256_WIFI.jpeg',1,GETDATE()),

('Iphone 11 64GB EN CAJA','Iphone','Iphone 11 64GB',260.00, 3, 1,'iPhone 11 con 64GB almacenamiento, cámara dual','images/Iphone11_64.jpeg',1,GETDATE()),
('Iphone 13 Pro Max 128GB EN CAJA','Iphone','Iphone 13 Pro Max 128GB',550.00, 2, 1,'iPhone 13 Pro Max con 128GB almacenamiento, cámara triple','images/Iphone13ProMax_128.jpeg',1,GETDATE()),
('Iphone 16 PRO MAX 512GB ESIM','Iphone','Iphone 16 PRO MAX 512GB',0.00, 0, 1,'iPhone 16 Pro Max con 512GB almacenamiento y eSIM','images/Iphone16ProMax_512_ESIM.jpeg',0,GETDATE()),
('iphone 17 pro max 512gb esim','Iphone','iPhone 17 Pro Max 512GB',1750.00, 2, 1,'iPhone 17 Pro Max con 512GB almacenamiento y eSIM','images/Iphone17ProMax_512_ESIM.jpeg',1,GETDATE()),

('PS5 DIGITAL','Sony','PS5 DIGITAL',500.00, 3, 3,'PlayStation 5 Digital Edition, consola de última generación','images/PS5_DIGITAL.jpeg',1,GETDATE()),
('PS5 PRO 2TB','Sony','PS5 PRO 2TB',880.00, 1, 3,'PlayStation 5 Pro con 2TB almacenamiento','images/PS5_PRO_2TB.jpeg',1,GETDATE()),

('Switch 2','Nintendo','Switch 2',590.00, 2, 3,'Nintendo Switch 2, consola híbrida portátil y sobremesa','images/Switch2.jpeg',1,GETDATE());

