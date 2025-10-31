// Compatibility entrypoint: ejecuta el servidor que está en src/server.js
try {
  require('./src/server.js');
} catch (err) {
  console.error('Error al iniciar el servidor desde ./src/server.js:', err);
  process.exit(1);
}
