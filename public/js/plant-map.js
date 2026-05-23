const isFirstVisit = !localStorage.getItem('BeWilder_visited');

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors', maxZoom: 19,
}).addTo(map);

let userCenter = [49.2827, -123.1207];
map.setView(userCenter, 14);
let allObservations = [];

const EDIBILITY = {
  53413:  'edible',   // Salmonberry (Rubus spectabilis)
  55847:  'edible',   // Salal (Gaultheria shallon)
  53407:  'edible',   // Thimbleberry (Rubus parviflorus)
  48207:  'edible',   // Red Huckleberry (Vaccinium parvifolium)
  55966:  'edible',   // Evergreen Huckleberry (Vaccinium ovatum)
  55778:  'edible',   // Saskatoon Berry (Amelanchier alnifolia)
  53408:  'edible',   // Trailing Blackberry (Rubus ursinus)
  60218:  'edible',   // Himalayan Blackberry (Rubus armeniacus)
  53409:  'edible',   // Blackcap Raspberry (Rubus leucodermis)
  58796:  'edible',   // Elderberry (Sambucus)
  50274:  'edible',   // Red Elderberry (Sambucus racemosa)
  47229:  'edible',   // Wild Strawberry (Fragaria virginiana)
  62212:  'edible',   // Woodland Strawberry (Fragaria vesca)
  48392:  'edible',   // Oregon Grape (Mahonia aquifolium)
  54418:  'edible',   // Cascade Oregon Grape (Mahonia nervosa)
  48868:  'edible',   // Osoberry / Indian Plum (Oemleria cerasiformis)
  49743:  'edible',   // Hawthorn (Crataegus)
  47924:  'edible',   // Chokecherry (Prunus virginiana)
  48803:  'edible',   // Nootka Rose / Wild Rose hips (Rosa nutkana)
  48591:  'edible',   // Fireweed (Epilobium angustifolium)
  47602:  'edible',   // Stinging Nettle (Urtica dioica)
  76958:  'edible',   // Dandelion (Taraxacum officinale)
  48701:  'edible',   // Chickweed (Stellaria media)
  55813:  'edible',   // Lamb's Quarters (Chenopodium album)
  50148:  'edible',   // Purslane (Portulaca oleracea)
  47157:  'edible',   // Wood Sorrel (Oxalis)
  61438:  'edible',   // Cleavers / Goosegrass (Galium aparine)
  47223:  'edible',   // Red Clover (Trifolium pratense)
  50303:  'edible',   // Broadleaf Plantain (Plantago major)
  48537:  'edible',   // Cattail (Typha)
  53370:  'edible',   // Garlic Mustard (Alliaria petiolata)
  47727:  'edible',   // Wild Garlic (Allium ursinum)
  48386:  'edible',   // Miner's Lettuce (Claytonia perfoliata)
  62410:  'edible',   // Cow Parsley (Anthriscus sylvestris)
  54102:  'edible',   // Sheep Sorrel (Rumex acetosella)
  50877:  'edible',   // Curly Dock (Rumex crispus)
  48219:  'edible',   // Burdock (Arctium)
  58722:  'edible',   // Sow Thistle (Sonchus)
  47727:  'edible',   // Wild Mint (Mentha arvensis)
  54038:  'edible',   // Self Heal (Prunella vulgaris)
  48219:  'edible',   // Silverweed (Potentilla anserina)
  53291:  'edible',   // Bracken Fern (Pteridium aquilinum)
  47606:  'edible',   // Watercress (Nasturtium officinale)
  47223:  'edible',   // Wild Violet (Viola)
  // ── Toxic ──
  50171:  'toxic',    // Deadly Nightshade (Atropa belladonna)
  77378:  'toxic',    // Poison Hemlock (Conium maculatum)
  48678:  'toxic',    // Foxglove (Digitalis purpurea)
  52580:  'toxic',    // Lily of the Valley (Convallaria majalis)
  56057:  'toxic',    // Monkshood / Wolfsbane (Aconitum)
  49643:  'toxic',    // Poison Ivy (Toxicodendron radicans)
  77107:  'toxic',    // Death Camas (Anticlea elegans)
  48735:  'toxic',    // Lords and Ladies (Arum maculatum)
  62024:  'toxic',    // Black Nightshade (Solanum nigrum)
  52984:  'toxic',    // Water Hemlock (Cicuta)
  57774:  'toxic',    // Baneberry (Actaea)
};

