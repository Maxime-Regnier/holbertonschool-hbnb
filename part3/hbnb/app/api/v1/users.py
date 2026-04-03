from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask import request

api = Namespace('users', description='User operations')


# Pour créer un utilisateur (POST)
user_model = api.model('User', {
    'first_name': fields.String(required=True,
                                description='First name of the user'),
    'last_name': fields.String(required=True,
                               description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True,
                              description='Password of the user')
})

# Pour mettre à jour un utilisateur (PUT)
user_update_model = api.model('UserUpdate', {
    'first_name': fields.String(description='First name of the user'),
    'last_name': fields.String(description='Last name of the user')
})


@api.route('/')
class UserList(Resource):
    @jwt_required()
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new user (admin only)"""

        current_user = get_jwt()
        if not current_user.get('is_admin'):
            return {'error': 'Admin privileges required'}, 403

        user_data = api.payload
        email = user_data.get('email')

        if facade.get_user_by_email(email):
            return {'error': 'Email already registered'}, 400
        try:
            user = facade.create_user(user_data)
            return {
                "id": user.id,
                "message": "User successfully created"
            }, 201
        except ValueError as e:
            return {"error": str(e)}, 400

    @api.response(200, 'List users retrieved successfully')
    def get(self):
        """Retrieve a list of all users"""
        users = facade.get_all_users()
        return [{
            'id': a.id,
            'first_name': a.first_name,
            'last_name': a.last_name,
            'email': a.email
        } for a in users], 200


@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }, 200

    @api.expect(user_update_model, validate=True)
    @api.response(200, 'user updated successfully')
    @api.response(404, 'user not found')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, user_id):
        """Update user info (only for the authenticated user,
        no email/password changes)"""
        current_user_id = get_jwt_identity()  # récupère l'utilisateur connecté
        if user_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403  # utilisateur ne peut pas modifier les autres

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        updated_data = api.payload

        # Empêche la modification de l'email et du mot de passe
        try:
            facade.update_user(user_id, updated_data)
        except ValueError as exc:
            return {'error': str(exc)}, 400

        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        }, 200
