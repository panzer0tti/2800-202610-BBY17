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

1. Open your browser and visit the local host URL (or live deployment link once available).
2. Navigate to the top-right of the welcome page and click **Sign Up**.
3. Fill in the details to create a new account, and click sign up.
4. Turn on the tooltips feature on the home page, and explore the page to familiarize yourself with the interface.
5. Go to the navbar, and click **Scan Plant**.
6. Click *Helpful Tips* if you need help to use your device's camera, otherwise click *Upload Photo*.
7. Choose a plant photo for the Pl@ntNet API to scan.
8. Wait for the API to scan the photo and return a formatted result with safety and identification data.

---

## Project Structure

*(Insert your detailed project folder structure and file descriptions here)*

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
