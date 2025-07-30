/**
 * Widget de Chat pour n8n
 * Version: 2.0 (Moderne)
 * Auteur: Gemini
 *
 * Ce script s'injecte dans la page hôte, crée le widget de chat
 * et gère la communication avec un webhook n8n.
 */
(function() {
    // 1. RÉCUPÉRATION DE LA CONFIGURATION
    // ===================================
    const scriptTag = document.currentScript;
    if (!scriptTag) {
        console.error("Widget de Chat: Impossible de trouver la balise script. Le script doit être chargé normalement (pas en tant que module ou de manière asynchrone complexe).");
        return;
    }
    const N8N_WEBHOOK_URL = scriptTag.dataset.n8nUrl;

    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL.includes('VOTRE_URL')) {
        console.error("Widget de Chat: L'URL du webhook n8n est manquante ou n'a pas été configurée. Ajoutez l'attribut 'data-n8n-url' à votre balise script.");
        return;
    }

    // 2. INJECTION DU CSS
    // ===================
    const css = `
        :root {
            --gemini-chat-primary-color: #4f46e5;
            --gemini-chat-primary-gradient: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
            --gemini-chat-bg-light: #f9fafb;
            --gemini-chat-text-light: #f9fafb;
            --gemini-chat-text-dark: #111827;
            --gemini-chat-user-bubble: #4f46e5;
            --gemini-chat-bot-bubble: #e5e7eb;
        }
        #gemini-chat-widget-container *, #gemini-chat-widget-container *::before, #gemini-chat-widget-container *::after { box-sizing: border-box; }
        #gemini-chat-toggle-btn { position: fixed; bottom: 20px; right: 20px; background: var(--gemini-chat-primary-gradient); color: var(--gemini-chat-text-light); border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); z-index: 9999; display: flex; justify-content: center; align-items: center; transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1); transform-style: preserve-3d; }
        #gemini-chat-toggle-btn:hover { transform: scale(1.1) rotate(10deg); }
        .gemini-chat-icon-open, .gemini-chat-icon-close { position: absolute; transition: transform 0.4s ease-in-out; backface-visibility: hidden; }
        .gemini-chat-icon-close { transform: rotateY(180deg); }
        #gemini-chat-toggle-btn.is-open .gemini-chat-icon-open { transform: rotateY(180deg); }
        #gemini-chat-toggle-btn.is-open .gemini-chat-icon-close { transform: rotateY(0deg); }
        #gemini-chat-container { position: fixed; bottom: 90px; right: 20px; width: 90%; max-width: 380px; height: 75vh; max-height: 600px; background-color: var(--gemini-chat-bg-light); border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); z-index: 10000; display: flex; flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; transform: translateY(20px) scale(0.95); opacity: 0; visibility: hidden; transition: transform 0.3s ease-out, opacity 0.3s ease-out, visibility 0.3s; }
        #gemini-chat-container.is-open { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }
        #gemini-chat-header { background: var(--gemini-chat-primary-gradient); color: var(--gemini-chat-text-light); padding: 16px 20px; font-weight: 600; font-size: 1.1rem; flex-shrink: 0; text-align: center; }
        #gemini-chat-messages { flex-grow: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background-color: #ffffff; }
        .gemini-chat-message { padding: 12px 18px; border-radius: 20px; max-width: 85%; line-height: 1.5; word-wrap: break-word; animation: gemini-fade-in 0.4s ease-out; }
        @keyframes gemini-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .gemini-user-message { background-color: var(--gemini-chat-user-bubble); color: var(--gemini-chat-text-light); align-self: flex-end; border-bottom-right-radius: 6px; }
        .gemini-bot-message { background-color: var(--gemini-chat-bot-bubble); color: var(--gemini-chat-text-dark); align-self: flex-start; border-bottom-left-radius: 6px; }
        .gemini-error-message { background-color: #f8d7da; color: #721c24; align-self: flex-start; border-radius: 6px; font-style: italic; }
        #gemini-chat-input-area { display: flex; padding: 12px; border-top: 1px solid #e5e7eb; background-color: var(--gemini-chat-bg-light); flex-shrink: 0; align-items: center; }
        #gemini-chat-input { flex-grow: 1; border: none; background-color: #e5e7eb; border-radius: 20px; padding: 12px 18px; margin-right: 10px; font-size: 16px; color: var(--gemini-chat-text-dark); transition: box-shadow 0.2s; }
        #gemini-chat-input:focus { outline: none; box-shadow: 0 0 0 2px var(--gemini-chat-primary-color); }
        #gemini-chat-send-btn { background-color: var(--gemini-chat-primary-color); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex; justify-content: center; align-items: center; flex-shrink: 0; transition: background-color 0.2s, opacity 0.2s; }
        #gemini-chat-send-btn:hover:not(:disabled) { background-color: #4338ca; }
        #gemini-chat-send-btn:disabled { background-color: #a5b4fc; cursor: not-allowed; opacity: 0.6; }
        .gemini-typing-dot-container { display: flex; align-items: center; justify-content: center; height: 20px; } .gemini-typing-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #9ca3af; animation: gemini-typing-animation 1.4s infinite both; margin: 0 2px; } .gemini-typing-dot:nth-child(2) { animation-delay: 0.2s; } .gemini-typing-dot:nth-child(3) { animation-delay: 0.4s; } @keyframes gemini-typing-animation { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // 3. INJECTION DU HTML
    // ====================
    const html = `
        <div id="gemini-chat-widget-container">
            <button id="gemini-chat-toggle-btn" title="Contacter le support">
                <div class="gemini-chat-icon-open">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
                </div>
                <div class="gemini-chat-icon-close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
            </button>
            <div id="gemini-chat-container">
                <div id="gemini-chat-header"><span>🤖 Assistant Virtuel</span></div>
                <div id="gemini-chat-messages">
                    <div class="gemini-chat-message gemini-bot-message">Bonjour ! Comment puis-je vous aider aujourd'hui ?</div>
                </div>
                <div id="gemini-chat-input-area">
                    <input type="text" id="gemini-chat-input" placeholder="Posez votre question..." autocomplete="off" />
                    <button id="gemini-chat-send-btn" title="Envoyer" disabled>
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // 4. LOGIQUE DU WIDGET
    // =====================
    const toggleButton = document.getElementById('gemini-chat-toggle-btn');
    const chatContainer = document.getElementById('gemini-chat-container');
    const messagesContainer = document.getElementById('gemini-chat-messages');
    const chatInput = document.getElementById('gemini-chat-input');
    const sendButton = document.getElementById('gemini-chat-send-btn');
    let typingIndicator = null;
    let typingStyle = null;

    toggleButton.addEventListener('click', () => {
        const isOpen = toggleButton.classList.toggle('is-open');
        chatContainer.classList.toggle('is-open');
        if (isOpen) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            setTimeout(() => chatInput.focus(), 300); // Laisse le temps à l'animation de se faire
        }
    });

    chatInput.addEventListener('input', () => {
        sendButton.disabled = chatInput.value.trim() === '';
    });

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sendButton.disabled) {
            event.preventDefault();
            sendMessage();
        }
    });

    function addMessage(text, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('gemini-chat-message', `gemini-${type}-message`);
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        if (typingIndicator) return; // Déjà visible
        typingIndicator = document.createElement('div');
        typingIndicator.classList.add('gemini-chat-message', 'gemini-bot-message');
        typingIndicator.innerHTML = `<div class="gemini-typing-dot-container"><span class="gemini-typing-dot"></span><span class="gemini-typing-dot"></span><span class="gemini-typing-dot"></span></div>`;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        if (typingIndicator && messagesContainer.contains(typingIndicator)) {
            messagesContainer.removeChild(typingIndicator);
            typingIndicator = null;
        }
    }

    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessage(userMessage, 'user');
        chatInput.value = '';
        sendButton.disabled = true;
        chatInput.focus();
        showTypingIndicator();

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            hideTypingIndicator();
            if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
            const data = await response.json();
            if (data && data.reply) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage("Réponse invalide du serveur.", 'error');
            }
        } catch (error) {
            hideTypingIndicator();
            console.error("Erreur Widget Chat:", error);
            addMessage("Désolé, une erreur technique est survenue.", 'error');
        }
    }
})();
