# Backend - Mesero360

API REST para el sistema de gestión de restaurantes Mesero360.

## 📋 Tabla de Contenidos

- [Requisitos previos](#requisitos-previos)
- [Instalación local](#instalación-local)
- [Despliegue con Docker](#despliegue-con-docker)
- [Despliegue en AWS EC2](#despliegue-en-aws-ec2)
- [Configuración de S3](#configuración-de-s3)
- [Variables de entorno](#variables-de-entorno)
- [API Endpoints](#api-endpoints)

## Requisitos previos

- Node.js 20.x o superior
- PostgreSQL 14 o superior
- Docker y Docker Compose (opcional)
- Cuenta de AWS (para S3 y EC2)

## Instalación local

1. Clonar el repositorio:

```bash
git clone https://github.com/PacheMapache/mesero360.git
cd mesero360/backend
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. Inicializar la base de datos:

```bash
npm run migrate
npm run seed  # Opcional: cargar datos de demostración
```

5. Iniciar el servidor:

```bash
npm run dev  # Desarrollo
npm start    # Producción
```

La API estará disponible en `http://localhost:3000`

## Despliegue con Docker

Este README contiene instrucciones para ejecutar el backend usando Docker (docker-compose).

### Instrucciones rápidas:

1. Abrir una terminal en la carpeta `backend/`

2. Construir y levantar los servicios (app, db, pgadmin):

En PowerShell (Windows):

```powershell
cd backend
docker-compose up -d --build
```

3. Verificar servicios y logs:

```bash
# Mostrar contenedores
docker ps

# Ver logs del backend
docker logs -f mesero360-backend
```

Variables de entorno usadas (definidas en `docker-compose.yml`):
- NODE_ENV: production
- PORT: 3000
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET
- AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME

## Despliegue en AWS EC2

Para desplegar en una instancia EC2 de AWS, consulta la guía completa:

**📖 [Guía de Despliegue en EC2](./docs/EC2_DEPLOYMENT.md)**

Incluye:
- Creación y configuración de instancia EC2
- Instalación de dependencias
- Configuración de PostgreSQL o RDS
- Configuración de PM2 para gestión de procesos
- Configuración de Nginx como reverse proxy
- Configuración de SSL con Let's Encrypt
- Monitoreo y mantenimiento

## Configuración de S3

Para almacenar imágenes de productos en AWS S3, consulta la guía completa:

**📖 [Guía de Configuración de S3](./docs/S3_SETUP.md)**

Incluye:
- Creación y configuración de bucket S3
- Configuración de políticas de acceso público
- Creación de usuario IAM con permisos
- Ejemplos de uso de la API
- Recomendaciones de seguridad

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# App
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_aqui

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mesero360
DB_SSL=false

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_S3_BUCKET_NAME=mesero360-productos
```

## API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Usuarios

- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Roles

- `GET /api/roles` - Listar roles
- `GET /api/roles/:id` - Obtener rol
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol

### Categorías

- `GET /api/categorias` - Listar categorías
- `GET /api/categorias/:id` - Obtener categoría
- `POST /api/categorias` - Crear categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Eliminar categoría

### Productos (con soporte para imágenes S3)

- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto
- `POST /api/productos` - Crear producto (multipart/form-data para imagen)
- `PUT /api/productos/:id` - Actualizar producto (multipart/form-data para imagen)
- `PATCH /api/productos/:id/imagen` - Actualizar solo imagen
- `DELETE /api/productos/:id` - Eliminar producto (elimina también la imagen de S3)

### Mesas

- `GET /api/mesas` - Listar mesas
- `GET /api/mesas/:id` - Obtener mesa
- `POST /api/mesas` - Crear mesa
- `PUT /api/mesas/:id` - Actualizar mesa
- `DELETE /api/mesas/:id` - Eliminar mesa

### Pedidos

- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/:id` - Obtener pedido
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/:id` - Actualizar pedido
- `DELETE /api/pedidos/:id` - Eliminar pedido

### Detalle Pedidos

- `GET /api/detalle-pedidos` - Listar detalles de pedidos
- `GET /api/detalle-pedidos/:id` - Obtener detalle
- `POST /api/detalle-pedidos` - Crear detalle
- `PUT /api/detalle-pedidos/:id` - Actualizar detalle
- `DELETE /api/detalle-pedidos/:id` - Eliminar detalle

## Scripts disponibles

```bash
npm start          # Inicia el servidor en modo producción
npm run dev        # Inicia el servidor en modo desarrollo con nodemon
npm run migrate    # Ejecuta las migraciones de base de datos
npm run seed       # Carga datos de demostración
```

## Estructura del proyecto

```
backend/
├── docs/                      # Documentación
│   ├── EC2_DEPLOYMENT.md     # Guía de despliegue en EC2
│   └── S3_SETUP.md           # Guía de configuración S3
├── src/
│   ├── api/                  # Rutas de la API
│   ├── config/               # Configuración
│   ├── controllers/          # Controladores
│   ├── middleware/           # Middleware
│   ├── scripts/              # Scripts de BD
│   ├── services/             # Servicios (S3, PDF, etc.)
│   └── server.js            # Punto de entrada
├── .env.example             # Ejemplo de variables de entorno
├── docker-compose.yml       # Configuración Docker
├── Dockerfile              # Imagen Docker
└── package.json           # Dependencias
```

## Tecnologías utilizadas

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **AWS S3** - Almacenamiento de imágenes
- **AWS SDK** - Integración con servicios AWS
- **Multer** - Manejo de uploads
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

## Soporte

Para reportar problemas o solicitar nuevas características, por favor crea un issue en el repositorio de GitHub.

