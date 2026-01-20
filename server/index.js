const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Socket ke liye zaroori hai
const { Server } = require('socket.io'); // Real-time ke liye
require('dotenv').config();

const Patient = require('./models/Patient'); 

const app = express();
const server = http.createServer(app); // Express ko HTTP server mein wrap kiya

// 1. Middlewares
app.use(cors());
app.use(express.json());

// 2. Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Aapka React port
        methods: ["GET", "POST"]
    }
});

// 3. MongoDB Connection
const mongoURI = process.env.MONGO_URI; 
mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ DB Connection Error:", err));

// 4. API Routes

// Health Check API
app.get('/api/health', (req, res) => {
    res.json({ 
        status: "Connected", 
        message: "RCH Server ready hai!",
        db_status: mongoose.connection.readyState === 1 ? "Database Live" : "Database Offline"
    });
});

// GET: Saare Patients fetch karein
app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Naya Patient add karein aur Real-time update bhejein
app.post('/api/patients', async (req, res) => {
    try {
        const { patientName, age, location, type, healthStatus } = req.body;
        const newPatient = new Patient({
            patientName, age, location, type, healthStatus
        });
        const savedPatient = await newPatient.save();
        
        // 🔥 Real-time Magic: Sabhi connected users ko data bhejna
        io.emit('new-patient-added', savedPatient); 

        res.status(201).json({ message: "Patient Data Saved!", data: savedPatient });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Socket Connection Logic
io.on('connection', (socket) => {
    console.log('⚡ A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 6. Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});