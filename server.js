const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// ====== CORS Enable ======
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ====== HEALTH CHECK ======
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        server: 'Anjan AI Pairing System',
        version: '1.0.0'
    });
});

// ====== PAIRING API ======
app.get('/pair/:number', async (req, res) => {
    const number = req.params.number;
    
    // Validate number
    if (!number || number.length < 8) {
        return res.status(400).json({
            success: false,
            error: 'Invalid phone number. Must be at least 8 digits.'
        });
    }

    try {
        // Call Railway API
        const response = await axios.get(
            `https://whatbot-telegram-insta-production.up.railway.app/pair/${number}`,
            {
                timeout: 30000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        // Send response to frontend
        res.json({
            success: true,
            code: response.data.code || response.data,
            number: number,
            message: 'Pairing code generated successfully'
        });

    } catch (error) {
        console.error('❌ Pairing error:', error.message);
        
        // Handle different error types
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                error: 'Connection timeout. Server is taking too long to respond.'
            });
        }
        
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                error: `Server error: ${error.response.status}`,
                details: error.response.data
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server offline or CORS issue. Please try again later.'
        });
    }
});

// ====== ROOT ======
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ====== 404 Handler ======
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// ====== START SERVER ======
app.listen(PORT, () => {
    console.log(`✦ 𝙰𝙽𝙹𝙰𝙽 ʬ 合 Pairing Server running on port ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`📱 Pairing endpoint: http://localhost:${PORT}/pair/91xxxxxxxxxx`);
});
