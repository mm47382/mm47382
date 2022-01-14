function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  console.log();
  if (ev.target.parentElement.value === "taken") {
    ev.target.parentElement.value = "empty";
  }
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  const evaluate = ev.target.parentElement.value
    ? ev.target.value
    : ev.target.parentElement.value;
  ev.preventDefault();
  const element = document.getElementById(ev.target.id);
  if (evaluate !== "taken") {
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    ev.target.parentElement.value = "taken";
    ev.target.value = "taken";
    if (checkIfWon()) {
      notifyUser();
    }
  }
}

function notifyUser() {
  if (window.Notification && Notification.permission !== "denied") {
    new Notification("Puzzle Map", {
      body: "Gratulacje puzzle ułozone!",
    });
  }
}

function checkIfWon() {
  const items = Array.from(document.getElementsByClassName("puzzle-item"));
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const imgId = item?.children?.length ? item.children[0].id : "img-1";
    const resultDrag = imgId.replace("img-", "");
    const resultDrop = item.id.replace("puzzle-item-", "");
    if (resultDrag !== resultDrop) {
      return false;
    }
  }
  return true;
}

function shuffle(arr) {
  const array = [...arr];
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const getImage = (map) => {
  leafletImage(map, function (err, canv) {
    const dimensions = map.getSize();
    const rowCount = 1;
    const widthOfOnePiece = dimensions.x / rowCount;
    const heightOfOnePiece = dimensions.y / rowCount;
    var imageItems = [];
    for (var x = 0; x < rowCount; ++x) {
      for (var y = 0; y < rowCount; ++y) {
        var canvas = document.createElement("canvas");
        canvas.width = widthOfOnePiece;
        canvas.height = heightOfOnePiece;
        var context = canvas.getContext("2d");
        context.drawImage(
          canv,
          y * widthOfOnePiece,
          x * heightOfOnePiece,
          widthOfOnePiece,
          heightOfOnePiece,
          0,
          0,
          canvas.width,
          canvas.height
        );
        imageItems.push(canvas.toDataURL());
      }
    }

    const puzzleContainer = document.getElementById("puzzle-container");
    puzzleContainer.style.width = dimensions.x;
    puzzleContainer.style.height = dimensions.y;
    puzzleContainer.innerHTML = "";
    const container = document.getElementById("puzzle-items-container");
    container.innerHTML = "";
    const imgs = [];
    imageItems.forEach((piece, ind) => {
      const dropElement = document.createElement("div");
      dropElement.classList.add("puzzle-item");
      dropElement.id = "puzzle-item-" + ind;
      dropElement.style.width = widthOfOnePiece + "px";
      dropElement.style.height = heightOfOnePiece + "px";
      dropElement.ondrop = drop;
      dropElement.ondragover = allowDrop;
      puzzleContainer.appendChild(dropElement);

      const img = document.createElement("img");
      img.value = "taken";
      img.src = piece;
      img.draggable = "true";
      img.ondragstart = drag;
      img.id = "img-" + ind;
      imgs.push(img);
    });
    shuffle(imgs).forEach((imgItem) => {
      container.appendChild(imgItem);
    });
  });
};

const setupMap = () => {
  var map = L.map("map").setView([51.505, -0.09], 13);
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibW00NzM4MiIsImEiOiJja3k3bDZjbGwxNnlmMnBwdjNiN2h1Y2Z0In0.SiuLOCO2aoI9j9bGOD3Qjw",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/satellite-v9",
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        "pk.eyJ1IjoibW00NzM4MiIsImEiOiJja3k3bDZjbGwxNnlmMnBwdjNiN2h1Y2Z0In0.SiuLOCO2aoI9j9bGOD3Qjw",
    }
  ).addTo(map);
  return map;
};
const setupListeners = (map) => {
  document.addEventListener("DOMContentLoaded", function () {
    if (!Notification) {
      alert("Desktop notifications not available in your browser.");
      return;
    }
    if (Notification.permission !== "granted") Notification.requestPermission();
  });
  document
    .getElementById("save-raster")
    .addEventListener("click", () => getImage(map));
  document
    .getElementById("get-location")
    .addEventListener("click", function (event) {
      if (!navigator.geolocation) {
        console.warn("No geolocation.");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
          let lat = position.coords.latitude;
          let lon = position.coords.longitude;

          map.setView([lat, lon], 17);
        },
        (positionError) => {
          console.error(positionError);
        }
      );
    });
};

window.onload = () => {
  let map = setupMap();
  setupListeners(map);
};