// Evaluate observation taxon and summaries to return an edibility tag label and class
function getEdibilityTag(obs, wikiText = '') {
  const taxonId = obs.taxon?.id;

  if (taxonId && EDIBILITY[taxonId]) {
    const e = EDIBILITY[taxonId];
    if (e === 'edible') return { label: 'Edible',    cls: 'tag-edible' };
    if (e === 'toxic')  return { label: 'Toxic',     cls: 'tag-toxic'  };
  }

  const text = wikiText.toLowerCase();
  const edibleKeywords = ['edible', 'eaten', 'food plant', 'forage', 'culinary', 'consumed', 'harvested for food'];
  const toxicKeywords  = ['toxic', 'poisonous', 'poison', 'fatal', 'lethal', 'dangerous if ingested', 'harmful'];

  if (toxicKeywords.some(k => text.includes(k)))  return { label: 'Toxic',             cls: 'tag-toxic'   };
  if (edibleKeywords.some(k => text.includes(k))) return { label: 'Edible',            cls: 'tag-edible'  };
  return                                                  { label: 'Edibility Unknown', cls: 'tag-unknown' };
}

// Generate an active season tag label based on the browser's current month context
function getSeasonTag() {
  const month = new Date().getMonth();
  const season =
    month >= 2 && month <= 4 ? 'Spring' :
    month >= 5 && month <= 7 ? 'Summer (Peak Season)' :
    month >= 8 && month <= 10 ? 'Autumn' : 'Winter';
  return { label: season, cls: 'tag-season' };
}

const detailPanel = document.getElementById('detail-panel');

// Pop open the right details sliding sheet filled with iNaturalist and Wikipedia info
async function openDetail(obs) {
  const name    = obs.taxon?.preferred_common_name || obs.taxon?.name || 'Unknown Plant';
  const sci     = obs.taxon?.name || '';
  const date    = obs.observed_on || 'unknown date';
  const photo   = obs.photos?.[0]?.url?.replace('square', 'medium') || null;
  const url     = `https://www.inaturalist.org/observations/${obs.id}`;
  const taxonId = obs.taxon?.id;

  document.getElementById('detail-title').textContent = name;
  document.getElementById('detail-name').textContent  = name;
  document.getElementById('detail-sci').textContent   = sci;

  const photoEl = document.getElementById('detail-photo');
  if (photo) {
    photoEl.innerHTML = `<img src="${photo}" alt="${name}">`;
  } else {
    photoEl.innerHTML = `<span style="font-size:5rem">🌿</span>`;
  }

  const tagsEl    = document.getElementById('detail-tags');
  const edibility = getEdibilityTag(obs, '');
  const season    = getSeasonTag();
  tagsEl.innerHTML = `<span class="detail-tag ${edibility.cls}">${edibility.label}</span>`;
  if (season) tagsEl.innerHTML += `<span class="detail-tag ${season.cls}">${season.label}</span>`;

  document.getElementById('detail-description').textContent = 'Loading description…';
  document.getElementById('detail-meta').textContent = `Spotted: ${date}`;
  document.getElementById('detail-link').href = url;

  detailPanel.classList.add('open');

  if (taxonId) {
    try {
      const res  = await fetch(`https://api.inaturalist.org/v1/taxa/${taxonId}`);
      const data = await res.json();
      const wiki = data.results?.[0]?.wikipedia_summary;
      const clean = wiki ? wiki.replace(/<[^>]+>/g, '') : 'No description available for this species.';
      document.getElementById('detail-description').textContent = clean;

      const fullObs = { ...obs, taxon: { ...obs.taxon, wikipedia_summary: clean } };
      const updatedEdibility = getEdibilityTag(fullObs, clean);
      tagsEl.innerHTML = `<span class="detail-tag ${updatedEdibility.cls}">${updatedEdibility.label}</span>`;
      if (season) tagsEl.innerHTML += `<span class="detail-tag ${season.cls}">${season.label}</span>`;

    } catch (err) {
      document.getElementById('detail-description').textContent = 'Could not load description.';
      console.error('Taxon fetch error:', err);
    }
  } else {
    document.getElementById('detail-description').textContent = 'No description available.';
  }
}

