const STORAGE_KEY = "beeWilderSavedPlants"

const demoPlants = [
    {
        id: "demo-salmonberry",
        name: "Salmonberry",
        scientificName: "Rubus spectabilis",
        type: "Berry",
        safety: "Use caution",
        confidence: 82,
        savedDate: "May 15, 2026",
        location: "Burnaby, BC",
        season: "Spring to summer",
        note: "Bright berry result. Needs confirmation because other berry-like plants can look similar from one photo.",
        lookalikeNote: "Do not consume from a scan alone. Confirm the plant using leaves, stem, flower shape, location, and a trusted field guide.",
        tags: ["berry", "trail", "pink flower"],
        image: "/img/placeholder.jpg"
    },
    {
        id: "demo-dandelion",
        name: "Common dandelion",
        scientificName: "Taraxacum officinale",
        type: "Flowering plant",
        safety: "Low risk",
        confidence: 91,
        savedDate: "May 12, 2026",
        location: "BCIT Burnaby Campus",
        season: "Spring to fall",
        note: "Saved from a lawn scan. Useful for testing the field journal layout.",
        lookalikeNote: "Still verify the plant before eating or preparing it. Avoid plants from sprayed lawns or polluted areas.",
        tags: ["yellow flower", "campus", "common"],
        image: "/img/placeholder.jpg"
    },
    {
        id: "demo-red-berry",
        name: "Unknown red berry",
        scientificName: "Unconfirmed species",
        type: "Berry",
        safety: "Do not consume",
        confidence: 64,
        savedDate: "May 9, 2026",
        location: "Deer Lake Park",
        season: "Unknown",
        note: "Lower confidence result with berry-like fruit. Marked unsafe until confirmed.",
        lookalikeNote: "Many red berries are unsafe or difficult to identify. Do not taste, prepare, or handle without expert confirmation.",
        tags: ["red berry", "low confidence", "lookalike risk"],
        image: "/img/placeholder.jpg"
    },
    {
        id: "demo-cedar",
        name: "Western redcedar",
        scientificName: "Thuja plicata",
        type: "Tree",
        safety: "Unknown",
        confidence: 76,
        savedDate: "May 6, 2026",
        location: "Central Park, Burnaby",
        season: "Year-round",
        note: "Saved from a tree identification scan. Good example of a non-berry plant in the collection.",
        lookalikeNote: "Tree identification should consider bark, branch structure, leaf scales, cones, and location.",
        tags: ["tree", "evergreen", "park"],
        image: "/img/placeholder.jpg"
    }
]

function getSavedPlants()
{
    const storedPlants = localStorage.getItem(STORAGE_KEY)

    if (!storedPlants)
    {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoPlants))
        return demoPlants
    }

    try
    {
        return JSON.parse(storedPlants)
    }
    catch
    {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoPlants))
        return demoPlants
    }
}

function savePlants(plants)
{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
}

function getSafetyClass(safety)
{
    if (safety === "Low risk")
    {
        return "safety-low"
    }

    if (safety === "Use caution")
    {
        return "safety-caution"
    }

    if (safety === "Do not consume")
    {
        return "safety-danger"
    }

    return "safety-unknown"
}

function createTagElement(tag)
{
    const tagElement = document.createElement("span")
    tagElement.className = "plant-tag"
    tagElement.textContent = tag
    return tagElement
}

function renderPlantCard(plant)
{
    const template = document.querySelector("#plant-card-template")
    const card = template.content.firstElementChild.cloneNode(true)

    const image = card.querySelector(".plant-image")
    image.src = plant.image || "/img/placeholder.jpg"
    image.alt = plant.name

    card.querySelector(".plant-type-pill").textContent = plant.type
    card.querySelector(".plant-name").textContent = plant.name
    card.querySelector(".scientific-name").textContent = plant.scientificName

    const safetyBadge = card.querySelector(".safety-badge")
    safetyBadge.textContent = plant.safety
    safetyBadge.classList.add(getSafetyClass(plant.safety))

    card.querySelector(".confidence-value").textContent =
        `${plant.confidence}%`

    card.querySelector(".confidence-fill").style.width =
        `${plant.confidence}%`

    card.querySelector(".saved-date").textContent = plant.savedDate
    card.querySelector(".plant-location").textContent = plant.location
    card.querySelector(".plant-season").textContent = plant.season
    card.querySelector(".plant-note").textContent = plant.note
    card.querySelector(".lookalike-note").textContent = plant.lookalikeNote

    const tagsContainer = card.querySelector(".plant-tags")

    plant.tags.forEach((tag) => {
        tagsContainer.appendChild(createTagElement(tag))
    })

    const details = card.querySelector(".plant-details")
    const detailsButton = card.querySelector(".details-toggle")

    detailsButton.addEventListener("click", () => {
        const isHidden = details.hidden
        details.hidden = !isHidden
        detailsButton.textContent = isHidden ? "Hide details" : "View details"
    })

    const removeButton = card.querySelector(".remove-plant")

    removeButton.addEventListener("click", () => {
        const plants = getSavedPlants().filter((savedPlant) => {
            return savedPlant.id !== plant.id
        })

        savePlants(plants)
        renderPlants()
    })

    return card
}

function getFilteredPlants()
{
    const searchValue = document
        .querySelector("#plant-search")
        .value
        .trim()
        .toLowerCase()

    const safetyValue = document.querySelector("#safety-filter").value
    const typeValue = document.querySelector("#type-filter").value

    return getSavedPlants().filter((plant) => {
        const searchableText = [
            plant.name,
            plant.scientificName,
            plant.type,
            plant.location,
            plant.safety,
            plant.tags.join(" ")
        ].join(" ").toLowerCase()

        const matchesSearch = searchableText.includes(searchValue)
        const matchesSafety =
            safetyValue === "all" || plant.safety === safetyValue
        const matchesType =
            typeValue === "all" || plant.type === typeValue

        return matchesSearch && matchesSafety && matchesType
    })
}

function updateSummary(plants)
{
    document.querySelector("#saved-count").textContent = plants.length

    document.querySelector("#safe-count").textContent =
        plants.filter((plant) => plant.safety === "Low risk").length

    document.querySelector("#caution-count").textContent =
        plants.filter((plant) => plant.safety === "Use caution").length
}

function renderPlants()
{
    const plantsGrid = document.querySelector("#plants-grid")
    const emptyState = document.querySelector("#empty-state")
    const filteredPlants = getFilteredPlants()

    plantsGrid.replaceChildren()
    updateSummary(getSavedPlants())

    emptyState.hidden = filteredPlants.length !== 0
    plantsGrid.hidden = filteredPlants.length === 0

    filteredPlants.forEach((plant) => {
        plantsGrid.appendChild(renderPlantCard(plant))
    })
}

function resetDemoData()
{
    savePlants(demoPlants)
    renderPlants()
}

function clearFilters()
{
    document.querySelector("#plant-search").value = ""
    document.querySelector("#safety-filter").value = "all"
    document.querySelector("#type-filter").value = "all"
    renderPlants()
}

document.querySelector("#plant-search").addEventListener("input", renderPlants)
document.querySelector("#safety-filter").addEventListener("change", renderPlants)
document.querySelector("#type-filter").addEventListener("change", renderPlants)
document.querySelector("#clear-filters").addEventListener("click", clearFilters)
document.querySelector("#reset-demo-data").addEventListener("click", resetDemoData)

renderPlants()
