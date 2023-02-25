let singapore = [1.3521, 103.8198] //start point change to singapore
let map = L.map('map');
map.setView(singapore, 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function getRandomLatLng(map) {
    // get the boundaries of the map
    let bounds = map.getBounds();
    let southWest = bounds.getSouthWest();
    let northEast = bounds.getNorthEast();

    let lngSpan = northEast.lng - southWest.lng;
    let latSpan = northEast.lat - southWest.lat;

    let randomLng = Math.random() * lngSpan + southWest.lng;
    let randomLat = Math.random() * latSpan + southWest.lat;

    return [randomLat, randomLng];
}

const foursquare = {
    API_KEY: "fsq331OlQJLkuEtpOYZ/Wc3NNCUSfvlqMjdOpXhmXzYtnsg=",
    URL: "https://api.foursquare.com/v3/places/search",
    categories: {
        mrt: 19046,
        gym: 18021,
        restaurant: 13065,
        bar: 13003
    },
    centerpoint: singapore,

}

// create layers for each category change to markercluster group
//google search = leaftlet marker cluster
// let restaurantLayer = L.layerGroup()
// let MRTLayer = L.markerClusterGroup({
//     iconCreateFunction: function(cluster) {
//         return L.divIcon({
//             html: `<div class="customMarkerClusterIcon">
//             ${cluster.getChildCount()}
//             </div>`
//         });
//     }
// });
let MRTLayer = L.markerClusterGroup();
let restaurantLayer = L.layerGroup();
let gymLayer = L.layerGroup();
let barLayer = L.layerGroup();

let searchRadiusLayer = L.layerGroup().addTo(map);
let searchGymLayer = L.layerGroup().addTo(map);

// add the layers to the map
// map.addLayer(MRTLayer);
MRTLayer.addTo(map);
restaurantLayer.addTo(map);
gymLayer.addTo(map);
barLayer.addTo(map);

// create the base layers and the overlay
let overlays = {
    'MRT': MRTLayer,
    'Restaurant': restaurantLayer,
    'Gym': gymLayer,
    'Bar': barLayer
}

// add overlay to map
L.control.layers({}, overlays).addTo(map);

//ICON
const restaurantIcon = L.icon({
    iconUrl: 'img/restaurant.png',
    iconSize: [45,45],
    iconAnchor:[23,45],
    popupAnchor: [0,0]
})

const mrtIcon = L.icon({
    iconUrl: 'img/mrt.png',
    iconSize: [45,45],
    iconAnchor:[23,45],
    popupAnchor: [0,0]
})
const gymIcon = L.icon({
    iconUrl: 'img/gym.png',
    iconSize: [45,45],
    iconAnchor:[23,45],
    popupAnchor: [0,0]
})

const barIcon = L.icon({
    iconUrl: 'img/bar.png',
    iconSize: [45,45],
    iconAnchor:[23,45],
    popupAnchor: [0,0]
})

async function main() {

    MRTLayer.clearLayers();
    restaurantLayer.clearLayers();
    gymLayer.clearLayers();
    barLayer.clearLayers();
    searchRadiusLayer.clearLayers();

    // console.log('search point=============');
    console.log(foursquare.centerpoint);

    //MRT
    let mrtResponse = await axios.get(foursquare.URL, {
        "headers": {
            "Accept": "application/json",
            "Authorization": foursquare.API_KEY
        },
        "params": {
            "ll": foursquare.centerpoint[0] + ',' + foursquare.centerpoint[1],
            "categories": foursquare.categories.mrt,
            "radius": 40000,
            "limit": 50,
            "sort": "distance"
        },
    });
    console.log("this is data ", mrtResponse)

    for (let MRT of mrtResponse.data.results) {
        let marker = L.marker([MRT.geocodes.main.latitude, MRT.geocodes.main.longitude],{icon:mrtIcon});
        marker.bindPopup(`<h1>${MRT.name}</h1>`); 
        //maps.
        marker.addTo(MRTLayer);
    }

    //restaurant
    let restaurantResponse = await axios.get(foursquare.URL, {
        "headers": {
            "Accept": "application/json",
            "Authorization": foursquare.API_KEY
        },
        "params": {
            "ll": foursquare.centerpoint[0] + ',' + foursquare.centerpoint[1],
            "catagories": foursquare.categories.restaurant,
            "radius": 40000,
            "limit": 50,
            "sort": "distance"
        }
    });

    for (let restaurant of restaurantResponse.data.results) {
        let restaurantMarker = L.marker([restaurant.geocodes.main.latitude, restaurant.geocodes.main.longitude],{icon: restaurantIcon});
           
        restaurantMarker.bindPopup(`<h1>${restaurant.name}</h1>`)
        restaurantMarker.addTo(restaurantLayer);
    }
    

    //gym
    let gymResponse = await axios.get(foursquare.URL, {
        "headers": {
            "Accept": "application/json",
            "Authorization": foursquare.API_KEY
        },
        "params": {
            "ll": foursquare.centerpoint[0] + ',' + foursquare.centerpoint[1],
            "categories": foursquare.categories.gym,
            "radius": 40000,
            "limit": 50,
            "sort": "distance"
        }
    });

    for (let gym of gymResponse.data.results) {
        let gymMarker = L.marker([gym.geocodes.main.latitude, gym.geocodes.main.longitude], {icon:gymIcon});
           
        gymMarker.bindPopup(`<h1>${gym.name}</h1>`);
        gymMarker.addTo(gymLayer);
    }

    //bar
    let barResponse = await axios.get(foursquare.URL, {
        "headers": {
            "Accept": "application/json",
            "Authorization": foursquare.API_KEY
        },
        "params": {
            "ll": foursquare.centerpoint[0] + ',' + foursquare.centerpoint[1],
            "categories": foursquare.categories.bar,
            "radius": 40000,
            "limit": 50,
            "sort": "distance"
        }
    });


    for (let bar of barResponse.data.results) {
        let barMarker = L.marker([bar.geocodes.main.latitude, bar.geocodes.main.longitude], {icon:barIcon});
       
        barMarker.bindPopup(`<h1>${bar.name}</h1>`);
        barMarker.addTo(barLayer);
    }
}

document.querySelector("#btnSearch").addEventListener("click", async function () {
    let searchValue = document.querySelector('#searchValue').value;
    console.log(searchValue);

    // search mrt result
    let searchResponse = await axios.get(foursquare.URL, {
        "headers": {
            "Accept": "application/json",
            "Authorization": foursquare.API_KEY
        },
        "params": {
            "ll": singapore[0] + ',' + singapore[1],
            // "categories": foursquare.categories.mrt,
            "radius": 30000,
            "limit": 1,
            "query": searchValue
        },
    });

    console.log(searchResponse.data);
    

    let searchPoint = [searchResponse.data.results[0].geocodes.main.latitude, searchResponse.data.results[0].geocodes.main.longitude]
    
    // call bar, restaurant, gym apis using searchpoint
    //restaurant
    let restaurantRequest = axios.get(foursquare.URL, {
        "headers": {
            "Accept": "application/json",
            "Authorization": foursquare.API_KEY
        },
        "params": {
            "ll": searchPoint.join(','),
            "catagories": foursquare.categories.restaurant,
            "radius": 1000, // can allow user to choose how big the search radius around selected MRT
            "limit": 10,
            "sort": "distance"
        }
    });

    //bar
    let barRequest = axios.get(foursquare.URL, {
        "headers": {
            "Accept": "application/json",
            "Authorization": foursquare.API_KEY
        },
        "params": {
            "ll": searchPoint.join(','),
            "categories": foursquare.categories.bar,
            "radius": 1000,
            "limit": 10,
            "sort": "distance"
        }
    });

    //gym
    let gymRequest = axios.get(foursquare.URL, {
        "headers": {
            "Accept": "application/json",
            "Authorization": foursquare.API_KEY
        },
        "params": {
            "ll": searchPoint.join(','),
            "categories": foursquare.categories.gym,
            "radius": 1000,
            "limit": 10,
            "sort": "distance"
        }
    });

    let restaurantResponse = await restaurantRequest;
    let barResponse = await barRequest;
    let gymResponse =  await gymRequest;

    for (let restaurant of restaurantResponse.data.results) {
        let restaurantMarker = L.marker([restaurant.geocodes.main.latitude, restaurant.geocodes.main.longitude],{icon: restaurantIcon});
           
        restaurantMarker.bindPopup(`<h1>${restaurant.name}</h1>`)
        restaurantMarker.addTo(restaurantLayer);
    }

    for (let bar of barResponse.data.results) {
        let barMarker = L.marker([bar.geocodes.main.latitude, bar.geocodes.main.longitude], {icon:barIcon});
       
        barMarker.bindPopup(`<h1>${bar.name}</h1>`);
        barMarker.addTo(barLayer);
    }

    // let testLayer = L.layerGroup().addTo(map);
    for (let gym of gymResponse.data.results) {
        let gymMarker = L.marker([gym.geocodes.main.latitude, gym.geocodes.main.longitude], {icon:gymIcon});

        gymMarker.bindPopup(`<h1>${gym.name}</h1>`);
        gymMarker.addTo(gymLayer);
        // gymMarker.addTo(searchGymLayer);
    }
    
    // Display search radius
    L.circle(searchPoint, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 1000 // change according to user selected radius
    }).addTo(searchRadiusLayer);

    console.log(searchPoint);
    console.log(barResponse.data.results);
    console.log(restaurantResponse.data.results);
    console.log(gymResponse.data.results);
    map.flyTo(searchPoint, 17);
    foursquare.centerpoint = searchPoint;
    // main();
});

main();


