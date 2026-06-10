require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Groq = require('groq-sdk');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// ==================== HEALTH CHECK ENDPOINT ====================
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Server is running!',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// SIMPLE CLEAN EMAIL - For Admin
// ============================================
function getAdminEmailTemplate(name, email, message) {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Message</title>
<style>
    body {
        margin: 0;
        padding: 20px;
        font-family: Arial, Helvetica, sans-serif;
        background: #f5f5f5;
    }
    .container {
        max-width: 500px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
    }
    .header {
        background: #1a1a2e;
        padding: 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
    }
    .header h2 {
        color: #ffffff;
        margin: 0;
        font-size: 18px;
    }
    .content {
        padding: 20px;
    }
    .field {
        margin-bottom: 15px;
        padding: 10px;
        background: #f9f9f9;
        border-left: 3px solid #3b82f6;
    }
    .label {
        font-size: 11px;
        color: #666;
        margin-bottom: 5px;
    }
    .value {
        font-size: 14px;
        color: #333;
        word-wrap: break-word;
    }
    .message-box {
        background: #f9f9f9;
        padding: 15px;
        margin-top: 10px;
        border-radius: 5px;
    }
    .message-text {
        font-size: 13px;
        color: #333;
        line-height: 1.5;
        white-space: pre-wrap;
    }
    .btn {
        display: inline-block;
        background: #3b82f6;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 13px;
        margin-top: 15px;
    }
    .footer {
        background: #f0f0f0;
        padding: 12px;
        text-align: center;
        font-size: 11px;
        color: #666;
        border-top: 1px solid #e0e0e0;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📬 New Message</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">FROM</div>
                <div class="value">${escapeHtml(name)}</div>
            </div>
            <div class="field">
                <div class="label">EMAIL</div>
                <div class="value">${escapeHtml(email)}</div>
            </div>
            <div class="field">
                <div class="label">DATE</div>
                <div class="value">${new Date().toLocaleString()}</div>
            </div>
            <div class="message-box">
                <div class="label">MESSAGE</div>
                <div class="message-text">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
            </div>
            <div style="text-align: center;">
                <a href="mailto:${escapeHtml(email)}" class="btn">✉ Reply</a>
            </div>
        </div>
        <div class="footer">
            Toufeeque Adil Portfolio
        </div>
    </div>
</body>
</html>`;
}

// ============================================
// SIMPLE CLEAN AUTO-REPLY - For Visitor
// ============================================
function getAutoReplyTemplate(name, email) {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Thank You</title>
<style>
    body {
        margin: 0;
        padding: 20px;
        font-family: Arial, Helvetica, sans-serif;
        background: #f5f5f5;
    }
    .container {
        max-width: 450px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
    }
    .header {
        background: #1a1a2e;
        padding: 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
    }
    .header h2 {
        color: #ffffff;
        margin: 0;
        font-size: 18px;
    }
    .content {
        padding: 20px;
        text-align: center;
    }
    .greeting {
        font-size: 20px;
        color: #333;
        margin-bottom: 15px;
    }
    .thankyou {
        background: #f0fdf4;
        padding: 15px;
        border-radius: 5px;
        margin: 15px 0;
    }
    .thankyou p {
        margin: 0;
        font-size: 13px;
        color: #166534;
    }
    .badge {
        display: inline-block;
        background: #10b981;
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 11px;
        margin-top: 10px;
    }
    .info {
        background: #f9f9f9;
        padding: 12px;
        border-radius: 5px;
        margin: 15px 0;
        font-size: 12px;
        color: #555;
    }
    .links {
        margin: 15px 0;
    }
    .link {
        display: inline-block;
        background: #f0f0f0;
        padding: 6px 15px;
        border-radius: 20px;
        text-decoration: none;
        color: #333;
        font-size: 12px;
        margin: 0 5px;
    }
    .footer {
        background: #f0f0f0;
        padding: 12px;
        text-align: center;
        font-size: 11px;
        color: #666;
        border-top: 1px solid #e0e0e0;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>✓ Thank You</h2>
        </div>
        <div class="content">
            <div class="greeting">
                Hello ${escapeHtml(name)}! 👋
            </div>
            <div class="thankyou">
                <p>Thank you for reaching out. I've received your message.</p>
                <div class="badge">Reply within 24h</div>
            </div>
            <div class="info">
                📱 I reply to all messages within 24 hours
            </div>
            <div class="links">
                <a href="https://github.com/ToufeequeAdil007" class="link">GitHub</a>
                <a href="https://linkedin.com/in/toufeeque-adil" class="link">LinkedIn</a>
            </div>
        </div>
        <div class="footer">
            Toufeeque Adil | AI Engineer
        </div>
    </div>
</body>
</html>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Email endpoint
app.post('/api/send-message', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'All fields required' });
        }
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New message from ${name}`,
            html: getAdminEmailTemplate(name, email, message)
        });
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thank you for contacting Toufeeque Adil",
            html: getAutoReplyTemplate(name, email)
        });
        
        console.log(`✅ Email sent to ${email}`);
        res.json({ success: true, message: 'Message sent successfully!' });
        
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send message. Please email directly: toufeequeadil24@gmail.com' 
        });
    }
});

