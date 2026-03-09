document.addEventListener('DOMContentLoaded', () => {
    // Load existing jugadas
    fetch('/obtener_jugadas')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#jugadas-table tbody');
            tbody.innerHTML = '';
            data.forEach(j => {
                const tr = document.createElement('tr');
                const tdFecha = document.createElement('td');
                tdFecha.textContent = new Date(j.fecha).toLocaleDateString('es-ES'); // DD/MM/YYYY
                const tdJugada = document.createElement('td');
                tdJugada.style.display = 'flex';
                tdJugada.style.justifyContent = 'center';
                tdJugada.style.gap = '5px';
                j.jugada.forEach(item => {
                    const div = document.createElement('div');
                    div.className = `saved-cell ${item.color}`;
                    div.textContent = item.numero;
                    tdJugada.appendChild(div);
                });
                const tdAciertos = document.createElement('td');
                tdAciertos.textContent = j.aciertos;
                const tdPremio = document.createElement('td');
                tdPremio.textContent = j.premio;
                if (j.premio === "Premio :)") {
                    tdPremio.style.backgroundColor = "#c8e6c9"; // green
                }
                tr.appendChild(tdFecha);
                tr.appendChild(tdJugada);
                tr.appendChild(tdAciertos);
                tr.appendChild(tdPremio);
            });
        })
        .catch(err => console.error('Error loading jugadas:', err));

    // Add click listeners to input cells for color toggle
    const inputs = document.querySelectorAll('.input-cell');
    inputs.forEach(input => {
        // reset counter when value changes
        input.addEventListener('input', () => {
            input.dataset.clicks = 0;
            input.classList.remove('red', 'green');
        });
        input.addEventListener('click', () => {
            if (input.value === '') return; // only if has number
            let clicks = parseInt(input.dataset.clicks || '0', 10) + 1;
            clicks = clicks % 3; // 0 white,1 red,2 green
            input.dataset.clicks = clicks;
            input.classList.remove('red', 'green');
            if (clicks === 1) input.classList.add('red');
            else if (clicks === 2) input.classList.add('green');
        });
    });

    // Guardar button
    const messageEl = document.getElementById('message');
    document.getElementById('btn-guardar').addEventListener('click', () => {
        messageEl.textContent = '';
        const fecha = document.getElementById('fecha').value;
        if (!fecha) {
            messageEl.textContent = 'Selecciona una fecha';
            return;
        }
        const jugada = [];
        for (let i = 1; i <= 6; i++) {
            const input = document.getElementById(`num${i}`);
            const num = parseInt(input.value);
            if (isNaN(num) || num < 0 || num > 45) {
                messageEl.textContent = 'Números deben estar entre 0 y 45';
                return;
            }
            let color = 'white';
            if (input.classList.contains('red')) color = 'red';
            else if (input.classList.contains('green')) color = 'green';
            jugada.push({ numero: num, color: color });
        }
        const aciertosInput = document.getElementById('aciertos');
        const aciertos = parseInt(aciertosInput.value);
        if (isNaN(aciertos) || aciertos < 0 || aciertos > 6) {
            messageEl.textContent = 'Aciertos debe ser entre 0 y 6';
            return;
        }
        fetch('/guardar_jugada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha: fecha, jugada: jugada, aciertos: aciertos })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                messageEl.textContent = 'Jugada guardada';
                messageEl.className = 'success';
                // Clear inputs
                document.getElementById('fecha').value = '';
                for (let i = 1; i <= 6; i++) {
                    const input = document.getElementById(`num${i}`);
                    input.value = '';
                    input.classList.remove('red', 'green');
                    input.dataset.clicks = 0;
                }
                document.getElementById('aciertos').value = '';
                // Reload page to show updated table
                location.reload();
            } else {
                messageEl.textContent = data.error || 'Error';
                messageEl.className = 'error';
            }
        })
        .catch(err => {
            messageEl.textContent = 'Error al guardar';
            messageEl.className = 'error';
            console.error(err);
        });
    });
});