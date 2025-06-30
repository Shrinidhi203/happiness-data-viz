
document.addEventListener("DOMContentLoaded", function () {
    const countrySelect = document.getElementById("countrySelect");
    const ctx = document.getElementById("happinessChart").getContext("2d");

    const startYearSelect = document.getElementById("startYearSelect");
    const endYearSelect = document.getElementById("endYearSelect");

    // Populate year dropdowns
    const minYear = 2000;
    const maxYear = 2024;
    function populateYearDropdowns() {
        startYearSelect.innerHTML = '';
        endYearSelect.innerHTML = '';
        for (let y = minYear; y <= maxYear; y++) {
            const startOpt = document.createElement('option');
            startOpt.value = y;
            startOpt.textContent = y;
            startYearSelect.appendChild(startOpt);

            const endOpt = document.createElement('option');
            endOpt.value = y;
            endOpt.textContent = y;
            endYearSelect.appendChild(endOpt);
        }
        startYearSelect.value = 2018;
        endYearSelect.value = 2022;
    }
    populateYearDropdowns();

    // Disable end years less than selected start year
    function updateEndYearOptions() {
        const startYear = parseInt(startYearSelect.value, 10);
        Array.from(endYearSelect.options).forEach(opt => {
            opt.disabled = parseInt(opt.value, 10) < startYear;
        });
        // If current end year is less than start year, set to start year
        if (parseInt(endYearSelect.value, 10) < startYear) {
            endYearSelect.value = startYear;
        }
    }
    startYearSelect.addEventListener('change', updateEndYearOptions);
    // Initialize on load
    updateEndYearOptions();

    const sampleData = {
        "India": [4.0, 4.2, 4.3, 4.1, 4.0],
        "United States": [6.9, 7.0, 6.8, 6.7, 6.9],
        "Brazil": [6.3, 6.2, 6.1, 6.0, 6.1]
    };

    const years = [2018, 2019, 2020, 2021, 2022];

    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Happiness Index',
                data: sampleData["India"],
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });

    countrySelect.addEventListener("change", function () {
        const selectedCountry = countrySelect.value;
        chart.data.datasets[0].data = sampleData[selectedCountry];
        chart.data.datasets[0].label = `Happiness Index - ${selectedCountry}`;
        chart.update();
    });
});
