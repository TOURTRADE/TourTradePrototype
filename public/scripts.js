document.addEventListener("DOMContentLoaded", function () {
    // Ottiene i parametri dall'URL per fallback
    const urlParams = new URLSearchParams(window.location.search);
    const urlLoggedIn = urlParams.get("loggedIn") === "true";
    const urlUserType = urlParams.get("userType");

    // Controlla `localStorage` come prima opzione
    const isLoggedIn = localStorage.getItem("loggedIn") === "true" || urlLoggedIn;
    const userType = localStorage.getItem("userType") || urlUserType;

    // Memorizza lo stato di login nei parametri dell'URL se `localStorage` è assente
    if (!localStorage.getItem("loggedIn") && urlLoggedIn) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userType", urlUserType);
    }

    // Gestione del redirect alla dashboard
    const isDashboardPage = window.location.pathname.includes("dashboard");
    if (!isLoggedIn && isDashboardPage) {
        window.location.href = 'login.html';
    }
    if (isLoggedIn && window.location.pathname.includes("login")) {
        window.location.href = getDashboardURL(userType);
    }

    updatePersonalArea(); // Aggiorna l'area personale al caricamento della pagina
});

// Funzione per mostrare o nascondere la tendina dell'area personale
function togglePersonalArea(event) {
    event.stopPropagation();
    const personalArea = document.getElementById("personalArea");
    personalArea.classList.toggle("show");
}

// Chiudi la tendina se si fa clic all'esterno
window.addEventListener("click", function(event) {
    const personalArea = document.getElementById("personalArea");
    const personalIcon = document.querySelector(".personal-icon");

    if (!personalIcon.contains(event.target) && !personalArea.contains(event.target) && personalArea.classList.contains("show")) {
        personalArea.classList.remove("show");
    }
});

// Funzione per ottenere l'URL della dashboard in base al tipo di utente
function getDashboardURL(userType) {
    switch (userType) {
        case 'customer':
            return 'dashboard-customer.html';
        case 'operator':
            return 'dashboard-operator.html';
        case 'agency':
            return 'dashboard-agency.html';
        default:
            return 'dashboard.html';
    }
}

// Funzione per aggiornare l'area personale in base allo stato di login
function updatePersonalArea() {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const userType = localStorage.getItem("userType");
    const personalArea = document.getElementById("personalArea");

    if (isLoggedIn && userType) {
        personalArea.innerHTML = `
            <h3>AREA PERSONALE</h3>
            <a href="${getDashboardURL(userType)}">La Mia Dashboard</a>
            <a href="#" id="logout-link">Logout</a>
        `;
        document.getElementById("logout-link").addEventListener("click", function (event) {
            event.preventDefault();
            logout();
        });
    } else {
        personalArea.innerHTML = `
            <h3>AREA PERSONALE</h3>
            <a href="login.html" id="login-link">Login</a>
            <a href="signup.html" id="signup-link">Sign Up</a>
        `;
    }
}

// Funzione di login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            const userType = data.userType;

            // Salva lo stato di login e il tipo di utente in localStorage
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("userType", userType);

            // Reindirizza alla dashboard in base al tipo di utente
            window.location.href = getDashboardURL(userType);
        } else {
            alert("Email o password non validi.");
        }
    } catch (error) {
        console.error('Errore durante il login:', error);
        alert('Si è verificato un errore. Riprova più tardi.');
    }
}

// Funzione di logout
function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userType");
    updatePersonalArea();
    window.location.href = "index.html"; // Torna alla home
}

