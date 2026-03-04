document.addEventListener('DOMContentLoaded', () => {
    const freqTableBody = document.querySelector('#freq-table tbody');
    const btnRefresh = document.getElementById('btn-refresh');

    async function loadFrequences() {
        freqTableBody.innerHTML = '';
        document.getElementById('ticket').innerHTML = '';
        const resp = await fetch('/frecuencias');
        if (!resp.ok) {
            freqTableBody.innerHTML = '<tr><td colspan="3">Error cargando datos</td></tr>';
            return;
        }
        const data = await resp.json();
        const freqs = data.frecuencias;
        freqs.forEach(f => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${f.number}</td><td>${f.percentage.toFixed(2)}%</td><td>${f.count}</td>`;
            if (f.percentage >= 30) {
                tr.classList.add('high');
            } else if (f.percentage >= 15) {
                tr.classList.add('medium');
            } else {
                tr.classList.add('low');
            }
            freqTableBody.appendChild(tr);
        });
        data.top6.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cell';
            div.textContent = item.number;
            document.getElementById('ticket').appendChild(div);
        });
    }

    loadFrequences();
    setInterval(loadFrequences, 20000);
    
    btnRefresh.addEventListener('click', () => {
        loadFrequences();
    });
});