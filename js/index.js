addEventListener('load', function () { document.documentElement.style.opacity = 1; });

addEventListener(
  'DOMContentLoaded',
  function () {
    var minZoom = 2;
    var maxZoom = 12;
    var delay = 30000;
    var zoom = minZoom;
    var geolocation = navigator.geolocation;
    var button = document.querySelector('.button.is-primary');
    var bar = document.querySelector('.progress');
    bar.setAttribute('max', delay);
    button.addEventListener('click', function prepare() {
      button.disabled = true;
      var textContent = button.textContent;
      button.classList.remove('is-primary');
      button.classList.add('is-info');
      button.textContent = getInfo(-1);
      var raf = 0;
      var timeout = setTimeout(
        function () {
          cancelAnimationFrame(raf);
          geolocation.clearWatch(watcher);
          bar.value = delay;
          map.flyTo([coordinates[0], coordinates[1]], maxZoom);
          button.removeEventListener('click', prepare);
          button.addEventListener('click', function send() {
            button.removeEventListener('click', send);
            button.addEventListener('click', prepare);
            button.disabled = true;
            post(coordinates)
              .then(function () {
                button.textContent = 'Coordinates sent: Thank You ❤️';
                button.classList.add('is-success');
              })
              .catch(function () {
                button.textContent = 'Something went wrong, please try again';
                button.classList.add('is-warning');
              })
              .then(function () {
                button.classList.remove('is-info');
                setTimeout(
                  function () {
                    map.flyTo([51.505, -0.09], zoom = minZoom);
                    button.textContent = textContent;
                    button.disabled = false;
                    button.classList.remove('is-success', 'is-warning');
                    button.classList.add('is-primary');
                  },
                  5000
                );
              });
          });
          button.textContent = 'Ready to send coordinates';
          button.disabled = false;
        },
        delay
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
            button.textContent = getInfo(acc);
          }
          coordinates = [
            coords.latitude,
            coords.longitude,
            coords.altitude || 0,
            accuracy
          ];
          map.flyTo(
            [coordinates[0], coordinates[1]],
            zoom = Math.min(maxZoom, zoom + 1)
          );
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
          maximumAge: 0
        }
      );
    });
    var map = L.map('map').setView(
      [51.505, -0.09],
      zoom = Math.min(maxZoom, zoom + 1)
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    function getInfo(m) {
      return 'GPS accuracy: ' + m.toFixed(2) + ' meters';
    }
    function field(form, name, value) {
      var field = form.appendChild(document.createElement('input'));
      field.name = name;
      field.value = value;
      return field;
    }
    function post(coordinates) {
      return new Promise(function (resolve, reject) {
        var date = new Date;
        var form = document.body.appendChild(document.createElement('form'));
        form.target = '_self';
        form.method = 'post';
        form.action = 'https://jumprock.co/mail/nohum';
        field(
          form,
          'subject',
          'No Hum World - Coordinates @ ' + [
            date.getFullYear(),
            ('0' + date.getMonth()).slice(-2),
            ('0' + date.getDate()).slice(-2)
          ].join('-')
        );
        field(
          form,
          'message',
          'Another place with no Hum: ' + coordinates
        );
        field(
          form,
          'after',
          'https://nohum.world'
        );
        form.style.cssText = 'position:fixed;left:-1000px;top:-1000px;';
        form.submit();
        setTimeout(resolve, 5000);
      });
    }
  }
);
