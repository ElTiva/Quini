document.addEventListener('DOMContentLoaded', () => {
    const inputForm = document.getElementById('input-form');
    const message = document.getElementById('message');

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
});