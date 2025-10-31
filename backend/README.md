Backend - Mesero360 (Despliegue con Docker)

Este README contiene instrucciones para ejecutar el backend usando Docker (docker-compose).

Requisitos previos:
- Docker y Docker Compose instalados en la máquina.

Instrucciones rápidas:

1. Abrir una terminal en la carpeta `backend/`.

2. Construir y levantar los servicios (app, db, pgadmin):

   En PowerShell (Windows):

   cd backend
   docker-compose up -d --build

3. Verificar servicios y logs:

   # Mostrar contenedores
   docker ps

   # Ver logs del backend
   docker logs -f mesero360-backend

Variables de entorno usadas (definidas en `docker-compose.yml`):
- NODE_ENV: production
- PORT: 3000
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET

Notas importantes y bloqueos conocidos:

- La configuración de despliegue por Docker está incluida en `docker-compose.yml` y en este `Dockerfile`.
- El servicio `db` usa PostgreSQL y `pgadmin` está disponible en el puerto 5050.
- Actualmente los archivos de conexión a la base de datos y la lógica de modelos/controles aparecen vacíos o como placeholders (por ejemplo `src/config/database.js` está vacío y varios archivos en `src/models` y `src/controllers` están vacíos). Esto es un bloqueo funcional: antes de ejecutar la API en producción es necesario implementar la conexión a la BD y los endpoints.

Recomendaciones rápidas:

1. Implementar `src/config/database.js` para realizar la conexión con PostgreSQL usando `pg` o un ORM (Sequelize, TypeORM, etc.).
2. Añadir migraciones o un script de inicialización para crear tablas (puede ejecutarse desde una tarea de `docker-compose` o manualmente).
3. Agregar un healthcheck básico en `docker-compose.yml` para validar que la API y la BD estén listas.
4. Si el contenedor va a usarse en producción, considerar no montar el volumen de código (evitar `.:/usr/src/app`) y usar la imagen construida; para desarrollo, dejar el volumen para hot-reload.

¿Qué falta para una entrega completa?
- Implementar los modelos y controladores.
- Implementar la capa de persistencia (`src/config/database.js`).
- Agregar pruebas unitarias y / o integración.
- Añadir un archivo `docker-compose.prod.yml` si quieres un despliegue distinto para producción (sin montar volúmenes, con variables secretas desde `env_file` o un secret manager).
