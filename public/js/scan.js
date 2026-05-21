const startBtn = document.getElementById('start-camera');
const captureBtn = document.getElementById('capture-plant'); // Add this line
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const backBtn = document.getElementById('back');

backBtn.addEventListener('click', () => {
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Stop hardware
    }
    video.srcObject = null;

    // Toggle everything back
    video.style.display = 'none';
    captureBtn.style.display = 'none';
    backBtn.style.display = 'none';
    startBtn.style.display = 'block';
    document.getElementById('results').innerText = "";
});

captureBtn.addEventListener('click', async () => {
    // User Story 02: Show "Getting Location..." immediately while browser waits for GPS popup
    document.getElementById('plant-name').innerText = "Getting Location...";
    document.getElementById('result-box').style.display = 'block';
    // Make sure old error button is tucked away
    document.getElementById('try-again-btn').style.display = 'none';

    try {
        const position = await getPlantLocation();
        const { latitude: lat, longitude: lng } = position.coords;

        // User Story 02: Switch text to "Scanning..." now that coordinates are found
        document.getElementById('plant-name').innerText = "Scanning...";

        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng })
        });

        if (!response.ok) throw new Error('API server error');

        const livePlantData = await response.json();
        updatePlantUI(livePlantData);

        // User Story 01: Sync the freshly scanned plant to your map
        await syncScanToMap(livePlantData, lat, lng);

    } catch (err) {
        console.error("Scan Failed:", err);

        // Show "No results" refresh button only when plant is unknown
        document.getElementById('plant-name').innerText = "No results";
        
        // Show the Try Again refresh button only when plant is unknown 
        document.getElementById('try-again-btn').style.display = 'inline-block';
    }
});

startBtn.addEventListener('click', () => {
    // CAMERA CODE GOES HERE:
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.style.display = "block";
            captureBtn.style.display = "inline-block";
            startBtn.style.display = "none";
            backBtn.style.display = 'inline-block';
        })
        .catch((err) => {
            console.error("Camera access denied or unavailable:", err);
            alert("Please allow camera access to scan plants!");
        });
});

// --- ADD THIS TO THE VERY BOTTOM OF SCAN.JS ---

// 1. FILE UPLOAD EVENT LISTENER
const uploadInput = document.getElementById('upload-plant');

uploadInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        document.getElementById('plant-name').innerText = "Scanning...";
        document.getElementById('result-box').style.display = 'block';

        const formData = new FormData();
        formData.append('plantImage', file);

        const response = await fetch('/api/scan', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('API error');

        const livePlantData = await response.json();
        
        // Pass server data to our reusable helper function
        updatePlantUI(livePlantData);

    } catch (err) {
        console.error(err);
        document.getElementById('plant-name').innerText = "No results";
        
        // Show the Try Again button here too if an uploaded file is invalid
        document.getElementById('try-again-btn').style.display = 'inline-block';
    }
});

// 2. SHARED REUSABLE UI HELPER
function updatePlantUI(data) {
    document.getElementById('plant-name').innerText = data.name;
    document.getElementById('ripe-level').innerText = `Ripe Level: ${data.ripeStatus}`;
    document.getElementById('season-indicator').innerText = `In Season: ${data.inSeason}`;
    document.getElementById('safety-badge').innerText = data.safety.toUpperCase();
    document.getElementById('confidence-level').innerText = data.confidence;
    
    // NEW: Update Latitude and Longitude displays
    if (data.lat && data.lng) {
        document.getElementById('lat-display').innerText = data.lat.toFixed(4);
        document.getElementById('lng-display').innerText = data.lng.toFixed(4);
    }

    document.getElementById('lookalike-warning').innerHTML = `<strong>Lookalike Warning:</strong> ${data.lookalike}`;
    document.getElementById('allergy-warning').innerHTML = `<strong>Allergy Warning:</strong> ${data.allergy}`;
    document.getElementById('prep-guide').querySelector('p').innerText = data.prep;
}

function getPlantLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject("Geolocation not supported");
        }
    });
}

async function syncScanToMap(plantData, lat, lng) {
    try {
        const response = await fetch('/api/map-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: plantData.name,
                ripeStatus: plantData.ripeStatus,
                lat: lat,
                lng: lng,
                date: new Date()
            })
        });

        if (!response.ok) throw new Error('Database map sync failed');
        console.log("Marker successfully synced to the plant map database!");
    } catch (err) {
        console.error("Map syncing dropped:", err);
    }
}

// Toggle the interactive hints banner when clicked
document.getElementById('hint-toggle').addEventListener('click', () => {
    const tipsBox = document.getElementById('helpful-tips-box');
    
    if (tipsBox.style.display === 'none') {
        tipsBox.style.display = 'block';
        tipsBox.scrollIntoView({ behavior: 'smooth' }); // Scrolls down to show it
    } else {
        tipsBox.style.display = 'none';
    }
});