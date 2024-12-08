import sys
import os

# # Add the project directory to the sys.path
# sys.path.insert(0, '/home3/technavata/api.technavata.com')

from app import app  # Ensure this imports your Flask app instance

# Expose the application to the WSGI server
application = app