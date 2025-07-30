// On encapsule tout dans une fonction pour éviter les conflits avec le site de l'utilisateur.
(function() {
    // --- CONFIGURATION ---
    // URL corrigée pour pointer vers le fichier CSS brut sur GitHub. C'est essentiel pour que ça fonctionne.
    const CSS_URL = 'https://raw.githubusercontent.com/ProjectView/Agent-IA-Projectview/main/style.css'; 
    // Votre URL de webhook n8n.
    const N8N_WEBHOOK_URL = 'https://n8n.srv800894.hstgr.cloud/webhook/a721b1dd-32e4-4653-a599-8e3e946a3015'; 

    // --- CRÉATION DU HTML ---
    // Le HTML complet de notre chatbot, stocké dans une chaîne de caractères.
    const chatbotHTML = `
        <div class="chat-widget-button" id="chat-bubble">
            <i class="fas fa-comment-dots"></i>
        </div>
        <div class="chat-widget-container" id="chat-window">
            <div class="chat-header">
                <h3>Assistant Virtuel</h3>
                <button class="close-btn" id="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-body" id="chat-body">
                <div class="message bot-message">
                    <p>Bonjour ! Comment puis-je vous aider ?</p>
                </div>
            </div>
            <div class="chat-footer">
                <form id="chat-form">
                    <input type="text" id="chat-input" placeholder="Tapez votre message..." autocomplete="off">
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
    `;

    // --- INJECTION DANS LA PAGE ---
    // Injecte le CSS
    const head = document.head;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_URL;
    head.appendChild(link);

    // Injecte les icônes Font Awesome
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    head.appendChild(fontAwesomeLink);

    // Injecte le HTML du chatbot
    document.body.innerHTML += chatbotHTML;


    // --- LOGIQUE DU CHATBOT ---
    // Attend que le DOM soit entièrement chargé pour manipuler les éléments
    document.addEventListener('DOMContentLoaded', () => {
        // On récupère les éléments qu'on vient de créer
        const chatBubble = document.getElementById('chat-bubble');
        const chatWindow = document.getElementById('chat-window');
        const closeBtn = document.getElementById('close-btn');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        const chatBody = document.getElementById('chat-body');

        // Gère l'ouverture/fermeture
        chatBubble.addEventListener('click', () => chatWindow.classList.toggle('open'));
        closeBtn.addEventListener('click', () => chatWindow.classList.remove('open'));

        // Gère l'envoi de message
        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const userInput = chatInput.value.trim();
            if (userInput === '') return;

            addMessageToUI(userInput, 'user-message');
            chatInput.value = '';

            try {
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userInput }),
                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                const botResponse = await response.json();
                addMessageToUI(botResponse.reply, 'bot-message');

            } catch (error) {
                console.error('Erreur de communication avec le webhook n8n:', error);
                addMessageToUI("Désolé, une erreur est survenue.", 'bot-message');
            }
        });

        function addMessageToUI(text, className) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', className);
            // Utiliser innerText ou textContent est plus sûr que innerHTML si le texte vient de l'utilisateur
            messageElement.innerHTML = `<p>${text}</p>`; 
            chatBody.appendChild(messageElement);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });

})(); // Exécute la fonction immédiatement.
