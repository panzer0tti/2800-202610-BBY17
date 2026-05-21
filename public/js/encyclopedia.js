async function renderPlants() {

    const response = await fetch('/js/encyclopediaData.json');
    const plants = await response.json();
    const container = document.getElementById('plantContainer');

    function displayPlants(data) {
        container.innerHTML = '';
        data.forEach(plant => {
            container.innerHTML += `
                <div class="bg-white p-4 rounded-lg shadow plant-card">
                    <h2 class="text-xl font-bold">${plant.name}</h2>
                    <p class="text-sm text-gray-500">${plant.type}</p>
                    <p class="mt-2">${plant.description}</p>
                </div>
            `;
        });
    }

    displayPlants(plants);

    document.getElementById('plantSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = plants.filter(p => p.name.toLowerCase().includes(query));
        displayPlants(filtered);
    });
}

renderPlants();