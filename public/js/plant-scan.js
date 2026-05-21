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

        showScanningState();
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('plantImage', blob, 'camera-capture.jpg');

            const livePlantData = await scanPlant({
                method: 'POST',
                body: formData
            });

            if (livePlantData) {
                updatePlantUI(livePlantData);
            }
        }, 'image/jpeg');

    } catch (err) {
        console.error("Failed to fetch live AI data:", err);
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

// --- ADD THIS TO THE VERY BOTTOM OF SCAN.JS ---

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
        
        // Pass server data to our reusable helper function
        updatePlantUI(livePlantData);
    } catch (err) {
        console.error(err);
        showScanError();
    }
});

// 2. SHARED REUSABLE UI HELPER
function updatePlantUI(data) {
    // Hide error box if it was open from a previous scan
    document.getElementById('error-box').style.display = 'none';
    
    document.getElementById('plant-name').innerText = data.commonName || "Unknown Plant";
    document.getElementById('scientific-name').innerText = `Scientific Name: ${data.speciesName || "Unknown"}`;
    document.getElementById('ripe-level').innerText = `Ripe Level: ${data.ripeStatus}`;
    document.getElementById('season-indicator').innerText = `In Season: ${data.inSeason}`;
    
    // Combined safety and confidence on one line
    document.getElementById('safety-confidence').innerText = `${data.safety.toUpperCase()} - ${data.confidence}`;
    
    document.getElementById('lookalike-warning').innerHTML = `<strong>Lookalike Warning:</strong> ${data.lookalike}`;
    document.getElementById('allergy-warning').innerHTML = `<strong>Allergy Warning:</strong> ${data.allergy}`;
    
    // SHOW the prep guide now that we have data
    document.getElementById('prep-guide').style.display = 'block'; 
    document.getElementById('prep-guide').querySelector('p').innerText = data.prep;
}

function showScanningState() {
    // Hide error box while loading new scan
    document.getElementById('error-box').style.display = 'none';
    document.getElementById('result-box').style.display = 'block';
    document.getElementById('plant-name').innerText = "Scanning...";
    
    // HIDE the prep guide while scanning
    document.getElementById('prep-guide').style.display = 'none';
    
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
