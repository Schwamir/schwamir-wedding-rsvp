const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbfWZJojYuKCDlmZIztb3xDWmN1VrTLET_qCB4_OcUtRtb-7rVqjphUk19WNNFhCp0/exec';

let currentReservationData = null;
let selections = {};
let allGuestNames = [];

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

// --- PRE-LOAD ALL GUEST NAMES FOR AUTOCOMPLETE ---
window.addEventListener('DOMContentLoaded', () => {
    console.log("[INIT] Pre-loading guest database names directly from Google...");
    const targetUrl = `${SCRIPT_URL}?action=getAll`;
    
    fetch(targetUrl)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.names) {
                allGuestNames = data.names;
                console.log(`[INIT] Loaded ${allGuestNames.length} names successfully into memory.`);
            }
        })
        .catch(err => console.error("[INIT ERROR] Autocomplete pre-load failed:", err));
});

// Autocomplete Input Listening Logic
const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');

searchInput.addEventListener('input', function() {
    const val = this.value.trim().toLowerCase();
    autocompleteList.innerHTML = '';
    if (!val) return;

    const filtered = allGuestNames.filter(name => name.toLowerCase().includes(val));
    filtered.forEach(name => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = name;
        item.addEventListener('click', () => {
            searchInput.value = name;
            autocompleteList.innerHTML = '';
        });
        autocompleteList.appendChild(item);
    });
});

document.addEventListener('click', (e) => {
    if (e.target !== searchInput) autocompleteList.innerHTML = '';
});

// --- STEP 1: GUEST LOOKUP HANDLER ---
document.getElementById('btn-find-invite').addEventListener('click', function() {
    const nameInput = searchInput.value.trim();
    const errorElement = document.getElementById('search-error');
    const btn = this;
    
    if(!nameInput) return;
    
    btn.disabled = true;
    btn.textContent = 'Searching...';
    errorElement.style.display = 'none';

    const finalUrl = `${SCRIPT_URL}?name=${encodeURIComponent(nameInput)}`;
    console.log(`[LOOKUP NETWORK] Dispatching pipeline directly to Google: ${finalUrl}`);
    
    fetch(finalUrl)
        .then(res => res.json())
        .then(data => {
            console.log("[LOOKUP RESULT] Decoded payload data from sheet:", data);
            btn.disabled = false;
            btn.textContent = 'Find My Invitation';
            
            if (data.error) {
                console.error(`[LOOKUP ERROR] Match stopped: ${data.error}`);
                errorElement.style.display = 'block';
            } else {
                console.log("[LOOKUP SUCCESS] Match confirmed. Rendering selection cards...");
                currentReservationData = data;
                setupConfigurationScreen(data);
            }
        })
        .catch(err => {
            btn.disabled = false;
            btn.textContent = 'Find My Invitation';
            console.error("[LOOKUP CRITICAL FAILURE] Browser intercepted execution routing:", err);
            alert(`Diagnostic trace alert: ${err.message}`);
        });
});

