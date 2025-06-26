
document.addEventListener("DOMContentLoaded", function () {
    const countrySelect = document.getElementById("countrySelect");
    const ctx = document.getElementById("happinessChart").getContext("2d");

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
