document.addEventListener('DOMContentLoaded', function() {
    // Registrar el plugin de datalabels
    Chart.register(ChartDataLabels);

    const form = document.getElementById('chartForm');
    const chartSection = document.getElementById('chartSection');
    const backButton = document.getElementById('backButton');
    const dataInputs = document.getElementById('dataInputs');
    const periodType = document.getElementById('periodType');
    const addMonthBtn = document.getElementById('addMonthBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const downloadBtnContainer = document.getElementById('downloadBtnContainer');
    let myChart = null;

    const yearlyData = {
        labels: ['2021', '2022', '2023', '2024'],
        placeholder: 'Ingrese valor para el año'
    };

    // Configuración inicial
    periodType.addEventListener('change', handlePeriodChange);
    clearDataBtn.addEventListener('click', clearInputs);
    addMonthBtn.addEventListener('click', () => addCustomInput());
    form.addEventListener('submit', handleFormSubmit);
    backButton.addEventListener('click', resetForm);

    // Crear inputs iniciales si es necesario
    if (periodType.value === 'yearly') {
        createYearlyInputs();
        clearDataBtn.classList.remove('hidden');
    }

    function handlePeriodChange() {
        const selectedPeriod = this.value;
        dataInputs.innerHTML = '';
        addMonthBtn.classList.add('hidden');
        clearDataBtn.classList.add('hidden');
        
        if (selectedPeriod === 'yearly') {
            clearDataBtn.classList.remove('hidden');
            createYearlyInputs();
        } else if (selectedPeriod === 'custom') {
            addMonthBtn.classList.remove('hidden');
            addCustomInput(true);
        }
    }

    function clearInputs() {
        document.querySelectorAll('#dataInputs input[type="number"]').forEach(input => {
            input.value = '';
        });
    }

    function createYearlyInputs() {
        yearlyData.labels.forEach((year, index) => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'data-input';
            
            const label = document.createElement('label');
            label.textContent = year;
            label.htmlFor = `data-${index}`;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `data-${index}`;
            input.placeholder = yearlyData.placeholder;
            input.required = true;
            input.step = 'any';
            
            inputGroup.appendChild(label);
            inputGroup.appendChild(input);
            dataInputs.appendChild(inputGroup);
        });
    }

    function addCustomInput(initial = false) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'data-input';
        
        const monthInput = document.createElement('input');
        monthInput.type = 'text';
        monthInput.placeholder = 'Nombre del supervisor';
        monthInput.required = initial;
        
        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.placeholder = 'Valor';
        valueInput.required = initial;
        valueInput.step = 'any';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Eliminar';
        removeBtn.onclick = () => inputGroup.remove();
        
        inputGroup.appendChild(monthInput);
        inputGroup.appendChild(valueInput);
        
        if (!initial) {
            inputGroup.appendChild(removeBtn);
        }
        
        dataInputs.appendChild(inputGroup);
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const chartType = document.getElementById('chartType').value;
        const period = periodType.value;
        const title = document.getElementById('graphTitle').value;
        
        if (!chartType || !period || !title) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        const { labels, dataValues } = collectFormData(period);
        
        if (labels.length === 0) {
            alert('Por favor ingresa datos válidos');
            return;
        }

        renderChart(chartType, {
            labels: labels,
            datasets: [{
                label: '',
                data: dataValues,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        }, title);
        
        form.classList.add('hidden');
        chartSection.classList.remove('hidden');
        createDownloadButtons(); // Crear botones de descarga
    }

    function collectFormData(period) {
        const labels = [];
        const dataValues = [];
        
        if (period === 'yearly') {
            yearlyData.labels.forEach((_, index) => {
                const value = parseFloat(document.getElementById(`data-${index}`).value);
                labels.push(yearlyData.labels[index]);
                dataValues.push(isNaN(value) ? 0 : value);
            });
        } else {
            document.querySelectorAll('.data-input').forEach(group => {
                const inputs = group.querySelectorAll('input');
                const periodName = inputs[0].value;
                const periodValue = parseFloat(inputs[1].value);
                
                if (periodName && !isNaN(periodValue)) {
                    labels.push(periodName);
                    dataValues.push(periodValue);
                }
            });
        }
        
        return { labels, dataValues };
    }

    function resetForm() {
        chartSection.classList.add('hidden');
        form.classList.remove('hidden');
        downloadBtnContainer.innerHTML = ''; // Limpiar botones de descarga
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }
    }

    function renderChart(type, data, title) {
        const ctx = document.getElementById('myChart').getContext('2d');
        
        if (myChart) {
            myChart.destroy();
        }
        
        myChart = new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                            return context.parsed.y + '%';
                            }                   
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#444',
                        font: {
                            weight: 'bold',
                            size: 12
                        },
                        formatter: function(value) {
                        return value + '%';
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true
                        },
                        ticks: {
                        callback: function(value) {
                        return value + '%';
                        }
                    }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        barThickness: 12,
                        maxBarThickness: 15,
                        categoryPercentage: 0.4,
                        barPercentage: 0.6
                    }
                },
                layout: {
                    padding: {
                        top: 20,
                        right: 15,
                        bottom: 15,
                        left: 15
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    function createDownloadButtons() {
        downloadBtnContainer.innerHTML = ''; // Limpiar contenedor
        
        const formats = [
            { name: 'PNG', format: 'png' },
            { name: 'JPG', format: 'jpg' },
        ];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.className = 'download-btn';
            btn.textContent = `Descargar ${format.name}`;
            btn.onclick = () => downloadChart(format.format);
            downloadBtnContainer.appendChild(btn);
        });
    }

    function downloadChart(format) {
        if (!myChart) return;
        
        const canvas = document.getElementById('myChart');
        const title = document.getElementById('graphTitle').value || 'grafico';
        const fileName = `${title}.${format}`;
        
        // Crear enlace de descarga temporal
        const link = document.createElement('a');
        
        if (format === 'pdf') {
            // Para PDF necesitamos una librería adicional como jsPDF
            alert('Para exportar a PDF necesitas incluir la librería jsPDF');
            return;
        } else {
            link.href = canvas.toDataURL(`image/${format}`);
            link.download = fileName;
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});