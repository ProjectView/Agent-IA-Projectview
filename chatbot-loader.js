(function() {
    console.log("1. Le script démarre.");

    const CSS_URL = 'https://raw.githubusercontent.com/ProjectView/Agent-IA-Projectview/main/style.css'; 
    const N8N_WEBHOOK_URL = 'https://n8n.srv800894.hstgr.cloud/webhook/a721b1dd-32e4-4653-a599-8e3e946a3015'; 

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

    try {
        const head = document.head;
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = CSS_URL;
        head.appendChild(styleLink);

        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
        head.appendChild(fontAwesomeLink);

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        console.log("2. Le HTML et le CSS ont été injectés dans la page.");

        const chatBubble = document.getElementById('chat-bubble');
        const chatWindow = document.getElementById('chat-window');
        const closeBtn = document.getElementById('close-btn');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        const chatBody = document.getElementById('chat-body');
        console.log("3. Les éléments du DOM ont été trouvés.");

        chatBubble.addEventListener('click', () => chatWindow.classList.toggle('open'));
        closeBtn.addEventListener('click', () => chatWindow.classList.remove('open'));
        chatForm.addEventListener('submit', async (event) => {
            // ... (le reste de la logique reste identique)
            event.preventDefault();
            const userInput = chatInput.value.trim();
            if (userInput === '') return;

            addMessageToUI(userInput, 'user-message');
            chatInput.value = '';

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput }),
            });

            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            
            const botResponse = await response.json();
            addMessageToUI(botResponse.reply, 'bot-message');
        });
        console.log("4. Les écouteurs d'événements sont actifs. Le chatbot devrait être visible et fonctionnel.");

    } catch (e) {
        console.error("ERREUR CRITIQUE DANS LE BLOC PRINCIPAL :", e);
    }
    
    function addMessageToUI(text, className) {
        // ... (la fonction reste identique)
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', className);
        messageElement.innerHTML = `<p>${text}</p>`; 
        const chatBody = document.getElementById('chat-body'); // Re-sélectionner au cas où
        if (chatBody) {
            chatBody.appendChild(messageElement);
            chatBody.scrollTop = chatBody.scrollHeight;
        } else {
            console.error("Erreur : Impossible de trouver 'chat-body' pour ajouter un message.");
        }
    }
})();
