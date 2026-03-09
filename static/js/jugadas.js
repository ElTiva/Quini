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
                    div.className = `input-cell ${item.color}`;
                    div.textContent = item.numero;
                    tdJugada.appendChild(div);
                });
                tr.appendChild(tdFecha);
                tr.appendChild(tdJugada);
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('Error loading jugadas:', err));

    // Add click listeners to input cells for color toggle
    const inputs = document.querySelectorAll('.input-cell');
    inputs.forEach(input => {
        input.addEventListener('click', () => {
            if (input.value === '') return; // only if has number
            // cycle based on existing classes; more reliable than dataset
            if (input.classList.contains('red')) {
                // red -> green
                input.classList.remove('red');
                input.classList.add('green');
            } else if (input.classList.contains('green')) {
                // green -> white
                input.classList.remove('green');
                // no class added for white
            } else {
                // white -> red
                input.classList.add('red');
            }
        });
    });

    // Guardar button
    document.getElementById('btn-guardar').addEventListener('click', () => {
        const fecha = document.getElementById('fecha').value;
        if (!fecha) {
            alert('Selecciona una fecha');
            return;
        }
        const jugada = [];
        for (let i = 1; i <= 6; i++) {
            const input = document.getElementById(`num${i}`);
            const num = parseInt(input.value);
            if (isNaN(num) || num < 0 || num > 45) {
                alert('Números deben estar entre 0 y 45');
                return;
            }
            let color = 'white';
            if (input.classList.contains('red')) color = 'red';
            else if (input.classList.contains('green')) color = 'green';
            jugada.push({ numero: num, color: color });
        }
        fetch('/guardar_jugada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha: fecha, jugada: jugada })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Jugada guardada');
                // Clear inputs
                document.getElementById('fecha').value = '';
                for (let i = 1; i <= 6; i++) {
                    const input = document.getElementById(`num${i}`);
                    input.value = '';
                    input.classList.remove('red', 'green');
                }
                // Reload table
                location.reload();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => {
            alert('Error al guardar');
            console.error(err);
        });
    });
});