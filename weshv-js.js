// Initializing the map with Ahmedabad coordinates
const ahmedabadCoords = [23.0225, 72.5714];
const map = L.map('map').setView(ahmedabadCoords, 12);
const markers = {};
const foodJourneys = [];

// Adding OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const iconSize = [30, 30];

// Define all icons
const icons = {
    donor: L.divIcon({ html: '🍲', className: 'map-icon donor-icon', iconSize: iconSize }),
    ngo: L.divIcon({ html: '🏢', className: 'map-icon ngo-icon', iconSize: iconSize }),
    volunteer: L.divIcon({ html: '🙋', className: 'map-icon volunteer-icon', iconSize: iconSize }),
    host: L.divIcon({ html: '🏠', className: 'map-icon host-icon', iconSize: iconSize }),
    picker: L.divIcon({ html: '🚚', className: 'map-icon picker-icon', iconSize: iconSize }),
    school: L.divIcon({ html: '🏫', className: 'map-icon school-icon', iconSize: iconSize }),
    blindSchool: L.divIcon({ html: '👁️', className: 'map-icon blind-school-icon', iconSize: iconSize }),
    oldAgeHome: L.divIcon({ html: '👵', className: 'map-icon old-age-home-icon', iconSize: iconSize }),
    specialAidHome: L.divIcon({ html: '♿', className: 'map-icon special-aid-home-icon', iconSize: iconSize }),
    jail: L.divIcon({ html: '🏢', className: 'map-icon jail-icon', iconSize: iconSize })
};

// Sample data for each type
const sampleData = {
    donor: ['Community Kitchen', 'Anand Hotel', 'Rajus Dhabha', 'Punjabi Rasoi', 'Gupta Bhojanalay'],
    ngo: ['Seva Food Bank', 'Anna Dan NGO', 'Khushiyon Ka Langar', 'Annapurna Trust'],
    volunteer: ['Vivek Sharma', 'Priya Patel', 'Amit Joshi', 'Rohit Verma', 'Neha Nair'],
    host: ['Sarvodaya Community Center', 'Amul School Host', 'Sankalp Bhavan'],
    picker: ['Deepak Singh', 'Mohammed Rafi', 'Sanjay Kumar', 'Ramesh Solanki', 'Arjun Yadav'],
    school: ['City Public School', 'Bright Future School', 'Knowledge Academy'],
    blindSchool: ['Blind Peoples Association', 'Andh Kanya Prakash Gruh'],
    oldAgeHome: ['Jeevan Sandhya Old Age Home', 'Seva Senior Citizen Home'],
    specialAidHome: ['Apang Manav Mandal', 'Disabled Welfare Trust of India'],
    jail: ['Sabarmati Central Jail', 'Ahmedabad District Jail']
};

// Function to add markers of different types
function addMarkers(type) {
    const names = sampleData[type];
    names.forEach(name => {
        const coord = getRandomCoord(ahmedabadCoords, 5);
        const marker = L.marker(coord, { icon: icons[type] }).addTo(map);
        
        let popupContent = `<b>${type.charAt(0).toUpperCase() + type.slice(1)}:</b> ${name}<br>`;
        const id = generateUniqueId();
        markers[id] = { type: type, name: name, marker: marker, coord: coord };

        if (type === 'donor') {
            const foodId = generateUniqueId();
            const freshness = Math.floor(Math.random() * 10) + 1;
            const healthiness = Math.floor(Math.random() * 10) + 1;
            const allergyTags = ['Nuts', 'Dairy', 'Gluten', 'Soy'];
            const allergyTag = allergyTags[Math.floor(Math.random() * allergyTags.length)];
            const urgency = Math.floor(Math.random() * 10) + 1;
            
            popupContent += `Food ID: ${foodId}<br>`;
            popupContent += `Freshness: ${freshness}/10<br>`;
            popupContent += `Healthiness: ${healthiness}/10<br>`;
            popupContent += `Allergy Tag: ${allergyTag}<br>`;
            popupContent += `Urgency: ${urgency}/10<br>`;
            
            markers[id].foodId = foodId;
            markers[id].freshness = freshness;
            markers[id].healthiness = healthiness;
            markers[id].allergyTag = allergyTag;
            markers[id].urgency = urgency;
        }

        marker.bindPopup(`<div class="popup-content">${popupContent}</div>`);

        marker.on('mouseover', function () {
            this.openPopup();
        });
        marker.on('mouseout', function () {
            this.closePopup();
        });
    });
}

// Add markers to the map
Object.keys(sampleData).forEach(addMarkers);

// Create legend
function createLegend() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = '<h4>Legend</h4>';

        Object.entries(icons).forEach(([type, icon]) => {
            div.innerHTML += `
                <div class="legend-item">
                    <span class="legend-icon">${icon.options.html}</span>
                    <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
            `;
        });

        return div;
    };

    legend.addTo(map);
}

createLegend();

