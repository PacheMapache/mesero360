# Guía de Despliegue en AWS EC2

Esta guía te ayudará a desplegar el backend de Mesero360 en una instancia EC2 de AWS.

## Requisitos previos

1. Cuenta de AWS activa
2. Conocimientos básicos de Linux y SSH
3. Bucket S3 configurado (ver [S3_SETUP.md](./S3_SETUP.md))

## Paso 1: Crear una instancia EC2

### 1.1 Lanzar instancia

1. Inicia sesión en la [Consola de AWS](https://console.aws.amazon.com/)
2. Ve a **EC2** en el menú de servicios
3. Haz clic en **"Launch Instance"**

### 1.2 Configurar la instancia

- **Name**: `mesero360-backend`
- **Application and OS Images**:
  - AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
- **Instance type**: 
  - t2.micro (Free tier) o t2.small (recomendado para producción)
- **Key pair**: 
  - Crea un nuevo par de claves o selecciona uno existente
  - Descarga el archivo `.pem` y guárdalo en un lugar seguro
- **Network settings**:
  - Allow SSH traffic from: Your IP (o 0.0.0.0/0 si necesitas acceso desde cualquier lugar)
  - Allow HTTP traffic from the internet
  - Allow HTTPS traffic from the internet
- **Configure storage**: 
  - 20 GB gp3 (ajusta según tus necesidades)

4. Haz clic en **"Launch instance"**

### 1.3 Configurar Security Group

1. Ve a **Security Groups** en EC2
2. Selecciona el Security Group de tu instancia
3. Edita las **Inbound rules** para agregar:
   - Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0 (puerto de la API)
   - Type: PostgreSQL, Port: 5432, Source: Security Group ID (solo si usas RDS)

## Paso 2: Conectarse a la instancia

### 2.1 Obtener la IP pública

1. En la consola de EC2, selecciona tu instancia
2. Copia la **Public IPv4 address**

### 2.2 Conectar via SSH

En PowerShell:

```powershell
# Configurar permisos del archivo .pem (solo la primera vez)
icacls "C:\ruta\a\tu\archivo.pem" /inheritance:r
icacls "C:\ruta\a\tu\archivo.pem" /grant:r "$($env:USERNAME):(R)"

# Conectar
ssh -i "C:\ruta\a\tu\archivo.pem" ubuntu@<IP_PUBLICA>
```

## Paso 3: Instalar dependencias en EC2

Una vez conectado a la instancia:

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar Git
sudo apt install -y git

# Instalar PM2 (process manager)
sudo npm install -g pm2

# Instalar PostgreSQL (si no usas RDS)
sudo apt install -y postgresql postgresql-contrib
```

## Paso 4: Configurar PostgreSQL (si no usas RDS)

```bash
# Cambiar al usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE mesero360;
CREATE USER mesero360_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE mesero360 TO mesero360_user;
\q

# Configurar acceso remoto (opcional)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Descomentar y cambiar: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Agregar: host all all 0.0.0.0/0 md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

## Paso 5: Clonar y configurar el proyecto

```bash
# Crear directorio para la aplicación
cd /home/ubuntu
mkdir apps
cd apps

# Clonar el repositorio
git clone https://github.com/PacheMapache/mesero360.git
cd mesero360/backend

# Instalar dependencias
npm install --production

# Crear archivo .env
nano .env
```

Contenido del archivo `.env`:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=mesero360_user
DB_PASSWORD=tu_password_seguro
DB_NAME=mesero360
DB_SSL=false

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_S3_BUCKET_NAME=mesero360-productos
```

Guarda el archivo con `Ctrl+X`, luego `Y`, luego `Enter`.

## Paso 6: Inicializar la base de datos

```bash
# Ejecutar migraciones
npm run migrate

# Cargar datos de demostración (opcional)
npm run seed
```

## Paso 7: Configurar PM2

```bash
# Iniciar la aplicación con PM2
pm2 start src/server.js --name mesero360-backend

# Configurar PM2 para iniciar en el arranque
pm2 startup
# Ejecuta el comando que PM2 te muestre

pm2 save

# Ver logs
pm2 logs mesero360-backend

# Ver estado
pm2 status
```

## Paso 8: Configurar Nginx como reverse proxy (Recomendado)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/mesero360
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;  # o usa la IP pública

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/mesero360 /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Habilitar Nginx en el arranque
sudo systemctl enable nginx
```

## Paso 9: Configurar HTTPS con Let's Encrypt (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# El certificado se renovará automáticamente
```

## Paso 10: Configurar Firewall

```bash
# Configurar UFW (Uncomplicated Firewall)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Comandos útiles de PM2

```bash
# Reiniciar la aplicación
pm2 restart mesero360-backend

# Detener la aplicación
pm2 stop mesero360-backend

# Ver logs en tiempo real
pm2 logs mesero360-backend --lines 100

# Ver métricas
pm2 monit

# Recargar la aplicación sin downtime
pm2 reload mesero360-backend
```

## Actualizar la aplicación

```bash
cd /home/ubuntu/apps/mesero360/backend

# Detener la aplicación
pm2 stop mesero360-backend

# Obtener últimos cambios
git pull origin main

# Instalar nuevas dependencias
npm install --production

# Ejecutar migraciones si hay cambios en la BD
npm run migrate

# Reiniciar la aplicación
pm2 restart mesero360-backend
```

## Monitoreo y mantenimiento

### Ver logs de la aplicación

```bash
pm2 logs mesero360-backend
```

### Ver logs de Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup de base de datos

```bash
# Crear backup
pg_dump -U mesero360_user mesero360 > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U mesero360_user mesero360 < backup_20231104.sql
```

## Configuración de RDS (Alternativa a PostgreSQL local)

Si prefieres usar AWS RDS en lugar de PostgreSQL local:

1. Ve a **RDS** en la consola de AWS
2. Haz clic en **"Create database"**
3. Selecciona **PostgreSQL**
4. Configuración:
   - Template: Free tier (o Production según necesites)
   - DB instance identifier: `mesero360-db`
   - Master username: `postgres`
   - Master password: Crea una contraseña segura
   - DB instance class: db.t3.micro
   - Storage: 20 GB gp3
   - VPC: La misma que tu instancia EC2
   - Public access: No
   - VPC security group: Crear nuevo o usar existente
5. Crear base de datos

Luego, actualiza tu `.env`:

```env
DB_HOST=mesero360-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_rds
DB_NAME=mesero360
DB_SSL=true
```

## Solución de problemas comunes

### La aplicación no inicia

```bash
# Verificar logs
pm2 logs mesero360-backend

# Verificar que el puerto no esté en uso
sudo lsof -i :3000

# Reiniciar PM2
pm2 restart mesero360-backend
```

### No se puede conectar a la base de datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Probar conexión
psql -U mesero360_user -d mesero360 -h localhost
```

### Nginx muestra error 502

```bash
# Verificar que la aplicación esté corriendo
pm2 status

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

## Costos estimados en AWS

- **EC2 t2.micro**: Gratis el primer año, luego ~$8.50/mes
- **EC2 t2.small**: ~$17/mes
- **RDS db.t3.micro**: Gratis el primer año, luego ~$15/mes
- **S3**: ~$1/mes (con uso moderado)
- **Transferencia de datos**: Primeros 100GB/mes gratis

**Total estimado**: $0-$5/mes (primer año con free tier) o $25-$35/mes después

## Seguridad adicional

1. **Cambiar puerto SSH por defecto**
2. **Configurar fail2ban para prevenir ataques de fuerza bruta**
3. **Habilitar backups automáticos en RDS**
4. **Configurar CloudWatch para monitoreo**
5. **Usar AWS Secrets Manager para credenciales sensibles**

## Próximos pasos

- Configurar dominio personalizado
- Implementar CI/CD con GitHub Actions
- Configurar balanceador de carga (ELB)
- Implementar Auto Scaling
- Configurar CloudFront para CDN
