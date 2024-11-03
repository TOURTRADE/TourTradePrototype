function sendMessage() {
    const message = document.getElementById("message-input").value;
    const agentName = document.getElementById("chat-agent-name").innerText;

    if (message.trim() === '') return;

    fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'Agenzia', message: message, agent: agentName })
    }).then(response => {
        document.getElementById("message-input").value = ''; // Pulisci il campo
        loadMessages(); // Ricarica i messaggi
    });
}

function sendOffer() {
    const offer = document.getElementById("offer-input").value;
    const agentName = document.getElementById("chat-agent-name").innerText;
    const clientId = "id_cliente"; // Cambia con l'ID reale del cliente
    const agencyId = "id_agenzia"; // Cambia con l'ID reale dell'agenzia

    if (offer.trim() === '') return;

    fetch('http://localhost:3000/api/private-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer: offer, clientId: clientId, agencyId: agencyId })
    }).then(response => {
        document.getElementById("offer-input").value = ''; // Pulisci il campo
    });
}

function loadMessages() {
    fetch('http://localhost:3000/api/messages')
        .then(response => response.json())
        .then(data => {
            const messagesDiv = document.getElementById("messages");
            messagesDiv.innerHTML = ''; // Pulisci i messaggi esistenti
            data.forEach(msg => {
                const msgDiv = document.createElement("div");
                msgDiv.innerHTML = `<strong>${msg.sender}:</strong> ${msg.message}`;
                messagesDiv.appendChild(msgDiv);
            });
        });
}
