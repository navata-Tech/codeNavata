# wsgi.py
from App import app, create_tables  # Import app and create_tables from your app module

if __name__ == '__main__':
    with app.app_context():
        create_tables()  # Call create_tables within the app context
    app.run(debug=True)
