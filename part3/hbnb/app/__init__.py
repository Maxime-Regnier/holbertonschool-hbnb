from flask import Flask, render_template
from flask_restx import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from config import DevelopmentConfig
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns

bcrypt = Bcrypt()
jwt = JWTManager()


def register_front_routes(app):
    @app.route('/')
    @app.route('/index.html')
    def index_page():
        return render_template('index.html')

    @app.route('/login.html')
    def login_page():
        return render_template('login.html')

    @app.route('/place.html')
    def place_page():
        return render_template('place.html')

    @app.route('/add_review.html')
    def add_review_page():
        return render_template('add_review.html')


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__, template_folder='templates', static_folder='static')

    app.config.from_object(config_class)

    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response

    bcrypt.init_app(app)
    jwt.init_app(app)
    register_front_routes(app)

    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/api/v1/')

    # Register the namespaces
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')

    return app
