import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";


// ========================== Voice to Speech =======================
const micBtn = document.getElementById('micBtn');
const textInput = document.getElementById('textInput');
// const sendBtn = document.getElementById('sendBtn');
// const statusText = document.getElementById('statusText');
// const transcriptDisplay = document.getElementById('transcriptDisplay');
// const transcriptText = document.getElementById('transcriptText');
// const suggestionBtns = document.querySelectorAll('.suggestion-btn');

let isRecording = false;
let recognition = null;
let fullTranscript = '';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    // statusText.textContent = "Not supported";
    // statusText.style.color = "#999";
    micBtn.disabled = true;
    micBtn.style.opacity = "0.5";
    micBtn.style.cursor = "not-allowed";
}

micBtn.addEventListener('click', () => {
    console.log('clicked');
    if (isRecording) {
        stopRecording();
        micBtn.classList.remove("recording");
    } else {
        startRecording();
        micBtn.classList.add("recording");
    }
});

function startRecording() {
    isRecording = true;
    micBtn.classList.add('recording');
    textInput.classList.add('recording');
    // statusText.textContent = "Listening...";
    fullTranscript = '';

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = e.resultIndex; i < e.results.length; i++) {
            const transcript = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) {
            fullTranscript += finalTranscript;
        }

        const displayText = fullTranscript + interimTranscript;
        textInput.value = displayText;

        if (fullTranscript.trim()) {
            // transcriptText.textContent = fullTranscript;
            // transcriptDisplay.classList.add('show');
        }
    };

    recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        stopRecording();
        // statusText.textContent = "Error occurred";
        setTimeout(() => statusText.textContent = "", 2000);
    };

    recognition.onend = () => {
        if (isRecording) {
            recognition.start();
            // recognition.stop();
        }
    };

    recognition.start();
}

function stopRecording() {
    isRecording = false;
    // micBtn.classList.remove('recording');
    // textInput.classList.remove('recording');
    // statusText.textContent = "";

    if (recognition) {
        recognition.stop();
        recognition = null;
    }
}

// sendBtn.addEventListener('click', () => {
//     const text = textInput.value.trim();
//     if (text) {
//         alert(`Sending: "${text}"`);
//         textInput.value = '';
//         transcriptDisplay.classList.remove('show');
//         fullTranscript = '';
//     }
// });

textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        // sendBtn.click();
        console.log('Entered');

        appendUserInput(textInput.value.trim());
    }
});

// suggestionBtns.forEach(btn => {
//     btn.addEventListener('click', () => {
//         const text = btn.textContent.trim();
//         textInput.value = text;
//         textInput.focus();
//     });
// });




// ======================= GEMNI ========================

// import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const API_KEY = import.meta.env.VITE_Gemni_API_Key;
const genai = new GoogleGenerativeAI(API_KEY);

const firstAidModel = genai.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `
You are a first-aid guidance assistant.

Your role:
- Provide ONLY safe, general, non-emergency first-aid or self-care steps
- Use prior conversation context for follow-up questions

Strict rules:
- NO diagnosis
- NO medications
- NO medical claims
- NO emergency instructions like calling ambulances or giving CPR steps

Emergency handling (IMPORTANT):
- If symptoms suggest a potentially serious or worsening condition,
  do NOT provide first-aid steps.
- Respond with a calm message advising professional medical consultation.

Output rules:
- Output ONLY valid JSON
- DO NOT wrap in markdown
- Use this exact JSON format:

{
  "emergency": true | false,
  "message": "string",
  "first_aid_steps": []
}

Behavior:
- Non-emergency → emergency=false, provide steps
- Potential emergency → emergency=true, empty steps
`
});

// =========================
// DOM ELEMENTS
// =========================
const input = document.getElementById("textInput");
const chat = document.getElementById("chatContainer");

// =========================
// MEMORY
// =========================
let conversationMemory = [];
const MAX_TURNS = 6; // 3 user + 3 assistant

input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