document.getElementById('detail-back').addEventListener('click', () => {
  detailPanel.classList.remove('open');
});

// Request localized flora sightings from iNaturalist surrounding targeted coordinates
async function loadPlants(lat, lng) {
  const loading     = document.getElementById('loading');
  const errorBanner = document.getElementById('error-banner');
  loading.style.display = 'block';
  errorBanner.style.display = 'none';
  allObservations = [];

  const params = new URLSearchParams({
    taxon_id:      47126,
    lat,
    lng,
    radius:        2,
    per_page:      100,
    quality_grade: 'research',
    photos:        true,
  });

  try {
    const res  = await fetch(`https://api.inaturalist.org/v1/observations?${params}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    if (!data.results.length) {
      showError('No plant sightings found nearby. Try moving the map.');
      loading.style.display = 'none';
      return;
    }

    allObservations = data.results;

    if (!allObservations.length) {
      showError('No known edible or toxic plants found nearby. Try moving the map.');
      loading.style.display = 'none';
      return;
    }
    allObservations.forEach(obs => addPin(obs));
    loading.style.display = 'none';

  } catch (err) {
    loading.style.display = 'none';
    showError('Could not load plant data. Check your connection and try again.');
    console.error('iNaturalist error:', err);
  }
}

const markerMap = {};

// Place a clickable leaflet pin complete with picture and link onto the interactive canvas
function addPin(obs) {
  if (!obs.location) return;
  const [lat, lng] = obs.location.split(',').map(Number);
  const name  = obs.taxon?.preferred_common_name || obs.taxon?.name || 'Unknown Plant';
  const sci   = obs.taxon?.name || '';
  const date  = obs.observed_on || 'unknown date';
  const photo = obs.photos?.[0]?.url?.replace('square', 'small') || null;

  const popup = L.popup({ maxWidth: 220 }).setContent(`
    ${photo ? `<img src="${photo}" width="160" style="display:block;margin-bottom:6px;border-radius:3px">` : ''}
    <b>${name}</b><br>
    <i style="font-size:0.8em">${sci}</i><br>
    <small>Spotted: ${date}</small><br>
    <button onclick="window._openDetail(${obs.id})" style="margin-top:8px;padding:5px 10px;cursor:pointer;width:100%">More Details</button>
  `);

  const marker = L.marker([lat, lng]).addTo(map).bindPopup(popup);
  markerMap[obs.id] = marker;
}

window._openDetail = (id) => {
  const obs = allObservations.find(o => o.id === id);
  if (obs) openDetail(obs);
};

// Populate and display the error notification layout across the main window
function showError(msg) {
  const banner = document.getElementById('error-banner');
  banner.textContent = msg;
  banner.style.display = 'block';
}

const drawer = document.getElementById('drawer');

// Assemble structural lists for loaded vegetation inside the sliding bottom section
function openDrawer() {
  drawer.classList.add('open');
  const list = document.getElementById('drawer-list');
  list.innerHTML = '';

  if (!allObservations.length) {
    list.innerHTML = '<div style="padding:16px;font-size:0.85rem;color:#666">No plants loaded yet.</div>';
    return;
  }

  allObservations.forEach(obs => {
    const name  = obs.taxon?.preferred_common_name || obs.taxon?.name || 'Unknown Plant';
    const sci   = obs.taxon?.name || '';
    const date  = obs.observed_on || 'unknown date';
    const photo = obs.photos?.[0]?.url || null;

    const item = document.createElement('div');
    item.className = 'drawer-item';
    item.innerHTML = `
      ${photo
        ? `<img src="${photo}" alt="${name}">`
        : `<div class="drawer-item-img-placeholder">🌿</div>`}
      <div class="drawer-item-info">
        <div class="drawer-item-name">${name}</div>
        <div class="drawer-item-sci">${sci}</div>
        <div class="drawer-item-date">Spotted: ${date}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      drawer.classList.remove('open');
      if (obs.location) {
        const [lat, lng] = obs.location.split(',').map(Number);
        map.flyTo([lat, lng], 17, { duration: 1 });
        setTimeout(() => {
          const marker = markerMap[obs.id];
          if (marker) marker.openPopup();
        }, 1200);
      }
    });
    list.appendChild(item);
  });
}

