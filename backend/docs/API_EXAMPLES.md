# Ejemplos de uso de la API con imágenes

## Crear producto con imagen usando curl

### PowerShell
```powershell
curl.exe -X POST http://localhost:3000/api/productos `
  -H "Content-Type: multipart/form-data" `
  -F "nombre=Pizza Margarita" `
  -F "descripcion=Deliciosa pizza con tomate y queso" `
  -F "precio=12.99" `
  -F "categoria_id=1" `
  -F "disponible=true" `
  -F "imagen=@C:\ruta\a\tu\imagen.jpg"
```

### Bash / Linux / macOS
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

## Actualizar producto con nueva imagen

### PowerShell
```powershell
curl.exe -X PUT http://localhost:3000/api/productos/1 `
  -H "Content-Type: multipart/form-data" `
  -F "nombre=Pizza Margarita Premium" `
  -F "descripcion=Deliciosa pizza con ingredientes premium" `
  -F "precio=15.99" `
  -F "categoria_id=1" `
  -F "disponible=true" `
  -F "imagen=@C:\ruta\a\tu\nueva-imagen.jpg"
```

### Bash / Linux / macOS
```bash
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Content-Type: multipart/form-data" \
  -F "nombre=Pizza Margarita Premium" \
  -F "descripcion=Deliciosa pizza con ingredientes premium" \
  -F "precio=15.99" \
  -F "categoria_id=1" \
  -F "disponible=true" \
  -F "imagen=@/ruta/a/tu/nueva-imagen.jpg"
```

## Actualizar solo la imagen de un producto

### PowerShell
```powershell
curl.exe -X PATCH http://localhost:3000/api/productos/1/imagen `
  -H "Content-Type: multipart/form-data" `
  -F "imagen=@C:\ruta\a\tu\imagen.jpg"
```

### Bash / Linux / macOS
```bash
curl -X PATCH http://localhost:3000/api/productos/1/imagen \
  -H "Content-Type: multipart/form-data" \
  -F "imagen=@/ruta/a/tu/imagen.jpg"
```

## Crear producto sin imagen

### PowerShell
```powershell
curl.exe -X POST http://localhost:3000/api/productos `
  -H "Content-Type: multipart/form-data" `
  -F "nombre=Ensalada César" `
  -F "descripcion=Fresca ensalada con pollo y aderezo césar" `
  -F "precio=8.99" `
  -F "categoria_id=2" `
  -F "disponible=true"
```

## Ejemplo con Postman

1. **Crear nuevo request**:
   - Method: `POST`
   - URL: `http://localhost:3000/api/productos`

2. **En la pestaña "Body"**:
   - Selecciona `form-data`
   - Agrega los campos:
     - `nombre`: Pizza Margarita (Text)
     - `descripcion`: Deliciosa pizza con tomate y queso (Text)
     - `precio`: 12.99 (Text)
     - `categoria_id`: 1 (Text)
     - `disponible`: true (Text)
     - `imagen`: [Selecciona File y elige una imagen] (File)

3. **Send**

## Ejemplo con JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('nombre', 'Pizza Margarita');
formData.append('descripcion', 'Deliciosa pizza con tomate y queso');
formData.append('precio', '12.99');
formData.append('categoria_id', '1');
formData.append('disponible', 'true');

// Si tienes un input file con id="imageInput"
const fileInput = document.getElementById('imageInput');
if (fileInput.files[0]) {
  formData.append('imagen', fileInput.files[0]);
}

fetch('http://localhost:3000/api/productos', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Ejemplo de respuesta

```json
{
  "id": 1,
  "nombre": "Pizza Margarita",
  "descripcion": "Deliciosa pizza con tomate y queso",
  "precio": "12.99",
  "categoria_id": 1,
  "disponible": true,
  "imagen_url": "https://mesero360-productos.s3.us-east-1.amazonaws.com/productos/1699123456789-123456789.jpg"
}
```

## Formatos de imagen soportados

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## Límite de tamaño

- Tamaño máximo por imagen: **5MB**

## Notas importantes

1. Al actualizar un producto con una nueva imagen, la imagen anterior se elimina automáticamente de S3
2. Al eliminar un producto, su imagen también se elimina de S3
3. El campo `imagen` es opcional al crear o actualizar productos
4. Las imágenes se almacenan en S3 con nombres únicos para evitar colisiones
5. La URL de la imagen es pública y accesible directamente desde el navegador
