const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bcrypt = require('bcryptjs'); // Importa bcrypt per la cifratura delle password

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());
app.use(express.static('public'));

// Configura le intestazioni di sicurezza, inclusa la CSP
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'http://localhost:3000'],
        connectSrc: ["'self'", 'http://localhost:3000'],
    },
}));

// Connessione a MongoDB
mongoose.connect('mongodb://localhost:27017/tourtrade', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connesso a MongoDB'))
    .catch(err => console.error('Errore di connessione a MongoDB:', err));

// Schema per i messaggi
const messageSchema = new mongoose.Schema({
    sender: String,
    message: String,
    agent: String,
});
const Message = mongoose.model('Message', messageSchema);

// Schema per le offerte
const offerSchema = new mongoose.Schema({
    title: String,
    type: String,
    description: String,
    departure: String,
    startDate: Date,
    endDate: Date,
    price: Number,
    agencyId: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
});
const Offer = mongoose.model('Offer', offerSchema);

// Schema per gli utenti con password cifrata
const userSchema = new mongoose.Schema({
    userType: { type: String, enum: ['customer', 'agency', 'freelancer'], required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: String,
});
const User = mongoose.model('User', userSchema);

// Schema per i pacchetti
const packageSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    departureLocation: String,
    startDate: Date,
    endDate: Date,
    agencyId: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});
const Package = mongoose.model('Package', packageSchema);

// Schema per le esperienze di tour
const tourSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    location: String,
    startDate: Date,
    endDate: Date,
    agencyId: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});
const Tour = mongoose.model('Tour', tourSchema);

// Schema per i punteggi
const scoreSchema = new mongoose.Schema({
    agencyId: String,
    totalSales: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    userInteractions: { type: Number, default: 0 }
});
const Score = mongoose.model('Score', scoreSchema);

// Schema per le agenzie
const agencySchema = new mongoose.Schema({
    name: String,
    email: String,
    profileImage: String,
});
const Agency = mongoose.model('Agency', agencySchema);

// Endpoint per la registrazione con cifratura della password
app.post('/api/signup', async (req, res) => {
    const { userType, username, email, password, profileImage } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Cifra la password
        const newUser = new User({
            userType,
            username,
            email,
            password: hashedPassword,
            profileImage
        });

        await newUser.save();
        res.status(201).json({ message: 'Utente registrato con successo' });
    } catch (error) {
        res.status(400).json({ error: 'Errore durante la registrazione' });
    }
});

// Endpoint per il login con verifica della password cifrata
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Email o password non validi' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email o password non validi' });
        }

        res.status(200).json({ message: 'Login avvenuto con successo', userType: user.userType });
    } catch (error) {
        res.status(500).json({ error: 'Errore durante il login' });
    }
});

// Endpoint per inviare un messaggio
app.post('/api/messages', async (req, res) => {
    const { sender, message, agent } = req.body;
    const newMessage = new Message({ sender, message, agent });
    try {
        await newMessage.save();
        res.status(201).send();
    } catch (error) {
        res.status(400).send(error);
    }
});

// Endpoint per inviare un'offerta privata
app.post('/api/private-offers', async (req, res) => {
    const { title, type, description, departure, startDate, endDate, price, agencyId } = req.body;
    const newOffer = new Offer({
        title,
        type,
        description,
        departure,
        startDate,
        endDate,
        price,
        agencyId
    });
    try {
        await newOffer.save();
        res.status(201).send();
    } catch (error) {
        res.status(400).send(error);
    }
});

