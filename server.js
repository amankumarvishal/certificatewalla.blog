const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'internships.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir);
        // Create empty internships.json if it doesn't exist
        await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
}

// Read internships data
async function readInternships() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading internships:', error);
        return [];
    }
}

// Write internships data
async function writeInternships(internships) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(internships, null, 2));
    } catch (error) {
        console.error('Error writing internships:', error);
        throw error;
    }
}

// Validation middleware
function validateInternship(req, res, next) {
    const { title, company, location, duration, stipend, category, description } = req.body;
    
    if (!title || !company || !location || !duration || !stipend || !category || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({ error: 'Duration must be a positive number' });
    }

    if (typeof stipend !== 'number' || stipend < 0) {
        return res.status(400).json({ error: 'Stipend must be a non-negative number' });
    }

    next();
}

// Routes
// GET all internships
app.get('/api/internships', async (req, res) => {
    try {
        const internships = await readInternships();
        res.json(internships);
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ error: 'Failed to fetch internships' });
    }
});

// GET internship by ID
app.get('/api/internships/:id', async (req, res) => {
    try {
        const internships = await readInternships();
        const internship = internships.find(i => i.id === parseInt(req.params.id));
        
        if (!internship) {
            return res.status(404).json({ error: 'Internship not found' });
        }
        
        res.json(internship);
    } catch (error) {
        console.error('Error fetching internship:', error);
        res.status(500).json({ error: 'Failed to fetch internship' });
    }
});

// POST new internship
app.post('/api/internships', validateInternship, async (req, res) => {
    try {
        const internships = await readInternships();
        const newInternship = {
            id: internships.length > 0 ? Math.max(...internships.map(i => i.id)) + 1 : 1,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        internships.push(newInternship);
        await writeInternships(internships);
        
        res.status(201).json(newInternship);
    } catch (error) {
        console.error('Error creating internship:', error);
        res.status(500).json({ error: 'Failed to create internship' });
    }
});

// POST contact form
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Log contact form submission
        console.log('Contact Form Submission:', {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        });

        // Optional: Send email using nodemailer
        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS
        //     }
        // });

        // await transporter.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: 'your-email@example.com',
        //     subject: `Contact Form: ${subject}`,
        //     text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        // });

        res.status(200).json({ message: 'Message received successfully' });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ error: 'Failed to process contact form' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
    await ensureDataDirectory();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer(); 