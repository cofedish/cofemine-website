import os
from datetime import date
from flask import Flask, render_template, jsonify

app = Flask(__name__)

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


@app.route('/team/beetwin')
def beetwin():
    today        = date.today()
    special_date = date(today.year, 6, 23)  # ваша «особая дата»
    if today == special_date:
        # рендерим совсем другой файл
        return render_template('beetwin_special.html')
    else:
        # обычный
        return render_template('beetwin.html')

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
