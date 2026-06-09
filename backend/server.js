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

// ==================== HEALTH CHECK ENDPOINT (FOR UPTIME MONITORING) ====================
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Server is running!',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// PREMIUM EMAIL TEMPLATE - For Admin (Toufeeque)
// ============================================
function getAdminEmailTemplate(name, email, message) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Client Message</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    padding: 40px 20px;
                }
                .email-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 28px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    border: 1px solid rgba(59, 130, 246, 0.15);
                }
                .email-header {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    padding: 35px 30px 30px;
                    text-align: center;
                    position: relative;
                }
                .email-header::before {
                    content: "✨";
                    position: absolute;
                    top: 20px;
                    right: 30px;
                    font-size: 40px;
                    opacity: 0.15;
                }
                .email-header::after {
                    content: "🚀";
                    position: absolute;
                    bottom: 20px;
                    left: 30px;
                    font-size: 40px;
                    opacity: 0.15;
                }
                .email-header h1 {
                    color: white;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }
                .email-header p {
                    color: rgba(255,255,255,0.7);
                    font-size: 14px;
                }
                .email-badge {
                    display: inline-block;
                    background: rgba(59, 130, 246, 0.2);
                    backdrop-filter: blur(10px);
                    padding: 6px 16px;
                    border-radius: 40px;
                    font-size: 12px;
                    color: #60a5fa;
                    margin-top: 15px;
                }
                .email-body {
                    padding: 35px 30px;
                }
                .greeting-section {
                    margin-bottom: 25px;
                }
                .greeting-section h2 {
                    font-size: 22px;
                    color: #1e293b;
                    margin-bottom: 8px;
                }
                .greeting-section p {
                    color: #64748b;
                    font-size: 14px;
                }
                .contact-card {
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 25px;
                    border: 1px solid #e2e8f0;
                }
                .contact-info-row {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                    background: white;
                    padding: 12px 18px;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                }
                .contact-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: white;
                }
                .contact-details {
                    flex: 1;
                }
                .contact-details .label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #94a3b8;
                    margin-bottom: 4px;
                }
                .contact-details .value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                }
                .message-box {
                    background: linear-gradient(135deg, #eff6ff, #eef2ff);
                    border-radius: 20px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 4px solid #3b82f6;
                }
                .message-label {
                    display: inline-block;
                    background: #3b82f6;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    margin-bottom: 15px;
                }
                .message-text {
                    color: #334155;
                    line-height: 1.7;
                    font-size: 15px;
                    white-space: pre-wrap;
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                }
                .action-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 25px;
                }
                .btn-reply {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    padding: 12px 28px;
                    border-radius: 40px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    transition: transform 0.2s;
                }
                .btn-reply:hover {
                    transform: translateY(-2px);
                }
                .btn-profile {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    color: #3b82f6;
                    padding: 12px 28px;
                    border-radius: 40px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    border: 1px solid #3b82f6;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin: 25px 0;
                    text-align: center;
                }
                .stat-item {
                    background: white;
                    padding: 15px;
                    border-radius: 16px;
                }
                .stat-number {
                    font-size: 24px;
                    font-weight: 800;
                    color: #3b82f6;
                }
                .stat-label {
                    font-size: 11px;
                    color: #64748b;
                    margin-top: 5px;
                }
                .email-footer {
                    background: #f8fafc;
                    padding: 25px 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                .social-icons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-bottom: 15px;
                }
                .social-icons a {
                    color: #94a3b8;
                    text-decoration: none;
                    font-size: 20px;
                    transition: color 0.2s;
                }
                .social-icons a:hover {
                    color: #3b82f6;
                }
                .footer-text {
                    color: #94a3b8;
                    font-size: 12px;
                }
                @media (max-width: 500px) {
                    .email-body {
                        padding: 25px 20px;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .action-buttons {
                        flex-direction: column;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="email-header">
                    <h1>✨ New Message Received</h1>
                    <p>Someone just reached out through your portfolio</p>
                    <div class="email-badge">📬 Priority Inquiry</div>
                </div>
                <div class="email-body">
                    <div class="greeting-section">
                        <h2>👋 New Lead Alert!</h2>
                        <p>Someone is interested in working with you. Here are the details:</p>
                    </div>
                    
                    <div class="contact-card">
                        <div class="contact-info-row">
                            <div class="contact-icon">👤</div>
                            <div class="contact-details">
                                <div class="label">Sender Name</div>
                                <div class="value">${escapeHtml(name)}</div>
                            </div>
                        </div>
                        <div class="contact-info-row">
                            <div class="contact-icon">📧</div>
                            <div class="contact-details">
                                <div class="label">Email Address</div>
                                <div class="value">${escapeHtml(email)}</div>
                            </div>
                        </div>
                        <div class="contact-info-row">
                            <div class="contact-icon">🕐</div>
                            <div class="contact-details">
                                <div class="label">Received On</div>
                                <div class="value">${new Date().toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="message-box">
                        <div class="message-label">💬 Message Content</div>
                        <div class="message-text">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">⚡</div>
                            <div class="stat-label">Reply Within 24h</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">🎯</div>
                            <div class="stat-label">Quality Lead</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">🤝</div>
                            <div class="stat-label">Client Opportunity</div>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <a href="mailto:${escapeHtml(email)}" class="btn-reply">
                            ✉️ Reply to ${escapeHtml(name).split(' ')[0]}
                        </a>
                        <a href="https://linkedin.com/in/toufeeque-adil" class="btn-profile">
                            🔗 View LinkedIn
                        </a>
                    </div>
                </div>
                <div class="email-footer">
                    <div class="social-icons">
                        <a href="https://github.com/ToufeequeAdil007"><i class="fab fa-github"></i></a>
                        <a href="https://linkedin.com/in/toufeeque-adil"><i class="fab fa-linkedin"></i></a>
                        <a href="mailto:toufeequeadil24@gmail.com"><i class="fas fa-envelope"></i></a>
                    </div>
                    <p class="footer-text">© 2026 Toufeeque Adil Portfolio | All Rights Reserved</p>
                    <p class="footer-text" style="margin-top: 8px;">This is an automated message from your portfolio website.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// ============================================
// PREMIUM AUTO-REPLY TEMPLATE - For Visitor
// ============================================
function getAutoReplyTemplate(name, email) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You for Contacting Toufeeque Adil</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                    padding: 40px 20px;
                }
                .email-wrapper {
                    max-width: 550px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
                }
                .hero-section {
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6, #a78bfa);
                    padding: 45px 30px 40px;
                    text-align: center;
                    position: relative;
                }
                .hero-icon {
                    font-size: 60px;
                    margin-bottom: 15px;
                }
                .hero-section h1 {
                    color: white;
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 10px;
                }
                .hero-section p {
                    color: rgba(255,255,255,0.9);
                    font-size: 16px;
                }
                .content-section {
                    padding: 35px 30px;
                }
                .welcome-message {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .welcome-message h2 {
                    font-size: 26px;
                    color: #1e293b;
                    margin-bottom: 10px;
                }
                .welcome-message h2 span {
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
                .thankyou-card {
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                    border-radius: 24px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: center;
                    border: 1px solid rgba(59,130,246,0.2);
                }
                .thankyou-card p {
                    color: #1e293b;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }
                .response-time {
                    display: inline-block;
                    background: #10b981;
                    color: white;
                    padding: 6px 16px;
                    border-radius: 40px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-top: 10px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin: 25px 0;
                }
                .info-card {
                    background: #f8fafc;
                    padding: 18px;
                    border-radius: 20px;
                    text-align: center;
                    transition: transform 0.2s;
                }
                .info-card:hover {
                    transform: translateY(-3px);
                }
                .info-icon {
                    font-size: 32px;
                    margin-bottom: 10px;
                }
                .info-card h4 {
                    color: #1e293b;
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                .info-card p {
                    color: #64748b;
                    font-size: 12px;
                }
                .social-links {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin: 25px 0;
                }
                .social-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f1f5f9;
                    padding: 10px 20px;
                    border-radius: 40px;
                    text-decoration: none;
                    color: #334155;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .social-link:hover {
                    background: #3b82f6;
                    color: white;
                    transform: translateY(-2px);
                }
                .quote-box {
                    background: linear-gradient(135deg, #fef3c7, #fde68a);
                    padding: 20px;
                    border-radius: 20px;
                    text-align: center;
                    margin: 25px 0;
                }
                .quote-box p {
                    color: #92400e;
                    font-style: italic;
                    font-size: 14px;
                }
                .footer-section {
                    background: #f8fafc;
                    padding: 25px 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                .footer-section .signature {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 8px;
                }
                .footer-section .title {
                    font-size: 13px;
                    color: #64748b;
                }
                @media (max-width: 500px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    .social-link {
                        padding: 8px 16px;
                        font-size: 12px;
                    }
                    .content-section {
                        padding: 25px 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="hero-section">
                    <div class="hero-icon">🤖✨</div>
                    <h1>Thank You!</h1>
                    <p>Your message has been received</p>
                </div>
                <div class="content-section">
                    <div class="welcome-message">
                        <h2>Hello <span>${escapeHtml(name)}</span>! 👋</h2>
                        <p>I appreciate you reaching out to me.</p>
                    </div>
                    
                    <div class="thankyou-card">
                        <p>Thank you for contacting me through my portfolio. I've received your message and will personally review it.</p>
                        <div class="response-time">⏰ Response within 24 hours</div>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="info-icon">📱</div>
                            <h4>Quick Response</h4>
                            <p>I reply to all messages within 24 hours</p>
                        </div>
                        <div class="info-card">
                            <div class="info-icon">💡</div>
                            <h4>Free Consultation</h4>
                            <p>30 min free discovery call</p>
                        </div>
                    </div>
                    
                    <div class="social-links">
                        <a href="https://github.com/ToufeequeAdil007" class="social-link">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                        <a href="https://linkedin.com/in/toufeeque-adil" class="social-link">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                    </div>
                    
                    <div class="quote-box">
                        <p>"Building intelligent AI solutions and modern web experiences that make a difference."</p>
                        <p style="margin-top: 8px; font-style: normal; font-weight: 600;">— Toufeeque Adil</p>
                    </div>
                </div>
                <div class="footer-section">
                    <div class="signature">Toufeeque Adil</div>
                    <div class="title">AI Engineer & Web Developer</div>
                    <div style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                        <p>📧 toufeequeadil24@gmail.com</p>
                        <p style="margin-top: 8px;">© 2026 All Rights Reserved</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

function escapeHtml(str) {
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
        
        // Email to admin (Toufeeque) - Premium Design
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `✨ New Portfolio Message from ${name}`,
            html: getAdminEmailTemplate(name, email, message)
        });
        
        // Auto-reply to sender - Premium Design
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "✨ Thank you for contacting Toufeeque Adil! 🤖",
            html: getAutoReplyTemplate(name, email)
        });
        
        console.log(`✅ Email sent to ${email} and notification to owner`);
        res.json({ success: true, message: 'Message sent successfully!' });
        
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send message. Please email directly: toufeequeadil24@gmail.com' 
        });
    }
});

// System prompt for chatbot
const SYSTEM_PROMPT = `You are Toufeeque AI Assistant. ONLY answer questions about Toufeeque Adil - his skills, projects, education, services, and contact info. For ANY other topic, respond: "I'm Toufeeque's AI assistant. I can only answer questions about Toufeeque Adil - his skills, projects, education, services, and contact info." Keep responses under 2 sentences.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ reply: "Please ask me something about Toufeeque's work!" });
        }

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.slice(-6),
            { role: 'user', content: message }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 200,
        });

        const reply = completion.choices[0]?.message?.content || "I'm here to help! Ask me about Toufeeque's skills, projects, or experience.";
        
        res.json({ reply });
    } catch (error) {
        console.error('Groq API Error:', error);
        res.json({ 
            reply: "I'm Toufeeque's AI assistant. Ask me about his skills, projects, or contact info!"
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
    console.log(`🤖 Chatbot: Portfolio-only questions`);
    console.log(`📧 Email Service: Premium templates ready ✓`);
    console.log(`❤️ Health endpoint: http://localhost:${PORT}/health`);
});