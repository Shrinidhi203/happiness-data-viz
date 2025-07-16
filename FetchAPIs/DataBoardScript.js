document.addEventListener("DOMContentLoaded", function () {
    const countrySelect = document.getElementById("countrySelect");
    const ctx = document.getElementById("happinessChart").getContext("2d");
    const startYearSelect = document.getElementById("startYearSelect");
    const endYearSelect = document.getElementById("endYearSelect");

    // Add indicator dropdown
    let indicatorSelect = document.getElementById("indicatorSelect");
    if (!indicatorSelect) {
        indicatorSelect = document.createElement("select");
        indicatorSelect.id = "indicatorSelect";
        indicatorSelect.innerHTML = `
            <option value="Education">Education</option>
            <option value="GDP">GDP</option>
            <option value="Economy">Economy</option>
        `;
        countrySelect.parentNode.insertBefore(indicatorSelect, countrySelect.nextSibling);
    }

    // Map indicator to JSON file
    const indicatorFileMap = {
        "Education": "Indicator_data/Education_Indicator.json",
        "GDP": "Indicator_data/GDP_Indicator.json",
        "Economy": "Indicator_data/Economy_Indicator.json"
    };

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

    function updateEndYearOptions() {
        const startYear = parseInt(startYearSelect.value, 10);
        Array.from(endYearSelect.options).forEach(opt => {
            opt.disabled = parseInt(opt.value, 10) < startYear;
        });
        if (parseInt(endYearSelect.value, 10) < startYear) {
            endYearSelect.value = startYear;
        }
    }
    startYearSelect.addEventListener('change', updateEndYearOptions);
    updateEndYearOptions();

    // Fetch all countries from World Bank API and populate the dropdown
    fetch('https://api.worldbank.org/v2/country?format=json&per_page=400')
        .then(response => response.json())
        .then(data => {
            const countries = data[1];
            countrySelect.innerHTML = '';
            countries.forEach(country => {
                if (!country.region || country.region.id === 'NA') return;
                const option = document.createElement('option');
                option.value = country.name;
                option.textContent = country.name;
                countrySelect.appendChild(option);
            });
            // Always set India as default if present
            if (countrySelect.querySelector('option[value="India"]')) {
                countrySelect.value = "India";
            } else if (countrySelect.options.length > 0) {
                countrySelect.selectedIndex = 0;
            }
            updateChart(); // Initial chart
        })
        .catch(error => {
            console.error('Error fetching countries:', error);
        });

    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                borderColor: 'blue',
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                fill: false,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    function updateChart() {
        const indicator = indicatorSelect.value;
        const country = countrySelect.value;
        const startYear = parseInt(startYearSelect.value, 10);
        const endYear = parseInt(endYearSelect.value, 10);
        const filePath = indicatorFileMap[indicator];

        fetch(filePath)
            .then(res => res.json())
            .then(data => {
                const countryRows = data.filter(row => row["Country Name"] === country);
                if (!countryRows.length) {
                    chart.data.labels = [];
                    chart.data.datasets = [];
                    chart.update();
                    return;
                }
                const years = [];
                for (let y = startYear; y <= endYear; y++) years.push(y);

                // Only one dataset, combine all series values (sum or average)
                const combinedValues = years.map(y => {
                    const key = `${y} [YR${y}]`;
                    // Collect all numeric values for this year from all series
                    const vals = countryRows
                        .map(row => row[key])
                        .filter(val => val !== ".." && val !== undefined && val !== null)
                        .map(Number);
                    // You can sum or average; here we sum
                    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
                });

                chart.data.labels = years;
                chart.data.datasets = [{
                    label: '', // No series name
                    data: combinedValues,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: false,
                    spanGaps: true,
                    borderWidth: 2
                }];
                chart.update();
            });
    }

    indicatorSelect.addEventListener("change", updateChart);
    countrySelect.addEventListener("change", updateChart);
    startYearSelect.addEventListener("change", updateChart);
    endYearSelect.addEventListener("change", updateChart);
});