// Function to simulate food journey with shortest route
function simulateFoodJourney() {
    const donors = Object.values(markers).filter(m => m.type === 'donor');
    const recipients = Object.values(markers).filter(m => ['host', 'school', 'blindSchool', 'oldAgeHome', 'specialAidHome', 'jail'].includes(m.type));
    const pickers = Object.values(markers).filter(m => m.type === 'picker');
    
    if (donors.length === 0 || recipients.length === 0 || pickers.length === 0) {
        alert('Not enough entities to simulate a food journey');
        return;
    }

    const donor = donors[Math.floor(Math.random() * donors.length)];
    const recipient = recipients[Math.floor(Math.random() * recipients.length)];
    const picker = pickers[Math.floor(Math.random() * pickers.length)];

    const journey = {
        id: generateUniqueId(),
        foodId: donor.foodId,
        donor: donor,
        picker: picker,
        recipient: recipient,
        status: 'In Progress',
        freshness: donor.freshness,
        healthiness: donor.healthiness,
        allergyTag: donor.allergyTag,
        urgency: donor.urgency
    };

    foodJourneys.push(journey);

    // Calculate and display the shortest route
    calculateShortestRoute(donor.coord, picker.coord, recipient.coord);

    updateJourneyInfo();
}

// Function to calculate and display the shortest route
function calculateShortestRoute(start, mid, end) {
    // Clear existing routes
    map.eachLayer((layer) => {
        if (layer instanceof L.Routing.Control) {
            map.removeLayer(layer);
        }
    });

    // Calculate direct route (start to end)
    const directRoute = L.Routing.control({
        waypoints: [
            L.latLng(start[0], start[1]),
            L.latLng(end[0], end[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
        showAlternatives: false,
        lineOptions: {
            styles: [{ color: 'blue', opacity: 0.6, weight: 4 }]
        }
    }).addTo(map);

    // Calculate route with picker (start to mid to end)
    const pickerRoute = L.Routing.control({
        waypoints: [
            L.latLng(start[0], start[1]),
            L.latLng(mid[0], mid[1]),
            L.latLng(end[0], end[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
        showAlternatives: false,
        lineOptions: {
            styles: [{ color: 'green', opacity: 0.6, weight: 4 }]
        }
    }).addTo(map);

    // Compare routes and highlight the shortest
    directRoute.on('routesfound', function(e) {
        const directDistance = e.routes[0].summary.totalDistance;
        pickerRoute.getRouter().route([
            { latLng: L.latLng(start[0], start[1]) },
            { latLng: L.latLng(mid[0], mid[1]) },
            { latLng: L.latLng(end[0], end[1]) }
        ], function(err, routes) {
            const pickerDistance = routes[0].summary.totalDistance;
            if (directDistance < pickerDistance) {
                directRoute.setWaypoints(directRoute.getWaypoints());
                map.removeControl(pickerRoute);
            } else {
                pickerRoute.setWaypoints(pickerRoute.getWaypoints());
                map.removeControl(directRoute);
            }
        });
    });
}

function getUrgencyColor(urgency) {
    const hue = 120 - (urgency * 12); // 120 is green, 0 is red
    return `hsl(${hue}, 100%, 50%)`;
}

function scheduleEvent() {
    const eventType = prompt('Enter event type (e.g., Surplus Sunday, Chef Session):');
    const eventDate = prompt('Enter event date (YYYY-MM-DD):');
    const eventLocation = prompt('Enter event location:');
    if (eventType && eventDate && eventLocation) {
        alert(`Event scheduled:\nType: ${eventType}\nDate: ${eventDate}\nLocation: ${eventLocation}`);
        // Here you would typically save this to a database
    } else {
        alert('Event scheduling cancelled');
    }
}

function createCommunityPage() {
    const communityName = prompt('Enter community name:');
    if (communityName) {
        alert(`Community page created for ${communityName}`);
        // Here you would typically create a new page or section for this community
    }
}

function getRandomCoord(center, offsetKm) {
    const earthRadius = 6371; // Earth's radius in km
    const lat = center[0] + (Math.random() - 0.5) * 2 * offsetKm / earthRadius * (180 / Math.PI);
    const lon = center[1] + (Math.random() - 0.5) * 2 * offsetKm / earthRadius * (180 / Math.PI) / Math.cos(center[0] * Math.PI / 180);
    return [lat, lon];
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function updateJourneyInfo() {
    console.log('Journey info updated:', foodJourneys);
    // Here you would typically update the UI with journey information
    // For example, updating a list or table of active food journeys
}

// Function to create map hotspots based on urgency
function createMapHotspots() {
    const donors = Object.values(markers).filter(m => m.type === 'donor');
    donors.forEach(donor => {
        const radius = donor.urgency * 100; // Radius based on urgency
        const circle = L.circle(donor.coord, {
            color: getUrgencyColor(donor.urgency),
            fillColor: getUrgencyColor(donor.urgency),
            fillOpacity: 0.2,
            radius: radius
        }).addTo(map);
    });
}

// Function to simulate volunteer growth
function simulateVolunteerGrowth(volunteerId) {
    const volunteer = markers[volunteerId];
    if (volunteer && volunteer.type === 'volunteer') {
        volunteer.impactScore = (volunteer.impactScore || 0) + Math.floor(Math.random() * 10) + 1;
        alert(`${volunteer.name}'s impact score is now ${volunteer.impactScore}!`);
    }
}

// Initialize the map with markers and hotspots
updateJourneyInfo();
createMapHotspots();

// Event listeners for buttons (assuming they exist in your HTML)
document.getElementById('simulateJourneyBtn').addEventListener('click', simulateFoodJourney);
document.getElementById('scheduleEventBtn').addEventListener('click', scheduleEvent);
document.getElementById('createCommunityBtn').addEventListener('click', createCommunityPage);