// Endpoint per ottenere tutte le offerte
app.get('/api/offers', async (req, res) => {
    try {
        const offers = await Offer.find();
        res.json(offers);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint per accettare un'offerta
app.post('/api/offers/accept', async (req, res) => {
    const { offerId } = req.body;
    try {
        const offer = await Offer.findByIdAndUpdate(offerId, { status: 'accepted' }, { new: true });
        res.status(200).json(offer);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Endpoint per rifiutare un'offerta
app.post('/api/offers/reject', async (req, res) => {
    const { offerId } = req.body;
    try {
        const offer = await Offer.findByIdAndUpdate(offerId, { status: 'rejected' }, { new: true });
        res.status(200).json(offer);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Endpoint per aggiornare i punteggi
app.post('/api/update-scores', async (req, res) => {
    const { agencyId, sales, reviews, userInteractions } = req.body;

    let scoreData = await Score.findOne({ agencyId });
    if (!scoreData) {
        scoreData = new Score({ agencyId, totalSales: 0, totalReviews: 0, totalPoints: 0, userInteractions: 0 });
    }

    scoreData.totalSales += sales;
    scoreData.totalReviews += reviews;
    scoreData.userInteractions += userInteractions;

    let reviewPoints = 0;
    if (reviews === 1) reviewPoints = -1;
    else if (reviews === 2) reviewPoints = -0.5;
    else if (reviews === 3) reviewPoints = 0;
    else if (reviews === 4) reviewPoints = 1;
    else if (reviews === 5) reviewPoints = 2;

    scoreData.totalPoints += reviewPoints + (userInteractions > 0 ? Math.floor(userInteractions / 100) * 5 : 0);

    try {
        await scoreData.save();
        res.status(200).json(scoreData);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Endpoint per ottenere tutte le agenzie
app.get('/api/agencies', async (req, res) => {
    try {
        const agencies = await Agency.find();
        res.json(agencies);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint per ottenere i punteggi delle agenzie
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find();
        res.json(scores);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint per ottenere le informazioni dell'agenzia
app.get('/api/agencies/:id', async (req, res) => {
    try {
        const agency = await Agency.findById(req.params.id);
        if (!agency) {
            return res.status(404).send('Agenzia non trovata');
        }
        res.json(agency);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint per creare un'agenzia
app.post('/api/agencies', async (req, res) => {
    const { name, email, profileImage } = req.body;
    const newAgency = new Agency({ name, email, profileImage });
    try {
        await newAgency.save();
        res.status(201).json(newAgency);
    } catch (error) {
        res.status(400).json({ error: 'Errore durante la creazione dell\'agenzia' });
    }
});

// Endpoint per aggiornare i dettagli dell'agenzia
app.patch('/api/agencies/:id', async (req, res) => {
    const { id } = req.params;
    const { profileImage } = req.body;

    try {
        const updatedAgency = await Agency.findByIdAndUpdate(
            id,
            { profileImage },
            { new: true }
        );

        if (!updatedAgency) {
            return res.status(404).send('Agenzia non trovata');
        }

        res.status(200).json(updatedAgency);
    } catch (error) {
        res.status(400).send('Errore durante l\'aggiornamento dell\'agenzia');
    }
});

// Endpoint per ottenere gli elementi in trending
app.get('/api/trending', async (req, res) => {
    try {
        const scores = await Score.find().sort({ totalPoints: -1 }).limit(10);
        const agencyIds = scores.map(score => score.agencyId);
        const trendingAgencies = await Agency.find({ _id: { $in: agencyIds } });

        const trendingTours = await Tour.find().sort({ totalPoints: -1 }).limit(10);
        const trendingPackages = await Package.find().sort({ totalPoints: -1 }).limit(10);

        const agenciesWithScores = trendingAgencies.map(agency => {
            const score = scores.find(s => s.agencyId === agency._id.toString());
            return {
                ...agency._doc,
                totalSales: score.totalSales,
                totalReviews: score.totalReviews,
                totalPoints: score.totalPoints,
                userInteractions: score.userInteractions
            };
        });

        res.json({ agencies: agenciesWithScores, tours: trendingTours, packages: trendingPackages });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint per creare un pacchetto
app.post('/api/packages', async (req, res) => {
    const { title, description, price, departureLocation, startDate, endDate, agencyId } = req.body;
    const newPackage = new Package({
        title,
        description,
        price,
        departureLocation,
        startDate,
        endDate,
        agencyId
    });
    try {
        await newPackage.save();
        res.status(201).json(newPackage);
    } catch (error) {
        res.status(400).json({ error: 'Errore durante la creazione del pacchetto' });
    }
});

// Endpoint per ottenere tutti i pacchetti
app.get('/api/packages', async (req, res) => {
    try {
        const packages = await Package.find();
        res.json(packages);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint per creare un'esperienza di tour
app.post('/api/tours', async (req, res) => {
    const { title, description, price, location, startDate, endDate, agencyId } = req.body;
    const newTour = new Tour({
        title,
        description,
        price,
        location,
        startDate,
        endDate,
        agencyId
    });
    try {
        await newTour.save();
        res.status(201).json(newTour);
    } catch (error) {
        res.status(400).json({ error: 'Errore durante la creazione del tour' });
    }
});

// Endpoint per ottenere tutte le esperienze di tour
app.get('/api/tours', async (req, res) => {
    try {
        const tours = await Tour.find();
        res.json(tours);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Avvio del server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