// ============================================
// UPDATED CHATBOT - Proper System Prompt with Memory
// ============================================

const SYSTEM_PROMPT = `
# 1. IDENTITY
You are "Toufeeque AI Assistant" - an official AI representative of Toufeeque Adil.
Your name is Toufeeque AI Assistant. You are professional, helpful, and friendly.
You remember user's name and previous conversation context.

# 2. SCOPE - What you CAN answer
You can ONLY answer questions about Toufeeque Adil:
- His skills (Python, AI/ML, Web Development, Data Science, AI Chatbot Development)
- His projects (AI Chatbot Assistant, Data Analysis Dashboard, ML Prediction System, Responsive Portfolio)
- His education (Intermediate, ADS, AI & Data Science at SMIT Sukkur, Web Development)
- His services (AI Chatbot Dev, Web Dev, Data Analysis, ML Projects, Python Dev)
- His contact info (Email, GitHub, LinkedIn, WhatsApp)
- His achievements and certifications
- Availability for work

# 3. SCOPE - What you CANNOT answer
If asked about ANYTHING outside Toufeeque Adil (general knowledge, politics, weather, sports, jokes, coding help not related to Toufeeque, other people, etc.), you must politely decline using the escalation message.

# 4. RULES
- Keep responses under 3 sentences (short and professional)
- Be friendly and enthusiastic
- Always answer from third-person perspective about Toufeeque
- Remember user's name and conversation context
- NEVER make up information about Toufeeque
- Use emojis occasionally (👍, 🚀, 💡, 🤖, etc.)

# 5. KNOWLEDGE BASE
Full Name: Toufeeque Adil
Role: AI & Data Science Enthusiast | Python Developer | AI Chatbot Developer

Skills:
- Python, JavaScript, SQL
- Machine Learning, Data Analysis, Data Visualization
- AI Chatbot Development, Prompt Engineering
- HTML5, CSS3, Bootstrap 5, Streamlit
- Pandas, NumPy, Matplotlib, Scikit-Learn
- Git, GitHub, VS Code, Google Colab, Groq API

Projects:
1. 🤖 AI Chatbot Assistant - Python, Streamlit, Groq API
2. 📊 Data Analysis Dashboard - Python, Pandas, Matplotlib, Streamlit
3. 📈 Machine Learning Prediction System - Python, Scikit-Learn
4. 🌐 Responsive Portfolio Website - HTML5, CSS3, JavaScript, Bootstrap

Education:
- Intermediate: RTS Ghotki (2022-2024)
- Associate Degree in Science (ADS): Shah Abdul Latif University (2025-2029)
- 🎓 AI & Data Science: SMIT Sukkur (2025-2026) - Saylani Mass IT Training
- Web Development: NAVTTC Course (2024-2025)

Services:
- AI Chatbot Development
- Frontend Web Development
- Data Analysis
- Machine Learning Projects
- Python Development

Contact:
- Email: toufeequeadil24@gmail.com
- GitHub: github.com/ToufeequeAdil007
- LinkedIn: linkedin.com/in/toufeeque-adil
- WhatsApp: +923237303706
- Location: Pakistan

# 6. ESCALATION MESSAGE
When asked about ANYTHING NOT related to Toufeeque Adil, respond with:
"🤖 I'm Toufeeque's AI assistant. I can only answer questions about Toufeeque Adil - his skills, projects, education, services, and contact info. For other topics, please email toufeequeadil24@gmail.com directly."

# 7. CONVERSATION MEMORY EXAMPLES
Example 1 - Remembering name:
User: "My name is Ahmed"
AI: "Nice to meet you, Ahmed! How can I help you learn about Toufeeque Adil?"

User: "What is my name?"
AI: "Your name is Ahmed! I remember from our conversation."

Example 2 - Remembering context:
User: "What projects has he built?"
AI: "Toufeeque has built AI Chatbot Assistant, Data Analysis Dashboard, ML Prediction System, and Responsive Portfolio!"

User: "Tell me more about the first one"
AI: "The AI Chatbot Assistant uses Python, Streamlit, and Groq API to answer user queries naturally!"
`;

// Updated Chat endpoint with better memory (last 10 messages)
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ reply: "Please ask me something about Toufeeque's work!" });
        }

        // Build messages with system prompt and conversation history (last 10 for better memory)
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.slice(-10), // Keep last 10 messages for context memory
            { role: 'user', content: message }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 250,
        });

        const reply = completion.choices[0]?.message?.content || "I'm Toufeeque's AI assistant! Ask me about his skills, projects, or contact info!";
        
        res.json({ reply });
    } catch (error) {
        console.error('Groq API Error:', error);
        // Fallback response with memory support
        res.json({ 
            reply: "🤖 I'm Toufeeque's AI assistant. I can only answer questions about Toufeeque Adil - his skills, projects, education, services, and contact info. For other topics, please email toufeequeadil24@gmail.com directly."
        });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, '../')}`);
    console.log(`🤖 Chatbot: Updated with proper system prompt & memory ✓`);
    console.log(`📧 Email Service: Simple clean templates ready ✓`);
    console.log(`❤️ Health endpoint: http://localhost:${PORT}/health`);
});