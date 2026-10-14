const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyxjXZ9obK2aQ7ZzsNsyJZaYgzvWO0LUJ2GVWreN9JGt2g4jUOxVpVwCZAcnSDk-iVl/exec';

let currentReservationData = null;
let selections = {};
let allGuestNames = [];

const screens = {
    search: document.getElementById('step-search'),
    config: document.getElementById('step-configure'),
    review: document.getElementById('step-review'),
    success: document.getElementById('step-success')
};
// --- BACKGROUND MUSIC SEAMLESS INTERACTION LOOPER ENGINE ---
document.addEventListener("DOMContentLoaded", () => {
    const enterBtn = document.getElementById("btn-enter-invitation");
    const curtain = document.getElementById("music-permission-overlay");
    const weddingMusic = document.getElementById("bg-wedding-music");

    if (enterBtn && curtain && weddingMusic) {
        enterBtn.addEventListener("click", () => {
            // 1. Trigger continuous looped playback sequence sequence
            weddingMusic.volume = 0.5; // Set to comfortable 50% background audio scale
            weddingMusic.play().catch(audioErr => {
                console.warn("[AUDIO PROMPT WARNING] Playback stalled by device constraint:", audioErr);
            });

            // 2. Smoothly dissolve the welcoming overlay curtain away
            curtain.classList.add("hide-curtain");
        });
    }
});

// ==========================================================================
// 🎬 SILENT OVERRIDE ROUTER (TRIGGERS ONE-TIME CSS SLIDE ANIMATION)
// ==========================================================================
function switchScreen(targetScreen) {
    console.log("[ROUTER STATE] Advancing section focus views...");
    
    // 1. Remove the active tag from your screens map exactly like before before
    Object.values(screens).forEach(s => s.classList.remove('active'));
    
    // 2. Add active to the incoming screen (this automatically triggers the CSS animation!)
    targetScreen.classList.add('active');
    
    // 3. Snap page layout focus tracking back to top margins
    window.scrollTo(0, 0);
}

// --- CUSTOM DIALOG MODAL ENGAGEMENT ENGINE ---
function showCustomAlert(message) {
    const modal = document.getElementById('custom-alert-modal');
    const msgElement = document.getElementById('modal-alert-message');
    if (modal && msgElement) {
        msgElement.textContent = message;
        modal.classList.add('show');
    }
}

// Bind close element click listener once DOM mounts
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('btn-close-modal');
    const modal = document.getElementById('custom-alert-modal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    }
});

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
        .catch(err => {
            console.error("[INIT ERROR] Autocomplete pre-load failed:", err);
            console.warn("[INIT WARN] The search box will fallback to direct row scanning matching rules.");
        });
});

// Autocomplete Input Listening Logic
const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');

// --- AUTOCOMPLETE DROPDOWN CONDITIONAL SWITCH LOGIC ---
searchInput.addEventListener('input', function() {
    const val = this.value.trim().toLowerCase();
    autocompleteList.innerHTML = '';
    
    // If the input box is cleared, strip out the visibility styling and stop execution
    if (!val) {
        autocompleteList.classList.remove('visible');
        return;
    }

    const filtered = allGuestNames.filter(name => name.toLowerCase().includes(val));
    
    // Check if we actually have names to show
    if (filtered.length > 0) {
        autocompleteList.classList.add('visible'); // Slaps the border and shadows on cleanly
        
        filtered.forEach(name => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = name;
            item.addEventListener('click', () => {
                searchInput.value = name;
                autocompleteList.innerHTML = '';
                autocompleteList.classList.remove('visible'); // Hide after clicking a name
            });
            autocompleteList.appendChild(item);
        });
    } else {
        // Hide border rules if a user types random letters that don't match any guest names
        autocompleteList.classList.remove('visible');
    }
});

// Clean up border frames instantly if the user clicks anywhere else outside the search box
document.addEventListener('click', (e) => {
    if (e.target !== searchInput) {
        autocompleteList.innerHTML = '';
        autocompleteList.classList.remove('visible');
    }
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
            showCustomAlert("We couldn't connect to the guest database. Please check your internet connection and try again.");
        });
});

