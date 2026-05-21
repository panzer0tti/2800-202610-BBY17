const startBtn = document.getElementById('start-camera');
const captureBtn = document.getElementById('capture-plant');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const backBtn = document.getElementById('back');
const uploadLabel = document.getElementById('upload-label');

backBtn.addEventListener('click', () => {
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;

    video.style.display = 'none';
    captureBtn.style.display = 'none';
    backBtn.style.display = 'none';
    startBtn.style.display = 'block';
    uploadLabel.style.display = 'block'; // Show upload button again
});

captureBtn.addEventListener('click', async () => {
    try {
        // Prevent capture if video isn't fully loaded
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            showScanError("Camera is still initializing. Please wait a moment.");
            return;
        }

        // Show "Getting Location..." immediately while browser waits for GPS popup
        showScanningState();
        document.getElementById('plant-name').innerText = "Getting Location...";

        const position = await getPlantLocation();
        const { latitude: lat, longitude: lng } = position.coords;

        // Switch text to "Scanning..." now that coordinates are found
        document.getElementById('plant-name').innerText = "Scanning...";
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (image) => {
            const formData = new FormData();
            formData.append('plantImage', image, 'camera-capture.jpg');

            const livePlantData = await scanPlant({
                method: 'POST',
                body: formData
            });

            if (livePlantData) {
                // Pass coords to UI and Sync to Map
                livePlantData.lat = lat;
                livePlantData.lng = lng;
                updatePlantUI(livePlantData);
                await syncScanToMap(livePlantData, lat, lng);
            }
        }, 'image/jpeg');

    } catch (err) {
        console.error("Failed to fetch live AI data or Location:", err);
        showScanError("An unexpected error occurred during capture.");
    }
});

startBtn.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.style.display = "block";
            captureBtn.style.display = "inline-block";
            startBtn.style.display = "none";
            backBtn.style.display = 'inline-block';
            uploadLabel.style.display = 'none'; // Hide upload button
        })
        .catch((err) => {
            console.error("Camera error: ", err);
            showScanError("Camera access denied.");
        });
});

// 1. FILE UPLOAD EVENT LISTENER
const uploadInput = document.getElementById('upload-plant');

uploadInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    try {
        showScanningState();

        const formData = new FormData();
        formData.append('plantImage', file);

        const livePlantData = await scanPlant({
            method: 'POST',
            body: formData
        });
        
        if (livePlantData) {
            updatePlantUI(livePlantData);
        }
    } catch (err) {
        console.error(err);
        showScanError();
    }
});

// 2. SHARED REUSABLE UI HELPER
function updatePlantUI(data) {
    // Hide error box if it was open from a previous scan
    document.getElementById('error-box').style.display = 'none';
    document.getElementById('try-again-btn').style.display = 'none'; // Hide Try Again button on success
    
    document.getElementById('plant-name').innerText = data.commonName || "Unknown Plant";
    document.getElementById('scientific-name').innerHTML = `<strong>Scientific Name:</strong> ${data.speciesName || "Unknown"}`;
    
    // REVEAL targeted UI elements
    document.getElementById('ripe-level').style.display = 'block';
    document.getElementById('season-indicator').style.display = 'block';
    document.getElementById('location-display').style.display = 'block';

    document.getElementById('ripe-level').innerHTML = `<strong>Ripe Level:</strong> ${data.ripeStatus}`;
    document.getElementById('season-indicator').innerHTML = `<strong>In Season:</strong> ${data.inSeason}`;
    
    // Combined safety and confidence on one line
    document.getElementById('safety-confidence').innerText = `${data.safety.toUpperCase()} - ${data.confidence}`;
    
    // Update Latitude and Longitude displays
    if (data.lat && data.lng) {
        document.getElementById('lat-display').innerText = data.lat.toFixed(4);
        document.getElementById('lng-display').innerText = data.lng.toFixed(4);
    }

    document.getElementById('lookalike-warning').innerHTML = `<strong>Lookalike Warning:</strong> ${data.lookalike}`;
    document.getElementById('allergy-warning').innerHTML = `<strong>Allergy Warning:</strong> ${data.allergy}`;
    
    // SHOW the prep guide now that we have data
    document.getElementById('prep-guide').style.display = 'block'; 
    document.getElementById('prep-guide').querySelector('p').innerText = data.prep;
}

function showScanningState() {
    // Hide error box and try again button while loading new scan
    document.getElementById('error-box').style.display = 'none';
    document.getElementById('try-again-btn').style.display = 'none';

    document.getElementById('result-box').style.display = 'block';
    document.getElementById('plant-name').innerText = "Scanning...";
    
    // HIDE targeted UI elements while scanning
    document.getElementById('prep-guide').style.display = 'none';
    document.getElementById('ripe-level').style.display = 'none';
    document.getElementById('season-indicator').style.display = 'none';
    document.getElementById('location-display').style.display = 'none'; // Hides both lat and lng lines
    
    // Clear out residual UI data while scanning
    document.getElementById('scientific-name').innerText = "";
    document.getElementById('safety-confidence').innerText = "";
    document.getElementById('lookalike-warning').innerHTML = "";
    document.getElementById('allergy-warning').innerHTML = "";
    document.getElementById('prep-guide').querySelector('p').innerText = "";
}

function showScanError(message = "Scan Failed") {
    // Hide all plant details so previous data doesn't bleed through
    document.getElementById('result-box').style.display = 'none';
    
    // Show the dedicated error box with the "Error: " prefix
    document.getElementById('error-box').style.display = 'block';
    document.getElementById('error-message').innerText = message;
    
    // Show the Try Again refresh button when plant is unknown/fails
    document.getElementById('try-again-btn').style.display = 'inline-block';
}

async function scanPlant(options = {}) {
    try {
        const response = await fetch('/scanningPlant', options);
        const data = await response.json(); // Parse the response even if it's an error

        // If the server sends a 500 error (like when Pl@ntNet finds no species)
        if (!response.ok) {
            // Throw the custom error message sent from your Express backend
            throw new Error(data.prep || 'AI service failed to identify the image.');
        }

        return data;
    } catch (err) {
        console.error("Scan API error:", err);
        showScanError(err.message);
        return null;
    }
}

// --- LOCATION & MAP SYNC FEATURES ---

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
                name: plantData.commonName || plantData.name,
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
const hintToggleBtn = document.getElementById('hint-toggle');
if(hintToggleBtn) {
    hintToggleBtn.addEventListener('click', () => {
        const tipsBox = document.getElementById('helpful-tips-box');
        
        if (tipsBox.style.display === 'none') {
            tipsBox.style.display = 'block';
            tipsBox.scrollIntoView({ behavior: 'smooth' }); // Scrolls down to show it
        } else {
            tipsBox.style.display = 'none';
        }
    });
}