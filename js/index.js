addEventListener('load', function () { document.documentElement.style.opacity = 1; });

addEventListener(
  'DOMContentLoaded',
  function () {
    var minZoom = 2;
    var maxZoom = 18;
    var smallDelay = 2500;
    var delay = 30000;
    var mapCenter = [51.505, -0.09];
    var zoom = minZoom;
    var geolocation = navigator.geolocation;

    var collect = document.querySelector('.collect');
    collect.addEventListener('click', function () {
      collect.disabled = true;
      var raf = 0;
      var textContent = collect.textContent;
      var timeout = setTimeout(onposition, delay);
      var time = Date.now();
      (function progress() {
        bar.value = Math.min(Date.now() - time, delay);
        raf = requestAnimationFrame(progress);
      }());
      var accuracy = Infinity;
      var coordinates = [0, 0, 0, 0];
      var watcher = geolocation.watchPosition(
        function (position) {
          var coords = position.coords;
          var acc = Math.min(coords.accuracy, accuracy);
          if (acc < accuracy) {
            accuracy = acc;
            collect.textContent = getInfo(acc);
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
          if (accuracy <= 5) {
            clear();
            (function end() {
              bar.value++;
              if (bar.value < delay)
                requestAnimationFrame(end);
              else
                onposition();
            });
          }
        },
        function (error) {
          console.error(error);
          collect.textContent = textContent;
          collect.disabled = false;
          clear();
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0
        }
      );
      function clear() {
        clearTimeout(timeout);
        cancelAnimationFrame(raf);
        geolocation.clearWatch(watcher);
      }
      function onposition() {
        clear();
        collection.push(coordinates);
        localStorage.setItem('coordinates', JSON.stringify(collection));
        bar.value = delay;
        map.flyTo([coordinates[0], coordinates[1]], maxZoom);
        collect.textContent = 'Coordinates saved ❤️';
        online();
        setTimeout(
          function () {
            map.flyTo(mapCenter, zoom = minZoom);
            collect.textContent = textContent;
            collect.disabled = false;
          },
          smallDelay * 2
        );
      }
    });

    var send = document.querySelector('.send');
    addEventListener('online', online);
    send.addEventListener('click', post);

    var bar = document.querySelector('.progress');
    bar.setAttribute('max', delay);

    var map = L.map('map').setView(mapCenter, minZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var collection = JSON.parse(localStorage.getItem('coordinates') || '[]');
    if (location.hash === '#sent') {
      var textContent = send.textContent;
      collection.splice(0);
      localStorage.setItem('coordinates', '[]');
      send.textContent = 'Coordinates sent: Thank You ❤️';
      send.classList.remove('is-info');
      send.classList.add('is-success');
      location.hash = '';
      setTimeout(
        function () {
          send.textContent = textContent;
          send.classList.remove('is-success');
          send.classList.add('is-primary');
        },
        smallDelay
      );
    } else {
      online();
    }

    function field(form, name, value) {
      var field = form.appendChild(document.createElement('input'));
      field.name = name;
      field.value = value;
      return field;
    }

    function getInfo(m) {
      return 'GPS accuracy: ' + m.toFixed(2) + ' meters';
    }

    function post() {
      send.disabled = true;
      var date = new Date;
      var form = document.body.appendChild(document.createElement('form'));
      form.style.cssText = 'position:fixed;left:-1000px;top:-1000px;';
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
        JSON.stringify(
          collection,
          null,
          '  '
        ).replace(/\n/g, '<br>')
      );
      field(
        form,
        'after',
        location.protocol + '//' + location.host + '/#sent'
      );
      form.submit();
    }

    function online() {
      if (collection.length && navigator.onLine)
        send.disabled = false;
    }

  }
);