// --- STEP 2: BUILD CONFIG UI WITH SINGULAR GRAMMAR CORRECTOR ---
function setupConfigurationScreen(data) {
    document.getElementById('config-guest-title').textContent = data.mainGuest.toUpperCase();
    
    const seatCount = parseInt(data.seats) || 0;
    
    // Inject raw integer numbers
    document.getElementById('text-seats-count').textContent = seatCount;
    document.getElementById('allowed-seats-count').textContent = seatCount;
    
    // --- SMART GRAMMAR CHECK ENGINE ---
    const textSeatsWord = document.getElementById('text-seats-word');
    const allowedSeatsLabel = document.getElementById('allowed-seats-label');
    
    if (seatCount === 1) {
        textSeatsWord.textContent = "seat";
        allowedSeatsLabel.textContent = "RESERVED SEAT";
    } else {
        textSeatsWord.textContent = "seats";
        allowedSeatsLabel.textContent = "RESERVED SEATS";
    }
    // --- SMART GRAMMAR CHECK END ---
    
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

    // Loop through the fixed, complete finalMembersList array instead (Keeps main guest & filters ghost entries)
    finalMembersList.forEach((member) => {
        if(!data.savedResponses) selections[member] = null;
        const currentChoice = selections[member];

        // Determine pre-loaded emoji state if user is returning to edit an existing RSVP
        let initialEmoji = '';
        if (currentChoice === 'yes') initialEmoji = '🤩';
        if (currentChoice === 'no') initialEmoji = '🥺';

        const guestBox = document.createElement('div');
        guestBox.className = 'guest-decision-card';
        guestBox.innerHTML = `
            <div class="guest-name">
                <span>${member}</span>
                <span id="emoji-${member.replace(/\s+/g, '-')}" class="status-emoji-indicator ${currentChoice === 'yes' ? 'emoji-pop-zoom' : currentChoice === 'no' ? 'emoji-slam-roll' : ''}">${initialEmoji}</span>
            </div>
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

// --- DYNAMIC SELECTION TRACKER WITH KINETIC EMOJI PHYSICS ENGINES ---
function makeSelection(member, decision, clickedBtn) {
    selections[member] = decision;
    
    // Locate the specific emoji tracker element for this person
    const emojiTarget = document.getElementById(`emoji-${member.replace(/\s+/g, '-')}`);
    
    if (emojiTarget) {
        // Strip out any previous lingering animation classes so the system resets fully
        emojiTarget.classList.remove('emoji-pop-zoom', 'emoji-slam-roll');
        
        // Force the web browser to register a layout reflow reset (re-triggers clean timeline state)
        void emojiTarget.offsetWidth; 
        
        if (decision === 'yes') {
            emojiTarget.textContent = '🤩';
            emojiTarget.classList.add('emoji-pop-zoom'); // Triggers springy burst pop
        } else if (decision === 'no') {
            emojiTarget.textContent = '🥺';
            emojiTarget.classList.add('emoji-slam-roll'); // Triggers slam and roll shuffle
        }
    }
    
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

// --- STRICT PHILIPPINE MOBILE NUMBER MASK ENGINE (+63 9XX XXX XXXX) ---
document.getElementById('mobile-input').addEventListener('input', function(e) {
    let raw = this.value.replace(/\D/g, ''); // Strip all non-digits
    
    // Force the number to always begin with the country code 63
    if (!raw.startsWith('63')) {
        raw = '63' + raw;
    }
    
    // Truncate to maximum length (2-digit country code + 10-digit mobile = 12 digits max)
    if (raw.length > 12) raw = raw.substring(0, 12);
    
    // Build the formatted layout string dynamically with perfect spacing gaps
    let formatted = '+63 ';
    if (raw.length > 2) {
        formatted += raw.substring(2, 5); // 3-digit prefix (e.g., 917)
    }
    if (raw.length > 5) {
        formatted += ' ' + raw.substring(5, 8); // Next 3 digits
    }
    if (raw.length > 8) {
        formatted += ' ' + raw.substring(8, 12); // Final 4 digits
    }
    
    this.value = formatted;
});

// Strict block to prevent users from accidentally backspacing or deleting the initial "+63 " prefix
document.getElementById('mobile-input').addEventListener('keydown', function(e) {
    if (this.selectionStart < 5 && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
    }
});

// --- STEP 3: ARRANGE SUMMARY LISTS WITH VISIBLE NAMES & THEMED ICONS ---
document.getElementById('btn-go-to-review').addEventListener('click', function() {
    console.log("[REVIEW ACTION] Processing verification steps. Evaluating current selections list:", selections);
    
    const unanswered = Object.values(selections).some(val => val === null);
    if (unanswered) {
        showCustomAlert("Please make a selection for every guest before moving forward.");
        return;
    }

    const attendingList = document.getElementById('review-list-attending');
    const declinedList = document.getElementById('review-list-declined');
    
    // Clear out any old lingering list elements cleanly
    attendingList.innerHTML = '';
    declinedList.innerHTML = '';

    let countAttending = 0;

    // Loop through selections correctly using explicit key-value parameters
    Object.keys(selections).forEach(name => {
        const decision = selections[name];
        const li = document.createElement('li');
        li.textContent = name;
        
        if (decision === 'yes') {
            countAttending++;
            attendingList.appendChild(li);
        } else {
            declinedList.appendChild(li);
        }
    });

    // Elegant text fallback placeholders if a whole group responds uniformly
    if (attendingList.children.length === 0) {
        const fallbackLi = document.createElement('li');
        fallbackLi.textContent = "None";
        fallbackLi.className = "empty-placeholder";
        attendingList.appendChild(fallbackLi);
    }
    if (declinedList.children.length === 0) {
        const fallbackLi = document.createElement('li');
        fallbackLi.textContent = "None";
        fallbackLi.className = "empty-placeholder";
        declinedList.appendChild(fallbackLi);
    }

    // --- BUTTON RESET INJECTION: Clear out old session states before showing review ---
    const finalSubmitBtn = document.getElementById('btn-submit-rsvp');
    if (finalSubmitBtn) {
        finalSubmitBtn.disabled = false;           // Re-enables the button for editing
        finalSubmitBtn.textContent = 'Submit RSVP'; // Reverts text from "Saving updates..." back to default
    }
    // --- END OF INJECTION ---

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
        const isAnyoneAttending = Object.values(selections).some(decision => decision === 'yes');
        const cinematicScreen = document.getElementById('marvel-cinematic-intro');

        if (isAnyoneAttending && cinematicScreen) {
            // The continuous background wedding music KEEPS PLAYING beautifully in the background 
            // as the blackout curtain arrives and the cinematic words roll out!
            cinematicScreen.classList.remove('fade-out-curtain');
            cinematicScreen.classList.add('activated-curtain');
            switchScreen(screens.success);
            
            setTimeout(() => {
                cinematicScreen.classList.add('fade-out-curtain');
                setTimeout(() => {
                    cinematicScreen.classList.remove('activated-curtain');
                }, 800);
            }, 7400);

        } else {
            console.log("[SUBMIT SUCCESS] Entire group declined. Transitioning instantly.");
            if (cinematicScreen) cinematicScreen.style.display = 'none';
            switchScreen(screens.success);
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.textContent = 'Submit RSVP';
        showCustomAlert("An error occurred while saving your RSVP. Please try clicking Submit again.");
    });

});

// ==========================================================================
// 🎬 DYNAMIC 3D RETRO FLIP-CLOCK MECHANICS TIME TRACK ENGINE
// ==========================================================================
function runLiveWedding3DFlipClock() {
    const targetDate = new Date("March 13, 2027 15:00:00").getTime(); // Target Date Tracker

    // Core execution runner function
    function update3DClockCards() {
        const now = new Date().getTime();
        const gap = targetDate - now;

        // Metric mathematical structural units
        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;

        // Exit criteria check if wedding date passes successfully live
        if (gap <= 0) {
            clearInterval(clockEngineInterval);
            const container = document.querySelector(".countdown-flip-container");
            if (container) {
                container.innerHTML = '<p class="countdown-header-tag" style="color:var(--primary-color);">✨ Today is the Big Day! 🥂</p>';
            }
            return;
        }

        // Calculate time calculations
        const d = String(Math.floor(gap / day)).padStart(2, '0');
        const h = String(Math.floor((gap % day) / hour)).padStart(2, '0');
        const m = String(Math.floor((gap % hour) / minute)).padStart(2, '0');
        const s = String(Math.floor((gap % minute) / second)).padStart(2, '0');

        // Apply 3D physics execution logic tracks across each section cards group
        flipCardNodeUpdate(document.getElementById("clock-days-card"), d);
        flipCardNodeUpdate(document.getElementById("clock-hours-card"), h);
        flipCardNodeUpdate(document.getElementById("clock-minutes-card"), m);
        flipCardNodeUpdate(document.getElementById("clock-seconds-card"), s);
    }

    // --- PERFECTLY SYNCHRONIZED 3D MATRIX SWAPPER ENGINE ---
    function flipCardNodeUpdate(cardContainer, newStringValue) {
        if (!cardContainer) return;

        const backgroundTop = cardContainer.querySelector(".b-top");
        const backgroundBottom = cardContainer.querySelector(".b-bottom");
        const foregroundTop = cardContainer.querySelector(".f-top");
        const foregroundBottom = cardContainer.querySelector(".f-bottom");

        // Verify if numeric values actually shifted before re-triggering mechanical flips
        if (foregroundTop.textContent === newStringValue) return;

        // 1. Load the upcoming new number onto the background layers
        backgroundTop.textContent = newStringValue;
        backgroundBottom.textContent = newStringValue;

        // 2. Inject active 3D rotation animation classes safely
        cardContainer.classList.add("animate-flip");

        // 3. THE MILLISECOND FIX: Updates numbers exactly as the 400ms animation finishes
        setTimeout(() => {
            foregroundTop.textContent = newStringValue;
            foregroundBottom.textContent = newStringValue;
            cardContainer.classList.remove("animate-flip"); // Strip tag out to prepare for next second
        }, 390); // Perfectly synced with the 0.4s CSS curve time tracks!
    }

    // Fire processing metrics immediately on initialization, then set execution cadence loops
    update3DClockCards();
    const clockEngineInterval = setInterval(update3DClockCards, 1000);
}

// ==========================================================================
// 🎬 BOOT UP THE UPGRADED 3D CLOCK ENGINE SAFELY
// ==========================================================================
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runLiveWedding3DFlipClock);
} else {
    runLiveWedding3DFlipClock();
}

// ==========================================================================
// 🎨 INTERACTIVE COLOR SWATCH LOUPE ENGINE (SCROLL-LOCKED ENGINE)
// ==========================================================================
document.addEventListener("click", function(e) {
    const swatch = e.target.closest(".color-swatch");
    const modalOverlay = document.getElementById("swatch-inspector-modal");
    const modalCircle = document.getElementById("modal-color-circle");
    const modalLabel = document.getElementById("modal-color-label");

    if (swatch && modalOverlay && modalCircle && modalLabel) {
        e.stopPropagation();

        // Extract background color properties and custom data attributes
        const hexColor = swatch.style.backgroundColor;
        const colorName = swatch.getAttribute("data-name");

        // Sync values directly into the modal nodes
        modalCircle.style.backgroundColor = hexColor;
        modalLabel.textContent = colorName;

        // 1. Activate the modal overlay view layer
        modalOverlay.classList.add("active-view");
        
        // 2. THE LOCK FIX: Freezes the entire webpage scrolling background tracks instantly
        document.body.classList.add("modal-scroll-lock");
        return; 
    }

    // 3. DISMISSAL: If the modal overlay frame is active and they click away, dissolve it
    const activeModal = document.querySelector(".swatch-modal-overlay.active-view");
    if (activeModal) {
        activeModal.classList.remove("active-view");
        
        // 4. UNLOCK: Restore normal finger thumb scrolling capabilities instantly
        document.body.classList.remove("modal-scroll-lock");
    }
});
// ==========================================================================
// 🔄 SMOOTH NAVIGATION BACK-ROUTE FROM SUCCESS HUB TO SCREEN 2
// ==========================================================================
function switchBackToEditMode() {
    console.log("[ROUTER PATH] User requested adjustment. Redirecting back to guest panel view...");

    const submittedBanner = document.getElementById('already-submitted-banner');
    
    if (submittedBanner) {
        // Automatically inject your playful lavender returning-user notice!
        submittedBanner.style.display = 'block';
    }

    // Use your existing app screen layout tracker engine to jump straight back to Page 2
    if (typeof switchScreen === 'function' && screens && screens.config) {
        switchScreen(screens.config);
    } else {
        // Safe robust fallback layout switch logic if configuration objects aren't globally bound
        switchScreen('step-configure'); 
    }
}



