document.addEventListener('DOMContentLoaded', () => {
    const mainView = document.getElementById('main-view');
    const cargarView = document.getElementById('cargar-view');
    const frecuenciasView = document.getElementById('frecuencias-view');

    const btnCargar = document.getElementById('btn-cargar');
    const btnPepe = document.getElementById('btn-pepe');
    const btnSalir = document.getElementById('btn-salir');
    const btnBack = document.getElementById('btn-back');

    const inputForm = document.getElementById('input-form');
    const message = document.getElementById('message');

    const freqTableBody = document.querySelector('#freq-table tbody');
    const top3List = document.querySelector('#top3 ul');

    function showView(view) {
        [mainView, cargarView, frecuenciasView].forEach(v => v.classList.add('hidden'));
        view.classList.remove('hidden');
        message.textContent = '';
    }

    btnCargar.addEventListener('click', () => showView(cargarView));
    btnPepe.addEventListener('click', async () => {
        showView(frecuenciasView);
        await loadFrequences();
    });
    btnSalir.addEventListener('click', () => showView(mainView));
    btnBack.addEventListener('click', () => showView(mainView));

    inputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nums = [
            document.getElementById('num1').value,
            document.getElementById('num2').value,
            document.getElementById('num3').value,
            document.getElementById('num4').value,
            document.getElementById('num5').value,
            document.getElementById('num6').value,
        ];
        // client validation
        if (nums.some(n => n === '' || isNaN(n))) {
            message.textContent = 'Complete los seis números';
            message.className = 'error';
            return;
        }
        const ints = nums.map(n => parseInt(n, 10));
        if (ints.some(n => n < 0 || n > 45)) {
            message.textContent = 'Los números deben estar entre 0 y 45';
            message.className = 'error';
            return;
        }
        const unique = new Set(ints);
        if (unique.size !== ints.length) {
            message.textContent = 'Los números no pueden repetirse';
            message.className = 'error';
            return;
        }
        const resp = await fetch('/ingresar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({numbers: nums}),
        });
        const data = await resp.json();
        if (resp.ok && data.success) {
            message.textContent = 'Secuencia ingresada correctamente';
            message.className = 'success';
            inputForm.reset();
        } else {
            message.textContent = data.error || 'Error';
            message.className = 'error';
        }
    });

    async function loadFrequences() {
        freqTableBody.innerHTML = '';
        top3List.innerHTML = '';
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
            // color coding
            if (f.percentage >= 30) {
                tr.classList.add('high');
            } else if (f.percentage >= 15) {
                tr.classList.add('medium');
            } else {
                tr.classList.add('low');
            }
            freqTableBody.appendChild(tr);
        });
        // top6 numbers
        data.top6.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cell';
            div.textContent = item.number;
            document.getElementById('ticket').appendChild(div);
        });
    }
});