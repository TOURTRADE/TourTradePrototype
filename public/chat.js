/* Stile per la classe nascosta */
.hidden {
    display: none;
}

/* Imposta il font globale */
body {
    font-family: 'Arial', sans-serif; /* Applica il font Arial */
    background-color: #000; /* Colore di sfondo nero */
    color: #fff; /* Colore del testo bianco */
}

/* Header */
header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    z-index: 10; 
    background-color: transparent; /* Rende l'header trasparente */
}

/* Logo */
.header-left .logo {
    height: 60px; 
}

/* Icone nella sezione centrale dell'header */
.header-center {
    display: flex;
    align-items: center; /* Allinea gli elementi al centro */
}

#dashboard-button, #notification-button, #bookings-button, #profile-button {
    background: none; /* Rimuovi il background */
    border: none; /* Rimuovi il bordo */
    cursor: pointer; /* Cambia il cursore */
    margin-left: 20px; /* Spazio tra i bottoni */
    color: white; /* Colore del testo */
}

/* Chat e Sezioni dei Contatti */
.contacts-section, .active-chats-section {
    width: 30%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-right: 10px;
    background-color: rgba(255, 255, 255, 0.9); /* Sfondo semi-trasparente */
    display: flex;
    justify-content: center; /* Centra l'icona */
    align-items: center; /* Centra verticalmente */
}

.chat-window {
    width: 60%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.9); /* Sfondo semi-trasparente */
    max-height: 400px;
    overflow-y: auto;
}

/* Messaggi */
.messages-box {
    margin-bottom: 10px;
    height: 300px;
    overflow-y: auto;
}

/* Input e Pulsanti */
.input-container {
    display: flex;
    align-items: center;
}

.input-container input[type="text"] {
    flex: 1;
    padding: 5px;
    margin-right: 5px;
}

button {
    cursor: pointer;
    padding: 5px 10px;
}
