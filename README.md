# 2800-202610-BBY17 - BeeWilder

## Overview

BeeWilder is a safety-first plant discovery web app that combines plant scanning, a personal plant collection, a map that showcases plant details in your city, and interactive gameplay to help users learn about local plants with confidence and risk guidance. It aims to tackle food insecurity, community building, and much more by reconnecting users with their local environment.

---

## Features

* **Plant Map**: Explore an interactive map displaying real plant locations and observations in your area.
* **Plant Scanner**: Utilize a camera-enabled scanner powered by AI to determine and identify plant species.
* **Interactive Plant Games**: Review and test your botanical knowledge through a plant guessing game featuring various local species.
* **My Plants Collection**: A dedicated dashboard to view saved plants (currently in development for storing actual user scans).
* **Account Management**: Update your personal account information, profile picture, and adjust various other account and app settings.
* **Responsive Design**: Fully optimized layout for seamless use across both desktop and mobile devices.

---

## Technologies Used

* **Frontend**: HTML5, CSS3, JavaScript, EJS (Embedded JavaScript templates)
* **Backend**: Node.js (with Express) for user authentication, routing, and server-side actions
* **Database**: MongoDB Atlas
* **APIs & Libraries**: Pl@ntNet API (for AI plant identification), Leaflet.js (for interactive mapping)
* **Package Management**: NPM (Node Package Manager)

---

## Setup & Installation

To run this application locally on your machine, follow these steps:

1. Clone the repository to your local machine.
2. Open your terminal and navigate to the project directory.
3. Install the required dependencies by running:
```bash
npm install

```


4. Create a `.env` file in the root directory. You must include all necessary environment variables for the app to function (e.g., `MONGODB_HOST`, `MONGODB_USER`, `MONGODB_PASSWORD`, `PLANTNET_API_KEY`, session secrets, etc.). The `PORT` variable is optional (defaults to 2800).
5. Start the server by running:
```bash
node app.js

```


6. Open your web browser and navigate to `http://localhost:2800`.

---

## Usage

Here is a quick scenario to get you started with BeeWilder:

1. Open your browser and visit the local host URL (or by going to `https://two800-202610-bby17-wpds.onrender.com/`).
2. Navigate to the top-right of the welcome page and click **Sign Up**.
3. Fill in the details to create a new account, and click sign up.
4. Turn on the tooltips feature on the home page, and explore the page to familiarize yourself with the interface.
5. Go to the navbar, and click **Scan Plant**.
6. Click *Helpful Tips* if you need help to use your device's camera, otherwise click *Upload Photo*.
7. Choose a plant photo for the Pl@ntNet API to scan.
8. Wait for the API to scan the photo and return a formatted result with safety and identification data.

---

## Project Structure

