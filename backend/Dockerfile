# Usar la imagen oficial de Node.js 18 (alpine para imagen pequeña)
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /usr/src/app

# Establecer entorno por defecto
ENV NODE_ENV=production

# Copiar package.json y package-lock si existe e instalar dependencias de producción
COPY package*.json ./

# Preferir 'npm ci' cuando haya package-lock; si falla, caer a 'npm install --production'
RUN npm ci --only=production || npm install --production

# Copiar el resto del código
COPY . .

# Exponer puerto de la app
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