// Funzione di signup
async function handleSignup(event) {
    event.preventDefault();

    const userType = document.getElementById('user-type').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert("Le password non coincidono. Riprova.");
        return;
    }

    // Oggetto dati da inviare
    const userData = {
        userType: userType,
        username: name,
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Registrazione avvenuta con successo! Reindirizzamento al login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const errorData = await response.json();
            alert(`Errore: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        alert('Si è verificato un errore. Riprova più tardi.');
    }
}

// Funzioni per gestire la visibilità della sidebar dei filtri
function toggleFilterSidebar() {
    const sidebar = document.getElementById('filter-sidebar');
    sidebar.classList.toggle('hidden'); // Nasconde o mostra la sidebar

    // Assicurati che la sidebar abbia anche una classe per la visibilità
    if (!sidebar.classList.contains('hidden')) {
        sidebar.classList.add('visible');
    } else {
        sidebar.classList.remove('visible');
    }
}

// Funzioni per gestire i filtri pacchetti e tour
function togglePackageFilters() {
    const packageFilters = document.getElementById("package-filters");
    packageFilters.classList.toggle("hidden");
}

function toggleTourFilters() {
    const tourFilters = document.getElementById("tour-filters");
    tourFilters.classList.toggle("hidden");
}

// Funzioni per applicare i filtri per pacchetti e tour
function applyPackageFilters() {
    const location = document.getElementById("destination").value;
    const priceMin = document.getElementById("price-min").value;
    const priceMax = document.getElementById("price-max").value;
    const packageType = Array.from(document.getElementById("package-type").selectedOptions).map(option => option.value);
    console.log("Filtri pacchetti applicati:", { location, priceMin, priceMax, packageType });
    alert("Filtri per pacchetti applicati!");
}

function applyTourFilters() {
    const location = document.getElementById("tour-location").value;
    const tourDate = document.getElementById("tour-date").value;
    const tourType = Array.from(document.getElementById("tour-type").selectedOptions).map(option => option.value);
    console.log("Filtri tour applicati:", { location, tourDate, tourType });
    alert("Filtri per tour applicati!");
}

// Funzione di ricerca per pacchetti e tour
function searchPackages() {
    const destination = document.querySelector('.search-group input[placeholder="Cerca pacchetto per destinazione"]').value;
    console.log("Ricerca pacchetti per destinazione:", destination);
}

function searchTours() {
    const destination = document.querySelector('.search-group input[placeholder="Cerca tour per destinazione"]').value;
    console.log("Ricerca tour per destinazione:", destination);
}

// Funzione per gestire la selezione del tipo di offerta
function toggleOfferDetails() {
    const offerType = document.getElementById('offer-type').value;
    document.getElementById('package-offer-details').classList.add('hidden');
    document.getElementById('tour-offer-details').classList.add('hidden');
    if (offerType === 'package') {
        document.getElementById('package-offer-details').classList.remove('hidden');
    } else if (offerType === 'tour') {
        document.getElementById('tour-offer-details').classList.remove('hidden');
    }
    document.getElementById('submit-offer-button').classList.toggle('hidden', !offerType); 
}

// Funzione per calcolare il punteggio
function calculateScore(entity) {
    let score = entity.sales || 0;
    entity.reviews.forEach(review => {
        if (review === 1) score -= 1;
        else if (review === 2) score -= 0.5;
        else if (review === 4) score += 1;
        else if (review === 5) score += 2;
    });
    score += Math.floor(entity.visits / 100) * 5;
    return score;
}

// Funzione per popolare i caroselli
function populateTrendingCarousels() {
    const trendingAgenciesList = document.getElementById("trending-agencies-list");
    agencies.forEach(agency => { agency.score = calculateScore(agency); });
    const sortedAgencies = agencies.sort((a, b) => b.score - a.score);
    sortedAgencies.forEach(agency => {
        const div = document.createElement("div");
        div.classList.add("carousel-item");
        div.innerHTML = `<h4>${agency.name}</h4><p>Punteggio: ${agency.score}</p>`;
        trendingAgenciesList.appendChild(div);
    });

    const trendingOperatorsList = document.getElementById("trending-operators-list");
    operators.forEach(operator => { operator.score = calculateScore(operator); });
    const sortedOperators = operators.sort((a, b) => b.score - a.score);
    sortedOperators.forEach(operator => {
        const div = document.createElement("div");
        div.classList.add("carousel-item");
        div.innerHTML = `<h4>${operator.name}</h4><p>Punteggio: ${operator.score}</p>`;
        trendingOperatorsList.appendChild(div);
    });

    const trendingPackagesList = document.getElementById("trending-packages-list");
    packages.forEach(pkg => { pkg.score = calculateScore(pkg); });
    const sortedPackages = packages.sort((a, b) => b.score - a.score);
    sortedPackages.forEach(pkg => {
        const div = document.createElement("div");
        div.classList.add("carousel-item");
        div.innerHTML = `<h4>${pkg.name}</h4><p>Punteggio: ${pkg.score}</p>`;
        trendingPackagesList.appendChild(div);
    });
}

// Carica i caroselli all'avvio della pagina
document.addEventListener("DOMContentLoaded", () => {
    populateTrendingCarousels();
});
