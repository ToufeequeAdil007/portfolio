// Backend API URL (update with your actual backend URL)
const API_URL = 'http://localhost:5000/api/chat';

// Projects Data
const projects = [
    { name: "AI Voice Assistant", category: "ai", tech: "Python, Speech Recognition", desc: "Voice-controlled AI assistant" },
    { name: "AI Portfolio Assistant", category: "ai", tech: "Groq API, React", desc: "AI chatbot for portfolio" },
    { name: "Job Portal System", category: "web", tech: "MERN Stack", desc: "Full-stack job platform" },
    { name: "LMS Management System", category: "web", tech: "React, Node.js", desc: "Learning management system" }
];

// Render Projects
function renderProjects(filter = 'all') {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    
    const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);
    grid.innerHTML = filtered.map(proj => `
        <div class="project-card" onclick="showProjectModal('${proj.name}')">
            <div class="project-image"><i class="fas fa-robot"></i></div>
            <div style="padding: 1rem">
                <h3>${proj.name}</h3>
                <p>${proj.desc}</p>
                <div style="margin-top: 0.5rem">
                    <span class="badge">${proj.tech}</span>
                </div>
                <button class="btn-outline" style="margin-top: 1rem">View Project</button>
            </div>
        </div>
    `).join('');
}

// Chatbot Functions
let chatHistory = [];

async function sendMessage(message) {
    const messagesDiv = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    
    // Add user message
    messagesDiv.innerHTML += `<div class="message user"><div class="message-content">${escapeHtml(message)}</div></div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    typingIndicator.style.display = 'flex';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: chatHistory })
        });
        
        const data = await response.json();
        const reply = data.reply || "I'm here to help!";
        
        chatHistory.push({ role: 'user', content: message });
        chatHistory.push({ role: 'assistant', content: reply });
        
        messagesDiv.innerHTML += `<div class="message bot"><div class="message-content">${escapeHtml(reply)}</div></div>`;
    } catch (error) {
        messagesDiv.innerHTML += `<div class="message bot"><div class="message-content">Sorry, I'm having trouble connecting. Please try again later.</div></div>`;
    } finally {
        typingIndicator.style.display = 'none';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

// Voice Input
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chatInput').value = transcript;
        sendMessage(transcript);
    };
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
    
    // Chatbot
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const sendBtn = document.getElementById('sendMessageBtn');
    const chatInput = document.getElementById('chatInput');
    const voiceBtn = document.getElementById('voiceInputBtn');
    const clearChatBtn = document.getElementById('clearChatBtn');
    
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
    });
    
    closeChatBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });
    
    sendBtn.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            sendMessage(message);
            chatInput.value = '';
        }
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });
    
    if (voiceBtn && recognition) {
        voiceBtn.addEventListener('click', () => {
            recognition.start();
        });
    }
    
    clearChatBtn.addEventListener('click', () => {
        const messagesDiv = document.getElementById('chatMessages');
        messagesDiv.innerHTML = `<div class="message bot"><div class="message-content">Chat cleared! Ask me anything about Toufeeque.</div></div>`;
        chatHistory = [];
    });
    
    // Suggested questions
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sendMessage(btn.textContent);
        });
    });
    
    // Scroll to top
    const scrollBtn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Buttons
    document.getElementById('downloadResumeBtn')?.addEventListener('click', () => {
        alert('Resume download started. You can contact for detailed CV.');
    });
    
    document.getElementById('hireMeBtn')?.addEventListener('click', () => {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('contactBtn')?.addEventListener('click', () => {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('viewProjectsBtn')?.addEventListener('click', () => {
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#3b82f6" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#8b5cf6", opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } }
        }
    });
});

window.showProjectModal = (projectName) => {
    alert(`Project: ${projectName}\nCheck GitHub for full source code.`);
};