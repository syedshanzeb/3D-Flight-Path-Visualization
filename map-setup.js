require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/Graphic",
  "esri/geometry/Polyline",
  "esri/geometry/Point",
  "esri/layers/GraphicsLayer",
  "esri/layers/ElevationLayer",
  "esri/symbols/TextSymbol",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Widget"
], function(Map, SceneView, Graphic, Polyline, Point, GraphicsLayer, ElevationLayer, TextSymbol, BasemapGallery, Widget) {

  const map = new Map({
    basemap: "streets-night-vector", // Default dark street basemap
    ground: "world-elevation" // Adds world elevation for 3D topography
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: { longitude: 82.62225769116584, latitude: 8.350435403937816, z: 7279042.968456211 },  // New camera position
      tilt: 11.882677594718931,  // New tilt value
      heading: 0  // Heading remains the same, or adjust if needed
    }
  });
  
  // Set the new zoom level
  view.zoom = 5.295114900889734;  // New zoom level
              
  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  const delhi = { latitude: 28.644800, longitude: 77.216721 };
  const bengaluru = { latitude: 12.971598, longitude: 77.594566 };

  function createLabeledMarker(coords, color, cityName) {
    const point = new Point({ longitude: coords.longitude, latitude: coords.latitude });
    const marker = new Graphic({
      geometry: point,
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: color,
        size: "10px"
      }
    });

    const textSymbol = new TextSymbol({
      text: cityName,
      color: color,
      haloColor: "white",
      haloSize: "2px",
      font: { size: 12, family: "Arial", weight: "bold" },
      xoffset: 10,
      yoffset: 20
    });

    const textGraphic = new Graphic({
      geometry: point,
      symbol: textSymbol
    });

    graphicsLayer.addMany([marker, textGraphic]);
    return marker;
  }

  createLabeledMarker(delhi, "red", "Delhi, India");
  createLabeledMarker(bengaluru, "blue", "Bengaluru, India");

  const path = new Polyline({
    paths: [
      [delhi.longitude, delhi.latitude, 100000],
      [bengaluru.longitude, bengaluru.latitude, 100000]
    ]
  });

  const pathGraphic = new Graphic({
    geometry: path,
    symbol: {
      type: "simple-line",
      color: [0, 255, 255, 0.7],
      width: 2
    }
  });

  graphicsLayer.add(pathGraphic);

  let progress = 0;
  const planeSymbol = new Graphic({
    geometry: new Point({ longitude: delhi.longitude, latitude: delhi.latitude, z: 100000 }),
    symbol: {
      type: "picture-marker",
      url: "./img/plane.png",
      width: "40px",
      height: "40px",
      angle: 0
    }
  });

  graphicsLayer.add(planeSymbol);

  function animateAirplane() {
    if (progress >= 1) {
      progress = 0;
    }

    const x = delhi.longitude + (bengaluru.longitude - delhi.longitude) * progress;
    const y = delhi.latitude + (bengaluru.latitude - delhi.latitude) * progress;
    planeSymbol.geometry = new Point({ longitude: x, latitude: y, z: 100000 });

    progress += 0.001;
    requestAnimationFrame(animateAirplane);
  }

  animateAirplane();

  let clouds = [];

  function createCloud(coord) {
    const cloud = new Graphic({
      geometry: new Point({ longitude: coord.longitude, latitude: coord.latitude, z: 80000 }),
      symbol: {
        type: "picture-marker",
        url: "./img/cloud.png",
        width: "50px",
        height: "50px",
        opacity: 0.5
      }
    });
    graphicsLayer.add(cloud);
    clouds.push(cloud);

    setTimeout(() => {
      graphicsLayer.remove(cloud);
      clouds = clouds.filter((c) => c !== cloud);
    }, 5000);
  }

  setInterval(() => {
    const randomLongitude = delhi.longitude + (Math.random() * (bengaluru.longitude - delhi.longitude));
    const randomLatitude = delhi.latitude + (Math.random() * (bengaluru.latitude - delhi.latitude));
    createCloud({ longitude: randomLongitude, latitude: randomLatitude });
  }, 3000);

  view.watch("camera", (camera) => {
    const { longitude, latitude, z } = camera.position;
    const tilt = camera.tilt;
    const zoom = view.zoom;

    console.log(`Zoom: ${zoom}`);
    console.log(`Tilt: ${tilt}`);
    console.log(`Longitude: ${longitude}`);
    console.log(`Latitude: ${latitude}`);
    console.log(`Z: ${z}`);
  });
  

  // BasemapGallery widget
  const basemapGallery = new BasemapGallery({
    view: view,
    visible: false // Set the BasemapGallery to be hidden by default
  });
// Assuming you have the map and view already set up:

// Remove Attribution widget
view.ui.remove("attribution");

// Remove Bottom-Left widget (if it's a specific widget added)
view.ui.remove("bottom-left");

// Remove Bottom-Right widget (if it's a specific widget added)
view.ui.remove("bottom-right");

  // Add the BasemapGallery widget to the top-right
  view.ui.add(basemapGallery, "top-right");

  // Create a custom button to toggle the BasemapGallery visibility
  const toggleButton = document.createElement("button");
  toggleButton.classList.add("esri-widget--button");
  toggleButton.style.backgroundImage = "url('img/toggle.png')";
  toggleButton.style.backgroundSize = "cover";
  toggleButton.style.width = "40px";
  toggleButton.style.height = "40px";
  toggleButton.style.position = "absolute";
  toggleButton.style.top = "10px";
  toggleButton.style.right = "10px";
  toggleButton.style.border = "none";
  toggleButton.style.cursor = "pointer";

  toggleButton.onclick = function() {
    // Toggle the visibility of the BasemapGallery widget
    basemapGallery.visible = !basemapGallery.visible;
  };

  // Add the button to the UI
  view.ui.add(toggleButton);
});
