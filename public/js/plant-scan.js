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
    uploadLabel.style.display = 'block'; 
});

captureBtn.addEventListener('click', async () => {
    try {
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            showScanError("Camera is still initializing. Please wait a moment.");
            return;
        }

        showScanningState();
        document.getElementById('plant-name').innerText = "Getting Location...";

        const position = await getPlantLocation();
        const { latitude: lat, longitude: lng } = position.coords;

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
            uploadLabel.style.display = 'none'; 
        })
        .catch((err) => {
            console.error("Camera error: ", err);
            showScanError("Camera access denied.");
        });
});

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

// Update the user interface container displays with parsed plant data profiles
function updatePlantUI(data) {
    document.getElementById('error-box').style.display = 'none';
    document.getElementById('try-again-btn').style.display = 'none'; 
    
    document.getElementById('plant-name').innerText = data.commonName || "Unknown Plant";
    document.getElementById('scientific-name').innerHTML = `<strong>Scientific Name:</strong> ${data.speciesName || "Unknown"}`;
    
    document.getElementById('ripe-level').style.display = 'block';
    document.getElementById('season-indicator').style.display = 'block';
    document.getElementById('location-display').style.display = 'block';

    document.getElementById('ripe-level').innerHTML = `<strong>Ripe Level:</strong> ${data.ripeStatus}`;
    document.getElementById('season-indicator').innerHTML = `<strong>In Season:</strong> ${data.inSeason}`;
    
    document.getElementById('safety-confidence').innerText = `${data.safety.toUpperCase()} - ${data.confidence}`;
    
    if (data.lat && data.lng) {
        document.getElementById('lat-display').innerText = data.lat.toFixed(4);
        document.getElementById('lng-display').innerText = data.lng.toFixed(4);
    }

    document.getElementById('lookalike-warning').innerHTML = `<strong>Lookalike Warning:</strong> ${data.lookalike}`;
    document.getElementById('allergy-warning').innerHTML = `<strong>Allergy Warning:</strong> ${data.allergy}`;
    
    document.getElementById('prep-guide').style.display = 'block'; 
    document.getElementById('prep-guide').querySelector('p').innerText = data.prep;
}

// Reset data labels and clear interface containers to indicate active scanning loops
function showScanningState() {
    document.getElementById('error-box').style.display = 'none';
    document.getElementById('try-again-btn').style.display = 'none';

    document.getElementById('result-box').style.display = 'block';
    document.getElementById('plant-name').innerText = "Scanning...";
    
    document.getElementById('prep-guide').style.display = 'none';
    document.getElementById('ripe-level').style.display = 'none';
    document.getElementById('season-indicator').style.display = 'none';
    document.getElementById('location-display').style.display = 'none'; 
    
    document.getElementById('scientific-name').innerText = "";
    document.getElementById('safety-confidence').innerText = "";
    document.getElementById('lookalike-warning').innerHTML = "";
    document.getElementById('allergy-warning').innerHTML = "";
    document.getElementById('prep-guide').querySelector('p').innerText = "";
}

// Display the error text container and prompt manual refresh choices
function showScanError(message = "Scan Failed") {
    document.getElementById('result-box').style.display = 'none';
    
    document.getElementById('error-box').style.display = 'block';
    document.getElementById('error-message').innerText = message;
    
    document.getElementById('try-again-btn').style.display = 'inline-block';
}

// Transmit image payloads to backend ingestion controllers to process AI evaluations
async function scanPlant(options = {}) {
    try {
        const response = await fetch('/scanningPlant', options);
        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.prep || 'AI service failed to identify the image.');
        }

        return data;
    } catch (err) {
        console.error("Scan API error:", err);
        showScanError(err.message);
        return null;
    }
}

// Wrap geolocation tracker calls inside an asynchronous promise shell
function getPlantLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject("Geolocation not supported");
        }
    });
}

// Post geographic markers and tracking details up to mapping databases
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

const hintToggleBtn = document.getElementById('hint-toggle');
if(hintToggleBtn) {
    hintToggleBtn.addEventListener('click', () => {
        const tipsBox = document.getElementById('helpful-tips-box');
        
        if (tipsBox.style.display === 'none') {
            tipsBox.style.display = 'block';
            tipsBox.scrollIntoView({ behavior: 'smooth' }); 
        } else {
            tipsBox.style.display = 'none';
        }
    });
}