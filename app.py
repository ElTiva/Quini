from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import json

app = Flask(__name__)
# choose database based on environment variable (Postgres in production, SQLite local)
db_url = os.environ.get('DATABASE_URL')
if db_url:
    # SQLAlchemy expects postgres:// or postgresql://
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quini.db'
db = SQLAlchemy(app)

MAX_SEQS = 20
EXPECTED_LENGTH = 6

# Database model for sequences
class Sequence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numbers = db.Column(db.String(200), nullable=False)  # comma-separated numbers
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_numbers(self):
        return [int(n) for n in self.numbers.split(',')]

# Database model for jugadas
class Jugada(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    jugada = db.Column(db.Text, nullable=False)  # JSON with {'numeros': [...], 'aciertos': int}

# Create tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cargar')
def cargar_page():
    return render_template('cargar.html')

@app.route('/probabilidad')
def probabilidad_page():
    return render_template('probabilidad.html')

@app.route('/jugadas')
def jugadas_page():
    return render_template('jugadas.html')

@app.route('/frecuencias', methods=['GET'])
def frecuencias():
    # Get all sequences and count frequencies
    all_sequences = Sequence.query.all()
    counts = {i: 0 for i in range(0, 46)}
    total = 0
    
    for seq in all_sequences:
        for n in seq.get_numbers():
            counts[n] += 1
            total += 1
    
    freqs = []
    for i in range(0, 46):
        pct = (counts[i] / total * 100) if total > 0 else 0
        freqs.append({'number': i, 'percentage': pct, 'count': counts[i]})
    
    # compute top 6 numbers by percentage
    sorted_nums = sorted(freqs, key=lambda x: x['percentage'], reverse=True)
    top6 = sorted_nums[:6]
    return jsonify({'frecuencias': freqs, 'top6': top6})

@app.route('/ingresar', methods=['POST'])
def ingresar():
    data = request.get_json()
    if not data or 'numbers' not in data:
        return jsonify({'success': False, 'error': 'Falta payload'}), 400

    nums = data['numbers']
    # Basic validation
    if not isinstance(nums, list):
        return jsonify({'success': False, 'error': 'Los datos deben ser una lista'}), 400
    if len(nums) != EXPECTED_LENGTH:
        return jsonify({'success': False, 'error': f'Deben enviarse exactamente {EXPECTED_LENGTH} números'}), 400
    seen = set()
    for n in nums:
        try:
            i = int(n)
        except Exception:
            return jsonify({'success': False, 'error': 'Todos los valores deben ser enteros'}), 400
        if not (0 <= i <= 45):
            return jsonify({'success': False, 'error': 'Los números deben estar entre 0 y 45'}), 400
        if i in seen:
            return jsonify({'success': False, 'error': 'Los números no pueden repetirse'}), 400
        seen.add(i)
    
    # Save to database
    nums_str = ','.join(str(int(n)) for n in nums)
    new_seq = Sequence(numbers=nums_str)
    db.session.add(new_seq)
    db.session.commit()
    
    # Keep only last MAX_SEQS sequences
    all_sequences = Sequence.query.order_by(Sequence.created_at).all()
    if len(all_sequences) > MAX_SEQS:
        # Delete oldest sequence
        oldest = all_sequences[0]
        db.session.delete(oldest)
        db.session.commit()
    
    return jsonify({'success': True}), 200

@app.route('/guardar_jugada', methods=['POST'])
def guardar_jugada():
    try:
        data = request.get_json()
        if not data or 'fecha' not in data or 'jugada' not in data or 'aciertos' not in data:
            return jsonify({'success': False, 'error': 'Falta payload'}), 400
        
        fecha_str = data['fecha']
        jugada = data['jugada']
        aciertos = data['aciertos']
        
        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'error': 'Fecha inválida'}), 400
        
        if not isinstance(jugada, list) or len(jugada) != 6:
            return jsonify({'success': False, 'error': 'Jugada debe ser lista de 6 elementos'}), 400
        
        for item in jugada:
            if not isinstance(item, dict) or 'numero' not in item or 'color' not in item:
                return jsonify({'success': False, 'error': 'Formato de jugada inválido'}), 400
            if not (0 <= item['numero'] <= 45):
                return jsonify({'success': False, 'error': 'Números deben estar entre 0 y 45'}), 400
            if item['color'] not in ['white', 'red', 'green']:
                return jsonify({'success': False, 'error': 'Color inválido'}), 400
        
        if not isinstance(aciertos, int) or not (0 <= aciertos <= 6):
            return jsonify({'success': False, 'error': 'Aciertos debe ser entero entre 0 y 6'}), 400
        
        jugada_json = json.dumps({'numeros': jugada, 'aciertos': aciertos})
        nueva_jugada = Jugada(fecha=fecha, jugada=jugada_json)
        db.session.add(nueva_jugada)
        db.session.commit()
        
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/obtener_jugadas', methods=['GET'])
def obtener_jugadas():
    jugadas = Jugada.query.order_by(Jugada.fecha.desc()).all()
    result = []
    for j in jugadas:
        data = json.loads(j.jugada)
        jugada_data = data['numeros']
        aciertos = data['aciertos']
        premio = "Premio" if aciertos in [4, 5, 6] else "Sin Premio"
        result.append({
            'fecha': j.fecha.isoformat(),
            'jugada': jugada_data,
            'aciertos': aciertos,
            'premio': premio
        })
    return jsonify(result)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
