import os
import random
from flask import Flask, render_template, request, redirect, url_for, session, flash, abort, jsonify
from functools import lru_cache
from mcstatus import JavaServer

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET')

# Данные профилей
PROFILES = {
    'cofedish': {
        'name': 'Cofedish',
        'avatar': 'avatar-cofedish.png',
        'photos': [
            'photo1.png', 'photo2.png', 'photo3.png',
            'photo4.png', 'photo5.png', 'photo6.png'
        ],
        'friends': [
            {'username': 'beetwin', 'avatar': 'avatar-beetwin.png'},
            {'username': 'bekkel', 'avatar': 'avatar-bekkel.png'},
            {'username': 'le_potato', 'avatar': 'avatar-le_potato.png'}
        ],
        'subs': [
            'HuyOps', 'CICI/DIDI',
            'Bekkel', 'Idi Nahuy', 'Karpacho'
        ]
    },
    'beetwin': {
        'name': 'Beetwin',
        'avatar': 'avatar-beetwin.png',
        'photos': [
            'photo1.png', 'photo2.png', 'photo3.png',
            'photo4.png', 'photo5.png', 'photo6.png'
        ],
        'friends': [
            {'username': 'cofedish', 'avatar': 'avatar-cofedish.png'},
            {'username': 'bekkel', 'avatar': 'avatar-bekkel.png'},
            {'username': 'le_potato', 'avatar': 'avatar-le_potato.png'}
        ],
        'subs': [
            'Zavodiki', 'AE2pizdec',
            '300k v ns', 'pizdec vkusnoye', 'Karpacho'
        ]
    },
    'bekkel': {
        'name': 'Bekkel',
        'avatar': 'avatar-bekkel.png',
        'photos': [
            'photo1.png', 'photo2.png', 'photo3.png',
            'photo4.png', 'photo5.png', 'photo6.png'
        ],
        'friends': [
            {'username': 'cofedish', 'avatar': 'avatar-cofedish.png'},
            {'username': 'beetwin', 'avatar': 'avatar-beetwin.png'},
            {'username': 'le_potato', 'avatar': 'avatar-le_potato.png'}
        ],
        'subs': [
            'YaEblan', 'Провоцирую', 'KaktusEnjoyers',
            '#АлисаСтой', 'Helicopter', 'Baracopter'
        ]
    },
    'le_potato': {
        'name': 'Le Potato',
        'avatar': 'avatar-le_potato.png',
        'photos': [
            'photo1.png', 'photo2.png', 'photo3.png',
            'photo4.png', 'photo5.png', 'photo6.png'
        ],
        'friends': [
            {'username': 'cofedish', 'avatar': 'avatar-cofedish.png'},
            {'username': 'bekkel', 'avatar': 'avatar-bekkel.png'},
            {'username': 'beetwin', 'avatar': 'avatar-beetwin.png'}
        ],
        'subs': [
            'Елда-Чекалда', '3Д брухтер',
            'Ебать ЧПУ', 'Зачем?', 'Надо'
        ]
    }
}

@app.route("/api/status")
def status():
    try:
        server = JavaServer.lookup("cofemine.online")
        status = server.status()
        return jsonify({
            "online": True,
            "players": status.players.online,
            "max": status.players.max,
            "version": status.version.name
        })
    except Exception as e:
        return jsonify({
            "online": False,
            "error": str(e)
        })


@lru_cache()
def get_memes_for_user(username):
    memes_dir = os.path.join(app.static_folder, 'videos', 'memes', username)
    try:
        return [
            f for f in os.listdir(memes_dir)
            if f.lower().endswith(('.mp4', '.webm', '.ogg'))
        ]
    except FileNotFoundError:
        return []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/contacts')
def contacts():
    return render_template('contacts.html')

@app.route('/team')
def team():
    return render_template('team.html')

'''@app.route('/team/beetwin', methods=['GET','POST'])
def beetwin():
    if not session.get('authenticated'):
        if request.method == 'POST':
            pwd = request.form.get('password','')
            if pwd == os.getenv('OLESYA_PASS'):
                session['authenticated'] = True
                return redirect(url_for('beetwin'))
            else:
                flash('Неверный пароль, попробуйте ещё раз.')
        return render_template('olesya_login.html')
    else:
        return render_template('beetwin_special.html', minekey = os.getenv("MINEKEY", "HUY TEBE"))
'''

@app.route('/team/<username>')
def profile(username):
    # Если пользователя нет в PROFILES — 404
    if username not in PROFILES:
        abort(404)
    data = PROFILES[username]

    image_posts = random.sample(data['photos'], 2)

    vids = get_memes_for_user(username)
    video_file = random.choice(vids) if vids else None

    # 3) Собираем список posts
    posts = []
    for img in image_posts:
        posts.append({
            'type': 'image',
            'src': url_for('static', filename=f'assets/{username}/posts/{img}')
        })
    if video_file:
        posts.append({
            'type': 'video',
            'src': url_for('static', filename=f'videos/memes/{username}/{video_file}')
        })

    # 4) Перемешиваем порядок
    random.shuffle(posts)

    # Рендерим шаблон username_v2.html
    return render_template(
        f'{username}_v2.html',
        username=data['name'],
        profile_data=data,
        posts=posts
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=25577)
