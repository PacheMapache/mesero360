# Configuración de AWS S3 para Imágenes de Productos

## Requisitos previos

1. Cuenta de AWS activa
2. Credenciales de AWS (Access Key ID y Secret Access Key)

## Pasos para configurar S3

### 1. Crear un Bucket en S3

1. Inicia sesión en la [Consola de AWS](https://console.aws.amazon.com/)
2. Ve a **S3** en el menú de servicios
3. Haz clic en **"Create bucket"**
4. Configura el bucket:
   - **Bucket name**: `mesero360-productos` (o el nombre que prefieras)
   - **AWS Region**: `us-east-1` (o la región que prefieras)
   - **Block Public Access settings**: Desactiva "Block all public access" para que las imágenes sean públicas
   - Marca la casilla de confirmación que entiendes que el bucket será público
   - Deja las demás opciones por defecto
5. Haz clic en **"Create bucket"**

### 2. Configurar la política del bucket para acceso público

1. En el bucket recién creado, ve a la pestaña **"Permissions"**
2. En **"Bucket Policy"**, haz clic en **"Edit"**
3. Agrega la siguiente política (reemplaza `mesero360-productos` con el nombre de tu bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mesero360-productos/*"
    }
  ]
}
```

4. Haz clic en **"Save changes"**

### 3. Crear un usuario IAM con permisos para S3

1. Ve a **IAM** en la consola de AWS
2. En el menú lateral, haz clic en **"Users"**
3. Haz clic en **"Create user"**
4. Nombre del usuario: `mesero360-s3-user`
5. En "Set permissions", selecciona **"Attach policies directly"**
6. Busca y selecciona la política **"AmazonS3FullAccess"** (o crea una política personalizada más restrictiva)
7. Haz clic en **"Next"** y luego en **"Create user"**

### 4. Crear Access Keys para el usuario

1. Selecciona el usuario que acabas de crear
2. Ve a la pestaña **"Security credentials"**
3. En **"Access keys"**, haz clic en **"Create access key"**
4. Selecciona **"Application running outside AWS"**
5. Haz clic en **"Next"** y luego en **"Create access key"**
6. **IMPORTANTE**: Guarda el **Access Key ID** y el **Secret Access Key** en un lugar seguro

### 5. Configurar las variables de entorno

Copia el archivo `.env.example` a `.env` y actualiza las siguientes variables:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
AWS_S3_BUCKET_NAME=mesero360-productos
```

### 6. Ejecutar la migración de base de datos

Si ya tienes una base de datos existente, ejecuta la migración para agregar el campo `imagen_url`:

```bash
node src/scripts/add-imagen-url.js
```

O si estás creando la base de datos desde cero:

```bash
npm run migrate
```

## Uso de la API

### Crear un producto con imagen

```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: multipart/form-data" \
  -F "nombre=Pizza Margarita" \
  -F "descripcion=Deliciosa pizza con tomate y queso" \
  -F "precio=12.99" \
  -F "categoria_id=1" \
  -F "disponible=true" \
  -F "imagen=@/ruta/a/tu/imagen.jpg"
```

### Actualizar un producto con nueva imagen

```bash
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Content-Type: multipart/form-data" \
  -F "nombre=Pizza Margarita Premium" \
  -F "descripcion=Deliciosa pizza con tomate y queso premium" \
  -F "precio=14.99" \
  -F "categoria_id=1" \
  -F "disponible=true" \
  -F "imagen=@/ruta/a/tu/nueva-imagen.jpg"
```

### Actualizar solo la imagen de un producto

```bash
curl -X PATCH http://localhost:3000/api/productos/1/imagen \
  -H "Content-Type: multipart/form-data" \
  -F "imagen=@/ruta/a/tu/imagen.jpg"
```

## Configuración de CORS en S3 (Opcional)

Si necesitas acceder a las imágenes desde un frontend con dominio diferente, configura CORS:

1. En el bucket de S3, ve a **"Permissions"**
2. En **"Cross-origin resource sharing (CORS)"**, haz clic en **"Edit"**
3. Agrega la siguiente configuración:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Recomendaciones de seguridad

1. **No uses AmazonS3FullAccess en producción**: Crea una política IAM personalizada que solo permita operaciones en tu bucket específico:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::mesero360-productos/*"
    }
  ]
}
```

2. **Rotación de credenciales**: Cambia regularmente tus Access Keys
3. **Variables de entorno**: Nunca subas el archivo `.env` al repositorio
4. **Límite de tamaño**: El sistema actual tiene un límite de 5MB por imagen

## Estructura de almacenamiento en S3

Las imágenes se almacenan en S3 con la siguiente estructura:

```
mesero360-productos/
└── productos/
    ├── 1234567890-123456789.jpg
    ├── 1234567891-987654321.png
    └── ...
```

Cada imagen tiene un nombre único generado con timestamp y número aleatorio para evitar colisiones.

## Costos estimados

- Almacenamiento S3: ~$0.023 por GB/mes
- Transferencia de datos: Primeros 100GB/mes gratis, luego ~$0.09 por GB
- Requests: GET requests: $0.0004 por 1,000 requests

Para un restaurante pequeño/mediano, el costo mensual debería ser menor a $1 USD.