document.getElementById('view-nearby-btn').addEventListener('click', openDrawer);
document.getElementById('drawer-close').addEventListener('click', () => drawer.classList.remove('open'));

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    userCenter = [pos.coords.latitude, pos.coords.longitude];
    map.setView(userCenter, 15);
    L.circleMarker(userCenter, {
      radius: 10, fillColor: '#4285F4', fillOpacity: 1, color: '#fff', weight: 3,
    }).addTo(map).bindPopup('You are here');
    loadPlants(...userCenter);
  }, () => {
    showError('Location unavailable. Showing plants near Vancouver.');
    loadPlants(...userCenter);
  });
} else {
  loadPlants(...userCenter);
}

map.on('moveend', () => {
  const c = map.getCenter();
  map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
  loadPlants(c.lat, c.lng);
});

const steps = [
  { text: "These pins show real plant sightings near you. Tap one to learn more." },
  { text: "Use 'Scan Plant' to identify a plant using your camera." },
  { text: "'View Plants Nearby' will open a list of plants close to you." },
  { text: "That's it! You are ready to explore." },
];

let currentStep = 0;
const wtBar  = document.getElementById('walkthrough-bar');
const wtText = document.getElementById('wt-text');
const wtProg = document.getElementById('wt-progress');
const wtNext = document.getElementById('wt-next');
const wtSkip = document.getElementById('wt-skip');

// Update tutorial interface elements to reflect active onboarding step states
function showStep(i) {
  if (i >= steps.length) { endWalkthrough(); return; }
  wtText.textContent = steps[i].text;
  wtProg.textContent = `${i + 1} / ${steps.length}`;
  wtNext.textContent = i === steps.length - 1 ? 'Done' : 'Next';
}

// Close guided tutorial sequence and save onboarding milestone settings locally
function endWalkthrough() {
  wtBar.classList.remove('active');
  localStorage.setItem('BeWilder_visited', '1');
  document.getElementById('hint-toggle').style.display = 'block';
}

// Reset tracker counters and present first welcome walkthrough instructional message
function startWalkthrough() {
  currentStep = 0;
  wtBar.classList.add('active');
  showStep(0);
}
wtNext.addEventListener('click', () => { currentStep++; showStep(currentStep); });
wtSkip.addEventListener('click', endWalkthrough);

const overlay = document.getElementById('welcome-overlay');
if (!isFirstVisit) {
  overlay.style.display = 'none';
  document.getElementById('hint-toggle').style.display = 'block';
}
document.getElementById('welcome-start').addEventListener('click', () => {
  overlay.style.display = 'none';
  startWalkthrough();
});
document.getElementById('welcome-skip').addEventListener('click', () => {
  overlay.style.display = 'none';
  localStorage.setItem('BeWilder_visited', '1');
  document.getElementById('hint-toggle').style.display = 'block';
});
document.getElementById('hint-toggle').addEventListener('click', startWalkthrough);