// =========================
// MAIN FUNCTION
// =========================
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    conversationMemory.push({
        role: "user",
        content: text
    });

    conversationMemory = conversationMemory.slice(-MAX_TURNS);

    try {
        const prompt = buildPrompt(text);

        const response = await firstAidModel.generateContent(prompt);

        let raw = response.response.text()
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(raw);
        // append(JSON.stringify(parsed, null, 2));
        append(formatResponseToString(parsed));

        conversationMemory.push({
            role: "assistant",
            content: raw
        });

        conversationMemory = conversationMemory.slice(-MAX_TURNS);

    } catch (err) {
        console.error(err);
        append("Unable to generate first-aid guidance.");
    }
}

// =========================
// PROMPT BUILDER
// =========================
function buildPrompt(currentInput) {
    return `
PAST CONTEXT:
${conversationMemory
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n")}

CURRENT INPUT:
${currentInput}
`;
}

// =========================
// UI APPEND (UNCHANGED STYLE)
// =========================

function formatResponseToString(parsed) {
    let output = parsed.message || "";

    if (Array.isArray(parsed.first_aid_steps) && parsed.first_aid_steps.length > 0) {
        output += "\n\nFirst Aid:\n";
        output += parsed.first_aid_steps.join("\n");
    }

    return output;
}



function append(message) {
    const div = document.createElement("div");
    div.className = "chat-message";
    div.innerHTML = `${message}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    const mainUI = document.getElementById("mainUI");
    mainUI?.classList.add("chat-started");
}

function appendUserInput(message) {
    const div = document.createElement("div");
    div.className = "chat-message-user";
    div.innerHTML = `${message}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    const mainUI = document.getElementById("mainUI");
    mainUI?.classList.add("chat-started");
}


/* ============== Dark Mode =================== */

if (localStorage.getItem("darkMode") === "true") {
    // Sidebar
    document.getElementById("sidebar").classList.add("dark-modePrimary");

    // Main content
    document.getElementById("contentContainer").classList.add("dark-modePrimary");
    document.getElementById("inputBox").classList.add("dark-modeSecondary");
    document.getElementById("textInput").classList.add("dark-modeTextInput");
    document.getElementById("micBtn").classList.add("dark-modeSecondary");
    document.getElementById("suggestions").classList.add("dark-modeSuggestions");
    document.getElementById("profileMenu").classList.add("dark-modeSecondary");

}

const findDoctorsBtn = document.getElementById("sug3");

findDoctorsBtn.addEventListener("click", () => {
    appendUserInput("Find doctors nearby");
    findNearbyDoctors();
});

function findNearbyDoctors() {
    if (!navigator.geolocation) {
        append("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            loadDoctorsFromGoogleMaps(latitude, longitude);
        },
        () => {
            append("Location permission denied.");
        }
    );
}

function loadDoctorsFromGoogleMaps(lat, lng) {
    if (window.google && window.google.maps) {
        searchDoctors(lat, lng);
        return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GoogleMaps_API_Key}&libraries=places`;
    script.async = true;
    script.onload = () => searchDoctors(lat, lng);
    document.body.appendChild(script);
}

function searchDoctors(lat, lng) {
    const location = new google.maps.LatLng(lat, lng);

    // Remove old map if exists
    document.getElementById("doctorMap")?.remove();

    const mapDiv = document.createElement("div");
    mapDiv.id = "doctorMap";
    mapDiv.style.height = "300px";
    mapDiv.style.marginTop = "12px";

    document.getElementById("chatContainer").appendChild(mapDiv);

    const map = new google.maps.Map(mapDiv, {
        center: location,
        zoom: 14
    });

    const bounds = new google.maps.LatLngBounds();

    // User location marker
    new google.maps.Marker({
        map,
        position: location,
        title: "You are here",
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2
        }
    });

    bounds.extend(location);

    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(
        {
            location,
            rankBy: google.maps.places.RankBy.DISTANCE,
            keyword: "hospital clinic doctor"
        },
        (results, status) => {
            if (
                status !== google.maps.places.PlacesServiceStatus.OK ||
                !results.length
            ) {
                append("No nearby doctors found.");
                return;
            }

            results.slice(0, 10).forEach(place => {
                if (!place.geometry?.location) return;

                new google.maps.Marker({
                    map,
                    position: place.geometry.location,
                    title: place.name
                });

                bounds.extend(place.geometry.location);

                append(`🏥 <b>${place.name}</b><br>${place.vicinity || ""}`);
            });

            // Auto-zoom to nearest results
            map.fitBounds(bounds);
        }
    );
}
