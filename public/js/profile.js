console.log("Profile JS loaded");

// Enable personal info inputs and display picture upload controls when edit mode is triggered
document.querySelector("#editButton").addEventListener("click", () => {
    document.getElementById("personalInfoFields").disabled = false;
    picControls.style.display = "flex";
});

const picControls = document.getElementById("pic-controls");
const startCameraBtn = document.getElementById("start-camera-btn");
const cameraContainer = document.getElementById("camera-container");
const captureBtn = document.getElementById("capture-pic-btn");
const cancelCameraBtn = document.getElementById("cancel-camera-btn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const uploadInput = document.getElementById("upload-pic");
const profileImg = document.getElementById("profile-img");

// Request camera access and display the live video stream for profile picture capture
startCameraBtn.addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
            video.srcObject = stream;
            cameraContainer.style.display = "block";
            picControls.style.display = "none";
        })
        .catch((err) => {
            console.error("Camera access denied:", err);
            alert("Could not access the camera.");
        });
});

cancelCameraBtn.addEventListener("click", stopCamera);

// Terminate the active camera stream and revert the UI to default picture controls
function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    cameraContainer.style.display = "none";
    picControls.style.display = "flex";
}

// Capture the current video frame to a canvas and upload it as a new profile picture
captureBtn.addEventListener("click", () => {
    if (video.videoWidth === 0) {
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((image) => {
        sendImageToServer(image, "camera-capture.jpg");
        stopCamera();
    }, "image/jpeg");
});

// Handle manual file selection for profile picture uploads
uploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        sendImageToServer(file, file.name);
    }
});

// Transmit the selected image file to the backend via FormData to update the user profile
async function sendImageToServer(image, filename) {
    const formData = new FormData();
    formData.append("profilePic", image, filename);

    profileImg.style.opacity = "0.5";

    try {
        const response = await fetch("/updateProfilePic", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            profileImg.src = "/getProfilePic?t=" + new Date().getTime();
        } else {
            alert("Failed to upload profile picture.");
        }
    } catch (err) {
        console.error("Upload error:", err);
    } finally {
        profileImg.style.opacity = "1";
    }
}