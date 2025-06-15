import os
from datetime import date
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET', 'dawseohdffesfsef32132h3b1231')



@app.route('/')
def home():
    return render_template('index.html')

@app.route('/contacts')
def contacts():
    return render_template('contacts.html')

@app.route('/team')
def team():
    return render_template('team.html')

@app.route('/team/cofedish')
def cofedish():
    return render_template('cofedish.html')

@app.route('/api/memes/cofedish')
def api_memes_cofedish():
    memes_dir = os.path.join(app.static_folder, 'videos', 'memes', 'cofedish')
    try:
        files = [
            f for f in os.listdir(memes_dir)
            if f.lower().endswith(('.mp4', '.webm', '.ogg'))
        ]
    except FileNotFoundError:
        files = []
    return jsonify(files)

@app.route('/api/memes/beetwin')
def api_memes_beetwin():
    dir_ = os.path.join(app.static_folder, 'videos', 'memes', 'beetwin')
    try:
        files = [f for f in os.listdir(dir_)
                 if f.lower().endswith(('.mp4','.webm','.ogg'))]
    except:
        files = []
    return jsonify(files)


@app.route('/team/beetwin', methods=['GET','POST'])
def beetwin():
    # проверка сессии
    if not session.get('authenticated'):
        # если форма отправлена
        if request.method == 'POST':
            print(os.getenv('OLESYA_PASS'))
            pwd = request.form.get('password','')
            # пароль можно тоже взять из ENV
            if pwd == os.getenv('OLESYA_PASS'):
                session['authenticated'] = True
                return redirect(url_for('beetwin'))
            else:
                flash('Неверный пароль, попробуйте ещё раз.')
        return render_template('olesya_login.html')

    # если вошла — показываем поздравление
    return render_template('beetwin_special.html')

@app.route('/team/bekkel')
def bekkel():
    return render_template('bekkel.html')

@app.route('/api/memes/le_potato')
def api_memes_le_potato():
    dir_ = os.path.join(app.static_folder, 'videos', 'memes', 'le_potato')
    try:
        files = [f for f in os.listdir(dir_)
                 if f.lower().endswith(('.mp4','.webm','.ogg'))]
    except:
        files = []
    return jsonify(files)

@app.route('/team/le_potato')
def le_potato():
    return render_template('le_potato.html')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=25577)
