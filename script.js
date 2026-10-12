const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvNqjXa3NXjy8tp5MqyuITZJ3Agp_vpLmFVwsyRhkmyZlNw_rX4DH8S7RYr-radJ9I/exec';
const PROXY_URL = 'https://allorigins.win';

let currentReservationData = null;
let selections = {};

const screens = {
    search: document.getElementById('step-search'),
    config: document.getElementById('step-configure'),
    review: document.getElementById('step-review'),
    success: document.getElementById('step-success')
};

function switchScreen(targetScreen, name) {
    console.log(`[NAVIGATION] Switching UI layout screen to: ${name}`);
    Object.values(screens).forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
    window.scrollTo(0, 0);
}

// --- STEP 1: GUEST LOOKUP WITH STEP LOGS ---
document.getElementById('btn-find-invite').addEventListener('click', function() {
    const nameInput = document.getElementById('search-input').value.trim();
    const errorElement = document.getElementById('search-error');
    const btn = this;
    
    console.log(`[LOOKUP START] User clicked Search. Input value gathered: "${nameInput}"`);
    
    if (!nameInput) {
        console.warn("[LOOKUP WARN] Search was clicked but the text input field was empty.");
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Searching...';
    errorElement.style.display = 'none';

    const targetApiUrl = `${SCRIPT_URL}?name=${encodeURIComponent(nameInput)}`;
    const fullProxyUrl = `${PROXY_URL}${encodeURIComponent(targetApiUrl)}`;
    
    console.log(`[LOOKUP NETWORK] Target Apps Script URL: ${targetApiUrl}`);
    console.log(`[LOOKUP NETWORK] Channelling request through Proxy: ${fullProxyUrl}`);
    
    fetch(fullProxyUrl)
        .then(res => {
            console.log(`[LOOKUP NETWORK HTTP] Proxy connection response received. Status code: ${res.status}`);
            if (!res.ok) throw new Error(`HTTP network response failed with status ${res.status}`);
            return res.json();
        })
        .then(wrapper => {
            console.log("[LOOKUP NETWORK DATA] Raw wrapper object package pulled from AllOrigins:", wrapper);
            
            if (!wrapper.contents) {
                throw new Error("Proxy returned a successful envelope package but the '.contents' field is completely empty.");
            }
            
            const data = JSON.parse(wrapper.contents);
            console.log("[LOOKUP PARSED RESULT] Decoded database sheet response object payload:", data);
            
            btn.disabled = false;
            btn.textContent = 'Find My Invitation';
            
            if (data.error) {
                console.error(`[LOOKUP ERROR] Database matched failure response status: ${data.error}`);
                errorElement.style.display = 'block';
            } else {
                console.log("[LOOKUP SUCCESS] Valid guest mapping found. Proceeding to layout builder...");
                currentReservationData = data;
                setupConfigurationScreen(data);
            }
        })
        .catch(err => {
            btn.disabled = false;
            btn.textContent = 'Find My Invitation';
            console.error("[LOOKUP CRITICAL FAILURE] Execution loop caught an error exception:", err);
            alert(`Could not reach the database. Error diagnostic logs trace: ${err.message}`);
        });
});

// --- STEP 2: BUILD SELECTION MATRIX LOGS ---
function setupConfigurationScreen(data) {
    console.log("[RENDER CONFIG] Building selection cards layout for payload matrix:", data);
    
    try {
        document.getElementById('config-guest-title').textContent = data.mainGuest.toUpperCase() + (data.members.length > 1 ? " & FAMILY" : "");
        document.getElementById('allowed-seats-count').textContent = data.seats;
        document.getElementById('mobile-input').value = data.mobile || "";
        
        document.getElementById('group-notice').style.display = data.members.length > 1 ? 'block' : 'none';
        
        const banner = document.getElementById('already-submitted-banner');
        if (data.savedResponses) {
            console.log("[RENDER CONFIG] Detected historical entry response database fields:", data.savedResponses);
            banner.style.display = 'block';
            selections = data.savedResponses; 
        } else {
            console.log("[RENDER CONFIG] Clean instance: No historical response profiles found for guest row.");
            banner.style.display = 'none';
            selections = {};
        }
        
        const container = document.getElementById('dynamic-guest-list');
        container.innerHTML = '';

        data.members.forEach((member, index) => {
            if (!data.savedResponses) {
                selections[member] = null;
            }

            const currentChoice = selections[member];
            console.log(`[RENDER CONFIG] Appending target member box index [${index}]: "${member}" | Active Pre-Selection state: ${currentChoice}`);

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

        switchScreen(screens.config, "Guest Configuration Screen");
    } catch(err) {
        console.error("[RENDER CONFIG CRITICAL ERROR] Failure processing UI component injections:", err);
    }
}

function makeSelection(member, decision, clickedBtn) {
    selections[member] = decision;
    console.log(`[INTERACTION SELECT] Registered entry change: "${member}" status updated to -> ${decision.toUpperCase()}`);
    
    const parent = clickedBtn.parentElement;
    Array.from(parent.children).forEach(btn => btn.classList.remove('selected'));
    clickedBtn.classList.add('selected');
}

// --- STEP 3: REVIEW SUMMARY LOGS ---
document.getElementById('btn-go-to-review').addEventListener('click', function() {
    console.log("[REVIEW ACTION] Processing verification steps. Evaluating current selections list:", selections);
    
    const unanswered = Object.values(selections).some(val => val === null);
    if (unanswered) {
        console.warn("[REVIEW WARN] Verification blocked: Some party group members remain unassigned.");
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
        if (decision === 'yes') {
            countAttending++;
            attendingList.appendChild(li);
        } else {
            declinedList.appendChild(li);
        }
    }

    console.log(`[REVIEW GENERATED] Layout verification finished. Tally total counts: ${countAttending} of ${totalGuests} attending.`);
    document.getElementById('review-attendance-summary').textContent = `${countAttending} of ${totalGuests} attending`;
    switchScreen(screens.review, "Review Summary Confirmation Screen");
});

document.getElementById('btn-edit-answers').addEventListener('click', function() {
    console.log("[REVIEW CANCEL] Edit answers requested. Returning to selection view map.");
    switchScreen(screens.config, "Guest Configuration Screen");
});

// --- STEP 4: SUBMIT LOGS ---
document.getElementById('btn-submit-rsvp').addEventListener('click', function() {
    const btn = this;
    console.log("[SUBMIT DATA] Initiating transaction commit database post flow...");
    
    btn.disabled = true;
    btn.textContent = 'Saving updates...';

    const payload = {
        mainGuest: currentReservationData.mainGuest,
        mobile: document.getElementById('mobile-input').value.trim(),
        responses: selections
    };

    console.log("[SUBMIT PAYLOAD] Bundled data packet object targeting cloud sheet server:", payload);

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        console.log("[SUBMIT COMPLETE] Transaction executed under 'no-cors' delivery layer successfully.");
        switchScreen(screens.success, "Success Frame Confirmation View");
    })
    .catch(err => {
        btn.disabled = false;
        btn.textContent = 'Submit RSVP';
        console.error("[SUBMIT CRITICAL FAILURE] Execution engine failed to resolve transaction delivery:", err);
        alert(`An error occurred during submission trace route: ${err.message}`);
    });
});
