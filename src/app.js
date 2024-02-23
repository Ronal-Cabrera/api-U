// app.js
const express = require('express');
const mssql = require('mssql');
const dbConfig = require('./dbConfig.js');

const app = express();
const port = 3000;

// Configura la conexión a la base de datos
mssql.connect(dbConfig, (err) => {
  if (err) {
    console.error('Error de conexión:', err);
  } else {
    console.log('Conexión a la base de datos establecida');
  }
});


// Middleware para procesar JSON
app.use(express.json());


// Middleware para gestionar la conexión a la base de datos
app.use(async (req, res, next) => {
  try {
    await mssql.connect(dbConfig);
    console.log('Conexión a la base de datos establecida');
    next();
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err);
    res.status(500).send('Error interno del servidor');
  }
});


app.get('/', async (req, res) => {
    res.send('APIs running');
});



// Rutas CRUD
app.get('/api/pacientes', async (req, res) => {
  try {
    const result = await mssql.query('SELECT * FROM pacientes');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id;
  
    try {
      const result = await mssql.query(`SELECT * FROM Usuarios WHERE Id = ${userId}`);
      
      if (result.recordset.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.status(404).send('Usuario no encontrado');
      }
    } catch (err) {
      console.error('Error al obtener usuario por ID:', err);
      res.status(500).send('Error interno del servidor');
    }
  });

  



// Middleware para desconectar después de manejar la solicitud
app.use((req, res) => {
  mssql.close();
});





// Puedes agregar las rutas para crear, actualizar y eliminar aquí

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
