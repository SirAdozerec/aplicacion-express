//Importamos las librarías requeridas
const cors = require('cors');
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express()
app.use(cors());

//Creamos un parser de tipo application/json
//Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json()

// Abre la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla tareas creada o ya existente.');
        }
    });
});


app.post('/agrega_todo', jsonParser, function (req, res) {
    //Imprimimos el contenido del campo todo
    const { todo } = req.body;
    
    console.log(todo);

    if (!todo) {
        res.status(400).send('Falta información necesaria');
        return;
    }

    const stmt  =  db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, unixepoch())');

    stmt.run(todo, (err) => {
        if (err) {
            console.error("Error running stmt:", err);
            res.status(500).send(err);
            return;
        } else {
            console.log("Insert was successful!");
        }
    });

    stmt.finalize();
    
    //Regreso de respuesta
    res.status(201).json({ message: 'Tarea agregada' });
})

// Endpoint para obtener todas las tareas
app.get('/obtiene_todos', function (req, res) {
    
    console.log("Se recibió una petición GET para /obtiene_todos");

    // Consulta SQL para seleccionar todo
    const consulta = "SELECT * FROM todos";
    
    db.all(consulta, [], (err, resultados) => {
        
        if (err) {
            console.error("Hubo un error con la base de datos:", err.message);
            res.status(500).json({ "error": err.message });
        } else {
            console.log("Enviando la lista de tareas:", resultados);
            res.status(200).json({
                "tareas": resultados
            });
        }
    });
});

app.get('/', function (req, res) {
    //Regreso de respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok2' }));
})

//Creamos un endpoint de login que recibe los datos como json
app.post('/login', jsonParser, function (req, res) {
    //Imprimimos el contenido del body
    console.log(req.body);

    //Regreso de respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
})

//Corremos el server
const port = process.env.PORT || 3000; 
const host = '0.0.0.0';

app.listen(port, host, () => {
    console.log(`Aplicación corriendo en http://${host}:${port}`)
})