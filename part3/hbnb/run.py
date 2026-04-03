from app import create_app
from app.services import facade
app = create_app()
def create_admin():
    admin = facade.get_user_by_email("admin@hbnb.io")

    if not admin:
        admin_data = {
            "email": "admin@hbnb.io",
            "first_name": "Admin",
            "last_name": "HBnB",
            "password": "admin123",
            "is_admin": True
        }

        facade.create_user(admin_data)
        print("Admin user created")

if __name__ == '__main__':
    create_admin()
    app.run(debug=True)
