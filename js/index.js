addEventListener(
  'load',
  function () {
    document.documentElement.style.opacity = 1;
  }
);

addEventListener(
  'DOMContentLoaded',
  function () {
    var zoom = 2;
    var geolocation = navigator.geolocation;
    var button = document.querySelector('.button.is-primary');
    var bar = document.querySelector('.progress');
    button.addEventListener('click', function () {
      button.disabled = true;
      var textContent = button.textContent;
      button.textContent = getTag('?');
      var raf = 0;
      var delay = 10000;
      var timeout = setTimeout(
        function () {
          cancelAnimationFrame(raf);
          geolocation.clearWatch(watcher);
          bar.value = delay;
          button.textContent = textContent;
          map.flyTo([coordinates[0], coordinates[1]], 12);
          post(coordinates)
            .then(function (b) { return b.json(); })
            .then(console.log)
            .catch(console.error);
        },
        10000
      );
      var time = Date.now();
      (function progress() {
        bar.value = Math.min(Date.now() - time, delay);
        raf = requestAnimationFrame(progress);
      }());
      var accuracy = Infinity;
      var coordinates = [0, 0, 0, 0];
      var watcher = geolocation.watchPosition(
        function(position) {
          var coords = position.coords;
          var acc = Math.min(coords.accuracy, accuracy);
          if (acc < accuracy) {
            accuracy = acc;
            button.textContent = getTag(acc);
          }
          coordinates = [
            coords.latitude,
            coords.longitude,
            coords.altitude || 0,
            accuracy
          ];
          map.flyTo([coords.latitude, coords.longitude], zoom++);
        },
        function (error) {
          console.error(error);
          cancelAnimationFrame(raf);
          clearTimeout(timeout);
          button.textContent = textContent;
          button.disabled = false;
        },
        {
          enableHighAccuracy: true, 
          maximumAge        : 0,
          timeout           : delay * 2
        }
      );
    });
    var map = L.map('map').setView([51.505, -0.09], zoom++);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    function getTag(m) {
      return 'best accuracy: ' + m + ' meters';
    }
    function post(coordinates) {
      return fetch('https://jumprock.co/mail/nohum', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({
          subject: 'No Hum World - Coordinates',
          message: 'Another place with no Hum: ' + coordinates
        })
      });
    }
  }
);