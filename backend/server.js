const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Data file path
const dataPath = path.join(__dirname, '../data/internships.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    try {
        await fs.mkdir(path.dirname(dataPath), { recursive: true });
        try {
            await fs.access(dataPath);
        } catch {
            await fs.writeFile(dataPath, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error setting up data directory:', error);
    }
}

// Read internships data
async function readInternships() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading internships:', error);
        return [];
    }
}

// Write internships data
async function writeInternships(internships) {
    try {
        await fs.writeFile(dataPath, JSON.stringify(internships, null, 2));
    } catch (error) {
        console.error('Error writing internships:', error);
        throw error;
    }
}

// Routes
app.get('/api/internships', async (req, res) => {
    try {
        const internships = await readInternships();
        res.json(internships);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch internships' });
    }
});

app.get('/api/internships/:id', async (req, res) => {
    try {
        const internships = await readInternships();
        const internship = internships.find(i => i.id === parseInt(req.params.id));
        
        if (!internship) {
            return res.status(404).json({ error: 'Internship not found' });
        }
        
        res.json(internship);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch internship details' });
    }
});

app.post('/api/internships', async (req, res) => {
    try {
        const internships = await readInternships();
        const newInternship = {
            id: internships.length + 1,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        internships.push(newInternship);
        await writeInternships(internships);
        
        res.status(201).json(newInternship);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create internship' });
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        // In a real application, you would handle the contact form submission
        // For example, sending an email or storing in a database
        console.log('Contact form submission:', req.body);
        res.status(200).json({ message: 'Message received successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process contact form' });
    }
});

// Start server
async function startServer() {
    await ensureDataDirectory();
    
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
}); 