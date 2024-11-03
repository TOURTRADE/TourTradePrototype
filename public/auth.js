const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'tourtrade';

async function registerUser(username, password, email, role) {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword, email, role };

    const result = await db.collection('utenti').insertOne(newUser);
    console.log(`Nuovo utente registrato con ID: ${result.insertedId}`);
    await client.close();
}

async function loginUser(username, password) {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const user = await db.collection('utenti').findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        console.log('Login avvenuto con successo!');
        // Qui puoi gestire la sessione dell'utente
    } else {
        console.log('Credenziali non valide!');
    }

    await client.close();
}

module.exports = { registerUser, loginUser };
