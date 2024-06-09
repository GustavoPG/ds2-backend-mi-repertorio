const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = 3000;
const fileJson = path.join(__dirname, 'canciones.json');

// middlewares
app.use(express.json());
app.use(morgan('dev'));

// Servidor
app.listen(port, () => {
  console.log(`Servidor en: http://localhost:${port}`);
});

// Archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Agregar canción
app.post('/canciones', (req, res) => {
  try {
    const canciones = JSON.parse(fs.readFileSync(fileJson, 'utf8'));
    const nuevaCancion = req.body;
    canciones.push(nuevaCancion);
    fs.writeFileSync(fileJson, JSON.stringify(canciones, null, 2));
    res.status(201).json(nuevaCancion);
  } catch (error) {
    return res.status(500).json({ error: 'Error al escribir el archivo, ' + error });
  }
});

// Obtener todas las canciones
app.get('/canciones', (req, res) => {
  try {
    const canciones = JSON.parse(fs.readFileSync(fileJson, 'utf8'));
    res.json(canciones);
  } catch (error) {
    return res.status(500).json({ error: 'Error al leer el archivo, ' + error });
  }
});

// Editar canción
app.put('/canciones/:id', (req, res) => {
  const { id } = req.params;
  try {
    const canciones = JSON.parse(fs.readFileSync(fileJson, 'utf8'));
    const cancionesActualizadas = canciones.map(cancion =>
      Number(cancion.id) === Number(id) ? { ...cancion, ...req.body, id: cancion.id } : cancion
    );
    const cancionActualizada = cancionesActualizadas.find(cancion => Number(cancion.id) === Number(id));
    if (!cancionActualizada) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }
    fs.writeFileSync(fileJson, JSON.stringify(cancionesActualizadas, null, 2));
    res.status(204).send();
    //res.json(cancionActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el archivo: ' + error.message });
  }
});

// Eliminar canción
app.delete('/canciones/:id', (req, res) => {
  const { id } = req.params;
  try {
    const canciones = JSON.parse(fs.readFileSync(fileJson, 'utf8'));
    const cancionesActualizadas = canciones.filter(cancion => Number(cancion.id) !== Number(id));
    if (canciones.length === cancionesActualizadas.length) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }
    fs.writeFileSync(fileJson, JSON.stringify(cancionesActualizadas, null, 2));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el archivo: ' + error.message });
  }
});