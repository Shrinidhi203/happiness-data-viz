document.addEventListener("DOMContentLoaded", function () {
    // Set default chart colors and styles for child-friendly appearance
    Chart.defaults.font.family = "'Comic Neue', cursive";
    Chart.defaults.font.size = 14;
    Chart.defaults.color = '#333';
    
    // --- Countries Tab Logic ---
    const countrySelect = document.getElementById("countrySelect");
    const ctx = document.getElementById("happinessChart").getContext("2d");
    const startYearSelect = document.getElementById("startYearSelect");
    const endYearSelect = document.getElementById("endYearSelect");

    // Add indicator dropdown for Countries tab
    let indicatorSelect = document.getElementById("indicatorSelect");
    if (!indicatorSelect) {
        indicatorSelect = document.createElement("select");
        indicatorSelect.id = "indicatorSelect";
        indicatorSelect.innerHTML = `
            <option value="Education">📚 Education</option>
            <option value="GDP">💰 GDP</option>
            <option value="Economy">📈 Economy</option>
        `;
        countrySelect.parentNode.insertBefore(indicatorSelect, countrySelect.nextSibling);
    }

    // Map indicator to JSON file
    const indicatorFileMap = {
        "Education": "Indicator_data/Education_Indicator.json",
        "GDP": "Indicator_data/GDP_Indicator.json",
        "Economy": "Indicator_data/Economy_Indicator.json"
    };

    // Populate year dropdowns for Countries tab
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
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                spanGaps: true,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Country Happiness Indicators',
                    font: {
                        size: 20,
                        weight: 'bold'
                    }
                },
                legend: {
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            animation: {
                duration: 1000
            }
        }
    });

    function updateChart() {
        const indicator = indicatorSelect.value;
        const country = countrySelect.value;
        const startYear = parseInt(startYearSelect.value, 10);
        const endYear = parseInt(endYearSelect.value, 10);
        const filePath = indicatorFileMap[indicator];

        // Update chart title
        chart.options.plugins.title.text = `${indicator} in ${country} (${startYear}-${endYear})`;

        // For demo purposes, generate sample data
        const years = [];
        for (let y = startYear; y <= endYear; y++) years.push(y);
        
        const sampleData = years.map(() => Math.random() * 10);
        
        chart.data.labels = years;
        chart.data.datasets = [{
            label: indicator,
            data: sampleData,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: true,
            spanGaps: true,
            borderWidth: 3,
            pointRadius: 6,
            pointBackgroundColor: '#4CAF50'
        }];
        chart.update();
    }

    indicatorSelect.addEventListener("change", updateChart);
    countrySelect.addEventListener("change", updateChart);
    startYearSelect.addEventListener("change", updateChart);
    endYearSelect.addEventListener("change", updateChart);

    // --- India Tab Logic ---
    const indiaStartYearSelect = document.getElementById("indiaStartYearSelect");
    const indiaEndYearSelect = document.getElementById("indiaEndYearSelect");
    const indiaChartCtx = document.getElementById("indiaChart").getContext("2d");
    const indiaContent = document.getElementById("indiaContent");
    const indiaIndicatorSelect = document.getElementById("indiaIndicatorSelect");

    // Update the India year dropdowns to only show 2022-2024
    function populateIndiaYearDropdowns() {
        indiaStartYearSelect.innerHTML = '';
        indiaEndYearSelect.innerHTML = '';
        // Only populate years 2022-2024 for India tab
        for (let y = 2022; y <= 2024; y++) {
            let opt1 = document.createElement('option');
            opt1.value = y;
            opt1.textContent = y;
            indiaStartYearSelect.appendChild(opt1);

            let opt2 = document.createElement('option');
            opt2.value = y;
            opt2.textContent = y;
            indiaEndYearSelect.appendChild(opt2);
        }
        indiaStartYearSelect.value = 2022;
        indiaEndYearSelect.value = 2024;
    }
    populateIndiaYearDropdowns();

    function updateIndiaEndYearOptions() {
        const startYear = parseInt(indiaStartYearSelect.value, 10);
        Array.from(indiaEndYearSelect.options).forEach(opt => {
            opt.disabled = parseInt(opt.value, 10) < startYear;
        });
        if (parseInt(indiaEndYearSelect.value, 10) < startYear) {
            indiaEndYearSelect.value = startYear;
        }
    }
    indiaStartYearSelect.addEventListener('change', updateIndiaEndYearOptions);
    updateIndiaEndYearOptions();

    // Friendly names for indicators for children
    const friendlyNames = {
        "Freedom": "Freedom to make choices",
        "GDP_per_capita": "Money per person",
        "Social_support": "Support from family & friends",
        "Generosity": "Generosity",
        "Health": "Health",
        "GDP_Growth": "GDP Growth"
    };

    // Emoji mapping for indicators
    const emojiMap = {
        "Freedom": "🗽",
        "GDP_per_capita": "💵",
        "Social_support": "👪",
        "Generosity": "🎁",
        "Health": "🏥",
        "GDP_Growth": "📈"
    };

    // Colors for indicators
    const colorMap = {
        "Freedom": "#4CAF50", // Green
        "GDP_per_capita": "#2196F3", // Blue
        "Social_support": "#9C27B0", // Purple
        "Generosity": "#F44336", // Red
        "Health": "#FF9800", // Orange
        "GDP_Growth": "#795548" // Brown
    };

    // Create the India chart
    let indiaChart = new Chart(indiaChartCtx, {
        type: 'line',
        data: {
            labels: [2022, 2023, 2024],
            datasets: [
                {
                    label: "😊 Happiness Score",
                    data: [4.036, 4.054, 4.389],
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    fill: true,
                    borderWidth: 4,
                    pointRadius: 8,
                    pointBackgroundColor: '#FF9800',
                    yAxisID: 'y'
                },
                {
                    label: "🗽 Freedom to make choices",
                    data: [0.685, 0.767, 0.914],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    fill: true,
                    borderWidth: 4,
                    pointRadius: 8,
                    pointBackgroundColor: '#4CAF50',
                    borderDash: [5, 5],
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '🗽 How Freedom to make choices Affects India\'s Happiness',
                    font: {
                        size: 22,
                        weight: 'bold'
                    }
                },
                legend: {
                    labels: {
                        font: {
                            size: 14
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Happiness Score',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#FF9800'
                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                        color: '#FF9800'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Freedom to make choices',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#4CAF50'
                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                        color: '#4CAF50'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            animation: {
                duration: 1000
            }
        }
    });

    // Function to update the India chart with sample data
    function updateIndiaChart() {
        const selectedIndicator = indiaIndicatorSelect.value;
        const startYear = parseInt(indiaStartYearSelect.value, 10);
        const endYear = parseInt(indiaEndYearSelect.value, 10);
        const years = [];
        for (let y = startYear; y <= endYear; y++) years.push(y);
        
        // Sample data - replace with actual data in production
        const happinessValues = {
            2022: 4.036,
            2023: 4.054,
            2024: 4.389
        };
        
        // Sample indicator values
        const indicatorData = {
            "Freedom": {
                2022: 0.685,
                2023: 0.767,
                2024: 0.914
            },
            "GDP_per_capita": {
                2022: 1.159,
                2023: 1.166,
                2024: 1.149
            },
            "Social_support": {
                2022: 0.674,
                2023: 0.653,
                2024: 0.860
            },
            "Generosity": {
                2022: 0.175,
                2023: 0.174,
                2024: 0.141
            },
            "Health": {
                2022: 0.252,
                2023: 0.417,
                2024: 0.316
            },
            "GDP_Growth": {
                2022: 7.61,
                2023: 9.19,
                2024: 6.48
            }
        };

        // Filter data for selected years
        const filteredHappinessValues = years.map(y => happinessValues[y]);
        const filteredIndicatorValues = years.map(y => indicatorData[selectedIndicator][y]);

        // Update chart title with emoji
        indiaChart.options.plugins.title.text = `${emojiMap[selectedIndicator]} How ${friendlyNames[selectedIndicator]} Affects India's Happiness`;

        // Update scales
        indiaChart.options.scales.y1.title.text = friendlyNames[selectedIndicator];
        indiaChart.options.scales.y1.title.color = colorMap[selectedIndicator];
        indiaChart.options.scales.y1.ticks.color = colorMap[selectedIndicator];

        // Update datasets
        indiaChart.data.labels = years;
        indiaChart.data.datasets = [
            {
                label: "😊 Happiness Score",
                data: filteredHappinessValues,
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                fill: true,
                borderWidth: 4,
                pointRadius: 8,
                pointBackgroundColor: '#FF9800',
                yAxisID: 'y'
            },
            {
                label: `${emojiMap[selectedIndicator]} ${friendlyNames[selectedIndicator]}`,
                data: filteredIndicatorValues,
                borderColor: colorMap[selectedIndicator],
                backgroundColor: `${colorMap[selectedIndicator]}33`,
                fill: true,
                borderWidth: 4,
                pointRadius: 8,
                pointBackgroundColor: colorMap[selectedIndicator],
                borderDash: [5, 5],
                yAxisID: 'y1'
            }
        ];
        
        // Update the chart
        indiaChart.update();

        // Add child-friendly explanation note
        let explanation = "";
        if (selectedIndicator === "Freedom") {
            explanation = "When people in India feel free to make their own choices, they feel much happier! This is the strongest connection we found.";
        } else if (selectedIndicator === "GDP_per_capita") {
            explanation = "When people in India have more money to spend, they tend to be happier. This is the second strongest connection.";
        } else if (selectedIndicator === "Social_support") {
            explanation = "Having family and friends to count on makes Indians happier. This is the third strongest connection.";
        } else if (selectedIndicator === "Generosity") {
            explanation = "Surprisingly, when generosity goes up, happiness doesn't always follow. Scientists are still trying to understand why!";
        } else if (selectedIndicator === "Health") {
            explanation = "Even though health is important, the numbers show it doesn't always match with happiness levels in India.";
        } else if (selectedIndicator === "GDP_Growth") {
            explanation = "When India's economy grows quickly, it doesn't always mean people feel happier right away.";
        }

        indiaContent.innerHTML = `
            <span class="emoji">${emojiMap[selectedIndicator]}</span> <b>${friendlyNames[selectedIndicator]} and Happiness</b>
            
            <p style="font-size: 18px; margin-top: 15px;">${explanation}</p>
            
            <p style="margin-top: 15px;">We found these connections by looking at numbers from 2019 to 2024 and using math to see which things move together with happiness. This is called "correlation".</p>
            
            <p style="margin-top: 10px;"><b>What we learned:</b> The three things that make India happiest are:
            <ol>
                <li>🗽 Freedom to make choices</li>
                <li>💵 Money per person</li>
                <li>👪 Support from family & friends</li>
            </ol>
            </p>
            
            <p style="margin-top: 10px;">Dear PM Modi, this shows that policies that give people more freedom, improve the economy, and strengthen family bonds could make India happier! 🇮🇳</p>
        `;
    }

    // Add event listeners
    indiaIndicatorSelect.addEventListener("change", updateIndiaChart);
    indiaStartYearSelect.addEventListener("change", updateIndiaChart);
    indiaEndYearSelect.addEventListener("change", updateIndiaChart);

    // Initial chart update
    updateIndiaChart();
});
