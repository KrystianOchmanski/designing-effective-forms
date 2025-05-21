let clickCount = 0;

const countryInput = document.getElementById("country");
const countryCode = document.getElementById("countryCode");
const myForm = document.getElementById("form");
const modal = document.getElementById("form-feedback-modal");
const clicksInfo = document.getElementById("click-count");

function handleClick() {
  clickCount++;
  clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    if (!response.ok) {
      throw new Error("Błąd pobierania danych krajów");
    }
    const data = await response.json();

    const countries = data
      .map((country) => country.name.common)
      .sort((a, b) => a.localeCompare(b));

    countryInput.innerHTML = countries
      .map((country) => `<option value="${country}">${country}</option>`)
      .join("");

    // Initialize Select2 AFTER the options have been loaded
    // Ensure jQuery is loaded before this runs
    if (typeof jQuery !== "undefined") {
      $("#country").select2({
        placeholder: "Wyszukaj lub wybierz kraj",
        allowClear: true, // Allows clearing the selection
      });

      getCountryByIP();
    } else {
      console.error("jQuery is not loaded. Select2 requires jQuery.");
    }
  } catch (error) {
    console.error(
      "Wystąpił błąd podczas pobierania lub inicjalizacji krajów:",
      error
    );
  }
}

function getCountryByIP() {
  fetch("https://get.geojs.io/v1/ip/geo.json")
    .then((response) => response.json())
    .then((data) => {
      const country = data.country;
      // TODO inject country to form and call getCountryCode(country) function
      if (typeof jQuery !== "undefined") {
        $("#country").val(country).trigger("change");
      } else {
        countryInput.value = country;
      }

      getCountryCode(country);
    })
    .catch((error) => {
      console.error("Błąd pobierania danych z serwera GeoJS:", error);
    });
}

function getCountryCode(countryName) {
  const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Błąd pobierania danych");
      }
      return response.json();
    })
    .then((data) => {
      const code = data[0].idd.root + data[0].idd.suffixes.join("");
      // TODO inject countryCode to form
      countryCode.value = code;
    })
    .catch((error) => {
      console.error("Wystąpił błąd:", error);
    });
}

(() => {
  // nasłuchiwania na zdarzenie kliknięcia myszką
  document.addEventListener("click", handleClick);

  fetchAndFillCountries();
})();