// --- STEP 2: GROUP SELECTION WITH BUILT-IN MAIN GUEST LOGIC PATCH ---
function setupConfigurationScreen(data) {
    document.getElementById('config-guest-title').textContent = data.mainGuest.toUpperCase();
    document.getElementById('allowed-seats-count').textContent = data.seats;
    
    const phoneInput = document.getElementById('mobile-input');
    phoneInput.value = data.mobile ? data.mobile : "+63 ";
    
    const banner = document.getElementById('already-submitted-banner');
    if(data.savedResponses) {
        banner.style.display = 'block';
        selections = data.savedResponses; 
    } else {
        banner.style.display = 'none';
        selections = {};
    }
    
    // --- LOGIC PATCH START (CLEANS GHOST GUESTS) ---
    // Pull the members array, but immediately filter out any completely empty strings or trailing spaces!
    let finalMembersList = [...data.members].map(m => m.trim()).filter(m => m !== "");
    const mainGuestName = data.mainGuest.trim();

    // Check if the main guest's name is already listed in the cleaned group members array
    const isMainGuestInList = finalMembersList.some(m => m.toLowerCase() === mainGuestName.toLowerCase());

    // If it's missing (or if the list was completely empty because the cell was blank), add the main guest to the top
    if (!isMainGuestInList) {
        finalMembersList.unshift(mainGuestName);
    }
    // --- LOGIC PATCH END ---
    
    const container = document.getElementById('dynamic-guest-list');
    container.innerHTML = '';

    // Loop through the fixed, complete finalMembersList array instead
    finalMembersList.forEach((member) => {
        if(!data.savedResponses) selections[member] = null;
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

    tallySelections();
    switchScreen(screens.config);
}

function makeSelection(member, decision, clickedBtn) {
    selections[member] = decision;
    const parent = clickedBtn.parentElement;
    Array.from(parent.children).forEach(btn => btn.classList.remove('selected'));
    clickedBtn.classList.add('selected');
    tallySelections();
}

function tallySelections() {
    const totalSelectedAttending = Object.values(selections).filter(v => v === 'yes').length;
    document.getElementById('current-selection-tally').textContent = totalSelectedAttending;
    
    const maxAllowed = currentReservationData.seats;
    const warningBanner = document.getElementById('seat-warning-banner');
    
    if (totalSelectedAttending > maxAllowed) {
        warningBanner.style.display = 'block';
        document.getElementById('btn-go-to-review').disabled = true;
        document.getElementById('btn-go-to-review').style.opacity = '0.5';
    } else {
        warningBanner.style.display = 'none';
        document.getElementById('btn-go-to-review').disabled = false;
        document.getElementById('btn-go-to-review').style.opacity = '1';
    }
}

// Mobile Number Mask Formatting Engine (+63 9XX XXX XXXX)
document.getElementById('mobile-input').addEventListener('input', function(e) {
    let raw = this.value.replace(/\D/g, ''); 
    
    if (!raw.startsWith('63')) {
        raw = '63' + raw;
    }
    
    if (raw.length > 12) raw = raw.substring(0, 12);
    
    let formatted = '+63 ';
    if (raw.length > 2) {
        formatted += raw.substring(2, 5); 
    }
    if (raw.length > 5) {
        formatted += ' ' + raw.substring(5, 8); 
    }
    if (raw.length > 8) {
        formatted += ' ' + raw.substring(8, 12); 
    }
    
    this.value = formatted;
});

document.getElementById('mobile-input').addEventListener('keydown', function(e) {
    if (this.selectionStart < 5 && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
    }
});

// --- STEP 3: ARRANGE SUMMARY LISTS WITH VISIBLE NAMES ---
document.getElementById('btn-go-to-review').addEventListener('click', function() {
    console.log("[REVIEW ACTION] Processing verification steps. Evaluating current selections list:", selections);
    
    const unanswered = Object.values(selections).some(val => val === null);
    if (unanswered) {
        alert("Please make a selection for every guest before moving forward.");
        return;
    }

    const attendingList = document.getElementById('review-list-attending');
    const declinedList = document.getElementById('review-list-declined');
    
    // Clear out any old lingering list elements
    attendingList.innerHTML = '';
    declinedList.innerHTML = '';

    let countAttending = 0;

    // Loop through selections correctly using explicit key-value parameters
    Object.keys(selections).forEach(name => {
        const decision = selections[name];
        const li = document.createElement('li');
        li.textContent = name;
        li.style.margin = "8px 0"; // Clean vertical spacing for list items
        
        if (decision === 'yes') {
            countAttending++;
            attendingList.appendChild(li);
        } else {
            declinedList.appendChild(li);
        }
    });

    // Make sure empty lists don't look weird by showing a placeholder text if count is 0
    if (attendingList.children.length === 0) {
        attendingList.innerHTML = '<li style="color:#aaa; list-style:none;">None</li>';
    }
    if (declinedList.children.length === 0) {
        declinedList.innerHTML = '<li style="color:#aaa; list-style:none;">None</li>';
    }

    document.getElementById('review-attendance-summary').textContent = `${countAttending} attending`;
    switchScreen(screens.review);
});

document.getElementById('btn-edit-answers').addEventListener('click', function() {
    switchScreen(screens.config);
});

// --- STEP 4: SUBMIT SELECTION TRANSACTION ---
document.getElementById('btn-submit-rsvp').addEventListener('click', function() {
    const btn = this;
    btn.disabled = true;
    btn.textContent = 'Saving updates...';

    const countAttending = Object.values(selections).filter(v => v === 'yes').length;

    const payload = {
        mainGuest: currentReservationData.mainGuest,
        mobile: document.getElementById('mobile-input').value.trim(),
        responses: selections,
        totalConfirmed: countAttending 
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
        alert("An error occurred during submission.");
    });
});
