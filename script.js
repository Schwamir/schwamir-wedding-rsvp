// PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL HERE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbymhG4VNOXT3rr7w6lsHk7iA2sb41kuaFkKVr3v7U_91aNYctNHG_lunEZFd69y5SyX/exec';

let currentReservationData = null;
let selections = {};

const screens = {
    search: document.getElementById('step-search'),
    config: document.getElementById('step-configure'),
    review: document.getElementById('step-review'),
    success: document.getElementById('step-success')
};

function switchScreen(targetScreen) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
    window.scrollTo(0,0);
}

// --- STEP 1: GUEST SELECTION FETCH ---
document.getElementById('btn-find-invite').addEventListener('click', function() {
    const nameInput = document.getElementById('search-input').value.trim();
    const errorElement = document.getElementById('search-error');
    const btn = this;
    
    if(!nameInput) return;
    
    btn.disabled = true;
    btn.textContent = 'Searching...';
    errorElement.style.display = 'none';

    fetch(`${SCRIPT_URL}?name=${encodeURIComponent(nameInput)}`)
        .then(res => res.json())
        .then(data => {
            btn.disabled = false;
            btn.textContent = 'Find My Invitation';
            
            if(data.error) {
                errorElement.style.display = 'block';
            } else {
                currentReservationData = data;
                setupConfigurationScreen(data);
            }
        })
        .catch(err => {
            btn.disabled = false;
            btn.textContent = 'Find My Invitation';
            alert("Network error. Please try again.");
        });
});

// --- STEP 2: BUILD SELECTION MATRIX ---
function setupConfigurationScreen(data) {
    document.getElementById('config-guest-title').textContent = data.mainGuest.toUpperCase() + (data.members.length > 1 ? " & FAMILY" : "");
    document.getElementById('allowed-seats-count').textContent = data.seats;
    document.getElementById('mobile-input').value = data.mobile || "";
    
    document.getElementById('group-notice').style.display = data.members.length > 1 ? 'block' : 'none';
    
    const banner = document.getElementById('already-submitted-banner');
    if(data.savedResponses) {
        banner.style.display = 'block';
        selections = data.savedResponses; 
    } else {
        banner.style.display = 'none';
        selections = {};
    }
    
    const container = document.getElementById('dynamic-guest-list');
    container.innerHTML = '';

    data.members.forEach((member) => {
        if(!data.savedResponses) {
            selections[member] = null;
        }

        const currentChoice = selections[member];

        const guestBox = document.createElement('div');
        guestBox.className = 'guest-decision-card';
        guestBox.innerHTML = `
            <div class="guest-name">${member}</div>
            <div class="decision-buttons">
                <button type="button" class="btn-toggle opt-yes ${currentChoice === 'yes' ? 'selected' : ''}" onclick="makeSelection('${member}', 'yes', this)">Attending</button>
                <button type="button" class="btn-toggle opt-no ${currentChoice === 'no' ? 'selected' : ''}" onclick="makeSelection('${member}', 'no', this)">Not Attending</button>
            </div>
        `;
        container.appendChild(guestBox);
    });

    switchScreen(screens.config);
}

function makeSelection(member, decision, clickedBtn) {
    selections[member] = decision;
    const parent = clickedBtn.parentElement;
    Array.from(parent.children).forEach(btn => btn.classList.remove('selected'));
    clickedBtn.classList.add('selected');
}

// --- STEP 3: ARRANGE SUMMARY LISTS ---
document.getElementById('btn-go-to-review').addEventListener('click', function() {
    const unanswered = Object.values(selections).some(val => val === null);
    if(unanswered) {
        alert("Please make a selection for every guest before moving forward.");
        return;
    }

    const attendingList = document.getElementById('review-list-attending');
    const declinedList = document.getElementById('review-list-declined');
    attendingList.innerHTML = '';
    declinedList.innerHTML = '';

    let countAttending = 0;
    let totalGuests = 0;

    for (const [name, decision] of Object.entries(selections)) {
        totalGuests++;
        const li = document.createElement('li');
        li.textContent = name;
        if(decision === 'yes') {
            countAttending++;
            attendingList.appendChild(li);
        } else {
            declinedList.appendChild(li);
        }
    }

    document.getElementById('review-attendance-summary').textContent = `${countAttending} of ${totalGuests} attending`;
    switchScreen(screens.review);
});

document.getElementById('btn-edit-answers').addEventListener('click', function() {
    switchScreen(screens.config);
});

// --- STEP 4: FINAL POST OVERWRITE TRANSACTION ---
document.getElementById('btn-submit-rsvp').addEventListener('click', function() {
    const btn = this;
    btn.disabled = true;
    btn.textContent = 'Saving updates...';

    const payload = {
        mainGuest: currentReservationData.mainGuest,
        mobile: document.getElementById('mobile-input').value.trim(),
        responses: selections
            };

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        switchScreen(screens.success);
    })
    .catch(err => {
        btn.disabled = false;
        btn.textContent = 'Submit RSVP';
        alert("An error occurred. Please check network logs.");
    });
});
