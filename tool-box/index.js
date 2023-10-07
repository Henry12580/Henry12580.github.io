class HashRouter {
  routers = [
    { name: 'home', hash: "/", component: "Homepage" },
    { name: 'weather-history', hash: "/weather-history", component: "WeatherHistory" }
  ];

  currentRouter = "/";

  constructor() {
    this.refresh = this.refresh.bind(this);
    window.addEventListener('load', this.refresh, false);
    window.addEventListener('hashchange', this.refresh, false);
  }

  to(routerName) {
    this.routers.forEach(router => {
      if (router.name === routerName) {
        location.hash = '#' + router.hash;
        this.currentRouter = router.hash;
      }
    })
  }

  getHashPath(url) {
    const index = url.indexOf('#');
    if (index >= 0) {
      return url.slice(index + 1) || '/';
    }
    return '/';
  }

  changeComponentDisplay(componentHash, display) {
    this.routers.forEach(router => {
      if (router.hash === componentHash) {
        const hashComponent = document.getElementById(router.component);
        if (hashComponent) hashComponent.style.display = display;
      }
    });
  }

  refresh(event) {
    let curHash = '', oldHash = '';
    if (event.newURL) {
      oldHash = this.getHashPath(event.oldURL || '');
      curHash = this.getHashPath(event.newURL || '');
    } else {
      // 初次加载
      curHash = this.getHashPath(window.location.hash);
    }
    if (oldHash) {
      this.changeComponentDisplay(oldHash, 'none');
    } else {
      this.routers.forEach(router => {
        const hashComponent = document.getElementById(router.component);
        if (hashComponent) hashComponent.style.display = 'none';
      })
    }
    this.currentRouter = curHash;
    this.changeComponentDisplay(curHash, 'flow-root');
  }
}

class WeatherHistory {
  searchButton = document.querySelector('button.search');
  cityInput = document.querySelector('input.city');
  startDateInput = document.querySelector('input.start-time');
  endDateInput = document.querySelector('input.end-time');
  weatherIndexes = ["datetime", "icon", "temperature", "humidity", "pressure", "windspeed"];
  weatherTable = document.querySelector('#WeatherHistory table');
  weatherTableBody = document.querySelector('tbody');

  constructor() {
    const date = new Date();
    let [year, month, day] = [date.getFullYear(), date.getMonth()+1, date.getDate()];
    [year, month, day] = [year, month < 10 ? '0' + month : month, day < 10 ? '0' + day : day];
    const currDate = `${year}-${month}-${day}`;
    let preMonth = month > 10 ? month - 1 : month > 0 ? '0' + (month - 1) : 12;
    let preYear = month > 0 ? year : year - 1;
    const preMonthDate = `${preYear}-${preMonth}-${day}`;
    this.startDateInput.placeholder = `默认为 ${preMonthDate}`;
    this.endDateInput.placeholder = `默认为 ${currDate}`;

    this.searchButton.addEventListener('click', e => {
      this.city = this.cityInput.value || 'jinan';
      this.startDate = this.startDateInput.value || preMonthDate;
      this.endDate = this.endDateInput.value || currDate;
      this.searchWeather(this.city, this.startDate, this.endDate);
    })
  }

  searchWeather(city, startDate, endDate) {
    const api = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/${startDate}/${endDate}?unitGroup=metric&key=WKDRXJWCTN4WQQQ2LGUT3H6FP&contentType=json`;
    this.weatherTableBody.innerHTML = '';
    fetch(api).then(res => res.json()).then(res => {
      for (let day of res.days) {
        const tr = document.createElement('tr');
        for (let idx of this.weatherIndexes) {
          const td = document.createElement('td');
          td.innerHTML = idx === 'icon' ? translation[day[idx]] : idx === 'temperature' ? `${day[tempmin]} ~ ${day[tempmax]}` : day[idx];
          tr.appendChild(td);
        }
        this.weatherTableBody.appendChild(tr);
      }
      this.weatherTable.style.display = 'table';
    }).catch(err => {
      alert("请求过于频繁，请稍后再试");
    });
  }
}

!function main() {
  const router = new HashRouter();
  const routerContainer = document.getElementById('routers');
  let routerPages = null;
  if (routerContainer) routerPages = routerContainer.children;

  const routerButtons = document.querySelectorAll('#Homepage button');
  routerButtons.forEach(routerButton => {
    routerButton.addEventListener('click', e => {
      router.to(routerButton.name);
    });
  });

  const weatherHistory = new WeatherHistory();
}();