```
2800_202610_BBY17/
├── .vscode/
│   ├── settings.json
├── app/
│   ├── html/
│   │   │── about.html
│   │   │── encyclopedia.html
│   │   │── games.html
│   │   │── home.html
│   │   │── plant-map.html
├── node_modules/
│
├── public/
│   ├── css/
│   │   │── games.css
│   │   │── home.css
│   │   │── my-plants.css
│   │   │── navbar.css
│   │   │── plant-map.css
│   │   │── plant-scan.css
│   │   │── styles.css
│   │   │── welcome.css
│   ├── img/
│   │   │── plants/
│   │   │   │── bamboo_palm.jpg
│   │   │   │── bird_of_paradise.jpg
│   │   │   │── boston_fern.jpg
│   │   │   │── cactus.jpg
│   │   │   │── calathea.jpg
│   │   │   │── dracaena.jpg
│   │   │   │── fiddle_leaf.jpg
│   │   │   │── jade_plant.jpg
│   │   │   │── lavender.jpg
│   │   │   │── monstera_deliciosa.jpg
│   │   │   │── orchid.jpg
│   │   │   │── peace_lily.jpg
│   │   │   │── pothos.jpg
│   │   │   │── red_spider_lily.jpg
│   │   │   │── rose.jpg
│   │   │   │── rosemary.jpg
│   │   │   │── rubber_plant.jpg
│   │   │   │── snake_plant.jpg
│   │   │   │── spider_lily.jpg
│   │   │   │── spider_plant.jpg
│   │   │   │── zz_plant.jpg
│   │   │── default-avatar.jpg
│   │   │── placeholder.jpg
│   ├── js/
│   │   │── appHelper.js
│   │   │── authentication.js
│   │   │── bewilder-welcome.js
│   │   │── changePassword.js
│   │   │── encyclopedia.js
│   │   │── encyclopediaData.json
│   │   │── gameManager.js
│   │   │── guessPlantsGame.js
│   │   │── home.js
│   │   │── levelUp.js
│   │   │── mongoDBConnection.js
│   │   │── my-plants.js
│   │   │── plant-map.js
│   │   │── plant-scan.js
│   │   │── plantInfo.js
│   │   │── plantName.js
│   │   │── plantScanAPI.js
│   │   │── profile.js
│   │   │── profileData.js
│   │   │── utils.js
│   │   │── welcome-interactions.js
│   │   │── welcome.js
│   ├── tailwindOutput.css
├── src/
│   ├── tailwindInput.css
├── uploads/
├── views/
│   ├── templates/
│   │   │── footer.ejs
│   │   │── header.ejs
│   │   │── header2.ejs
│   │   │── message-list.ejs
│   │   │── navbar.ejs
│   │   │── password-requirements.ejs
│   │   │── publicpages_footer.ejs
│   │   │── publicpages_header.ejs
│   │   │── security-questions.ejs
│   │── 404.ejs
│   │── backup-login.ejs
│   │── change-password-form.ejs
│   │── change-password.ejs
│   │── encyclopedia.ejs
│   │── games.ejs
│   │── guessPlant.ejs
│   │── home.ejs
│   │── login-history.ejs
│   │── login.ejs
│   │── my-plants.ejs
│   │── plant-map.ejs
│   │── plant-scan.ejs
│   │── popup-message.ejs
│   │── profile.ejs
│   │── settings.ejs
│   │── signup.ejs
│   │── welcome.ejs
├── .env
├── .gitignore
├── .prettierrc
├── app.js
├── package-lock.json
├── package.json
├── postcssconfig.js
├── README.md
├── tailwind.config.js
```

---

## Contributors

**Team Name:** BBY-17

* **Sal Yunus** - Hi there! I'm a hardworking and passionate CST student who loves coding. My favourite things include cats, cars, reading, and a bunch of video games like Halo, Metro, etc. My favourite colour is purple. I like turtles.
* **Hezekiah Horfilla** - Hello, I am a creative and motivated student in CST. My favourite colour is blue.
* **Minh Ngoc Ngo** - Hello everyone, I'm a stubborn and passionate CST student who likes to bring her imagination to life!
* **Marcus Leung** - Hi, I am a commited and dedicated student in CST. I like logic, I like coding and I like driving.
* **Abdullah Munawar** - Hello, I am a curious and friendly CST student who likes to play soccer, chess, and do random fun math problems. I like whales and dolphins.

---

## Acknowledgements

* Portions of the code and styling logic within this project were generated and refined with the assistance of AI tools, including ChatGPT and Gemini.

---

## Limitations and Future Work

Due to a strict 4-week development window, the team focused on core functionality. The following features represent known limitations and goals for future iterations of BeeWilder.

### Limitations

* The "My Plants" page is accessible but currently does not store actual user plant scans.
* The detailed information page for plants selected from the map requires a design overhaul.
* The application currently lacks an official logo and custom favicon.
* Plant scanning and identification strictly require an active internet connection to process images.
* Plant scanning doesn't provide information about a plant's ripeness level and in-season status, along with potential lookalikes.

### Future Work

* Save actual user plant scans directly to the "My Plants" personal collection, if the user wants to.
* Allow plant scans to be automatically added to the app's community-wide plant map.
* Implement a filter for map locations utilizing edibility color codes for each plant.
* Add a level-up progression system and a 1v1 multiplayer gaming feature for users to test their botanical knowledge against others.
* Develop an overall app-wide encyclopedia, an About Us page, an FAQ page, and a dedicated safety guide page.
* Build an offline mode so users can identify plants in remote areas or trails without cellular service.

---

## Image Credits

* Default Profile Avatar: default-avatar.jpg by [Vecteezy](https://www.vecteezy.com/vector-art/26434409-default-avatar-profile-icon-vector-social-media-user-photo)
