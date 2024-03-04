// app.js
const express = require('express');
const mssql = require('mssql');
const bcrypt = require('bcrypt');
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


/*
// Rutas CRUD
app.get('/api/pacientes', async (req, res) => {
  try {
    const result = await mssql.query('SELECT * FROM pacientes');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).send('Error interno del servidor');
  }
});*/

app.get('/api/pacientes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await mssql.query(`SELECT * FROM pacientes WHERE PacienteID = ${id}`);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/api/prescripciones/:id', async (req, res) => {
    const userId = req.params.id;
  
    try {
      const result = await mssql.query(`SELECT * FROM prescripciones INNER JOIN medicamentos ON prescripciones.MedicamentoID = medicamentos.MedicamentoID WHERE PacienteID = ${userId}`);
      
      if (result.recordset.length > 0) {
        res.json(result.recordset);
      } else {
        res.status(404).send('Usuario no encontrado');
      }
    } catch (err) {
      console.error('Error al obtener usuario por ID:', err);
      res.status(500).send('Error interno del servidor');
    }
  });

  
app.post('/api/usuarios', async (req, res) => {
  const { nombre_usuario, password_usuario } = req.body;

  try {
    const result = await mssql.query(`SELECT * FROM usuarios_pacientes WHERE nombre_usuario = '${nombre_usuario}'`);

    if (result.recordset.length > 0) {
      const usuario = result.recordset[0];
      
      // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
      const contraseñaValida = await bcrypt.compare(password_usuario, usuario.password_usuario);

      if (contraseñaValida) {
        res.json(usuario.PacienteID);
      } else {
        res.status(401).send('Contraseña incorrecta');
      }
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (err) {
    console.error('Error al obtener usuario por nombre:', err);
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
