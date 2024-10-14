let pulseChart;
let zonePieChart;
let timeStamps = [];
let pulseValues = [];
let pulseZones = [0, 0, 0, 0, 0, 0];
let timeSpentInZones = [0, 0, 0, 0, 0, 0];
let totalTime = 0;

document.getElementById("ageForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const surname = document.getElementById("userSurname").value.trim();
    const age = parseInt(document.getElementById("userAge").value, 10);

    if (!name || !surname || isNaN(age) || age <= 0) {
        alert("Please enter valid details.");
        return;
    }

    const maxPulse = calculateMaxPulse(age);

    document.getElementById("ageInputContainer").style.display = "none";
    document.getElementById("content").style.display = "flex";
    document.getElementById("zoneContainer").style.display = "block";
    document.getElementById("chartContainer").style.display = "block";
    document.getElementById("pieChartContainer").style.display = "block";

    document.getElementById("patientName").textContent = `Patient's name: ${name} ${surname}`;

    const ctx = document.getElementById('pulseChart').getContext('2d');
    pulseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeStamps,
            datasets: [{
                label: 'Pulse Over Time',
                data: pulseValues,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#fff'
                    }
                },
                tooltip: {
                    backgroundColor: '#333',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second'
                    },
                    title: {
                        display: true,
                        text: 'Time',
                        color: '#fff',
                        font: {
                            size: 18
                        }
                    },
                    grid: {
                        color: '#444'
                    },
                    ticks: {
                        color: '#fff'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pulse (BPM)',
                        color: '#fff',
                        font: {
                            size: 18
                        }
                    },
                    grid: {
                        color: '#444'
                    },
                    ticks: {
                        color: '#fff'
                    }
                }
            }
        }
    });

    const pieCtx = document.getElementById('zonePieChart').getContext('2d');
    zonePieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Relaxed', 'Light', 'Intensive', 'Aerobic', 'Anaerobic', 'VO2 MAX'],
            datasets: [{
                label: 'Time Spent in Each Zone',
                data: pulseZones,
                backgroundColor: [
                    '#add8e6',
                    '#4caf50',
                    '#2196f3',
                    '#ffeb3b',
                    '#ff9800',
                    '#f44336'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#fff'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const zoneLabels = ['Relaxed', 'Light', 'Intensive', 'Aerobic', 'Anaerobic', 'VO2 MAX'];
                            const zoneRanges = [
                                `0 - ${Math.round(0.7 * maxPulse)} BPM`,
                                `${Math.round(0.7 * maxPulse) + 1} - ${Math.round(0.8 * maxPulse)} BPM`,
                                `${Math.round(0.8 * maxPulse) + 1} - ${Math.round(0.85 * maxPulse)} BPM`,
                                `${Math.round(0.85 * maxPulse) + 1} - ${Math.round(0.9 * maxPulse)} BPM`,
                                `${Math.round(0.9 * maxPulse) + 1} - ${maxPulse} BPM`,
                                `Above ${maxPulse} BPM`
                            ];
                            return `${zoneLabels[index]} (${zoneRanges[index]}): Time Spent: ${pulseZones[index]} seconds`;
                        }
                    },
                    backgroundColor: '#333',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            }
        }
    });

    setInterval(() => fetchPulseData(maxPulse), 5000);
    fetchPulseData(maxPulse);
});

function calculateMaxPulse(age) {
    return 220 - age;
}

function fetchPulseData(maxPulse) {
    fetch('/Home/GetPulseData')
        .then(response => response.json())
        .then(data => {
            console.log("Received pulse data: ", data);

            const bpm = parseInt(data.bpm, 10);

            document.getElementById("currentPulse").textContent = `Pulse: ${bpm} BPM`;

            if (!isNaN(bpm)) {
                pulseValues.push(bpm);
                timeStamps.push(new Date());

                pulseChart.data.labels = timeStamps;
                pulseChart.data.datasets[0].data = pulseValues;
                pulseChart.update();

                const max = Math.max(...pulseValues);
                const min = Math.min(...pulseValues);
                const avg = Math.round(pulseValues.reduce((sum, val) => sum + val, 0) / pulseValues.length);

                document.getElementById("maxPulse").textContent = ` ${max}`;
                document.getElementById("minPulse").textContent = ` ${min}`;
                document.getElementById("avgPulse").textContent = ` ${avg}`;
            }

            const zone1Max = Math.round(0.7 * maxPulse);
            const zone2Max = Math.round(0.8 * maxPulse);
            const zone3Max = Math.round(0.85 * maxPulse);
            const zone4Max = Math.round(0.9 * maxPulse);
            const zone5Max = maxPulse;

            let zoneIndex = -1;
            let zoneDescription = '';
            let zoneColor = '';

            if (bpm < 60) {
                document.getElementById("warningMessage").style.display = "block";
                document.getElementById("content").style.display = "none";
                document.getElementById("zoneContainer").style.display = "none";
                document.getElementById("chartContainer").style.display = "none";
                document.getElementById("pieChartContainer").style.display = "none";

                document.getElementById("zoneIndicator").textContent = "Warning: Low heart rate (below 60 BPM)";
                document.getElementById("zoneIndicator").style.color = "#f44336";
                return;
            } else {
                document.getElementById("warningMessage").style.display = "none";
                document.getElementById("content").style.display = "flex";
                document.getElementById("zoneContainer").style.display = "block";
                document.getElementById("chartContainer").style.display = "block";
                document.getElementById("pieChartContainer").style.display = "block";
            }

            if (bpm <= zone1Max) {
                zoneIndex = 0;
                zoneDescription = `Relaxed (60 - ${zone1Max} BPM)`;
                zoneColor = '#add8e6';
            } else if (bpm <= zone2Max) {
                zoneIndex = 1;
                zoneDescription = `Light (${zone1Max + 1} - ${zone2Max} BPM)`;
                zoneColor = '#4caf50';
            } else if (bpm <= zone3Max) {
                zoneIndex = 2;
                zoneDescription = `Intensive (${zone2Max + 1} - ${zone3Max} BPM)`;
                zoneColor = '#2196f3';
            } else if (bpm <= zone4Max) {
                zoneIndex = 3;
                zoneDescription = `Aerobic (${zone3Max + 1} - ${zone4Max} BPM)`;
                zoneColor = '#ffeb3b';
            } else if (bpm <= zone5Max) {
                zoneIndex = 4;
                zoneDescription = `Anaerobic (${zone4Max + 1} - ${zone5Max} BPM)`;
                zoneColor = '#ff9800';
            } else {
                zoneIndex = 5;
                zoneDescription = `VO2 MAX (Above ${zone5Max} BPM)`;
                zoneColor = '#f44336';
            }

            if (zoneIndex !== -1) {
                pulseZones[zoneIndex]++;
                totalTime++;
                updatePieChart();

                document.getElementById("zoneIndicator").textContent = zoneDescription;
                document.getElementById("zoneIndicator").style.color = zoneColor;
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function updatePieChart() {
    if (zonePieChart) {
        zonePieChart.data.datasets[0].data = pulseZones;
        zonePieChart.update();
    }
}
