async function renderPlants() {
    const response = await fetch('/js/encyclopediaData.json');
    const plants = await response.json();
    const container = document.getElementById('plantContainer');

    function displayPlants(data) {
        container.innerHTML = '';
        data.forEach(plant => {
            container.innerHTML += `
                <div class="col">
                    <div class="card h-100 shadow-sm border-0 plant-card">
                        <img src="${plant.image}" alt="${plant.name}" class="card-img-top object-fit-cover" style="height: 200px;">
                        
                        <div class="card-body">
                            <h5 class="card-title fw-bold">${plant.name}</h5>
                            <h6 class="card-subtitle mb-3 text-muted small">${plant.type}</h6>
                            <p class="card-text">${plant.description}</p>
                        </div>
                        
                        <div class="card-footer bg-white border-0 pt-0">
                            <p class="mb-0 small fw-semibold text-success">
                                Season: ${plant.seasonalAvailability}
                            </p>
                        </div>
                    </div>
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