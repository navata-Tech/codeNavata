from flask import Flask, request, jsonify, send_file
import logging
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Namespace, Resource, fields  # Import Namespace from flask_restx
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
from flasgger import Swagger
from flask_restx import Api, Resource, fields
from io import BytesIO
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies,verify_jwt_in_request
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.ttfonts import TTFont
from sqlalchemy import text 
from functools import wraps
from models import db, Invoice, InvoiceItem 
from num2words import num2words 
from datetime import datetime,timedelta


# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "https://manage.technavata.com"], "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})
api = Api(app, version='1.0', title='Navata Billing API', description='API for managing billing and generating invoices')
swagger = Swagger(app)


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/navata_billing'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT configuration with expiration
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Change this to a strong key in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)


# Initialize SQLAlchemy with the app
db.init_app(app)
jwt = JWTManager(app)

# Configure logging
logging.basicConfig(level=logging.ERROR, 
                    format='%(asctime)s %(levelname)s:%(message)s',
                    handlers=[logging.FileHandler('app.log'), logging.StreamHandler()])

def create_tables():
    try:
        # Using SQLAlchemy's engine to execute raw SQL
        with db.engine.connect() as connection:
            connection.execute(text("""CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )"""))
            
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS invoices (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    invoice_number INT UNIQUE NOT NULL,
                    customer_name VARCHAR(255) NOT NULL,
                    pan_vat VARCHAR(20),
                    address VARCHAR(255),
                    phone VARCHAR(20),
                    email VARCHAR(255),
                    mode_of_payment VARCHAR(50),
                    date DATETIME,
                    sub_total DECIMAL(10, 2),
                    discount DECIMAL(10, 2),
                    total_amount DECIMAL(10, 2)
                );
            """))
            
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS invoice_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    invoice_id INT,
                    item_description VARCHAR(255) NOT NULL,
                    quantity INT NOT NULL,
                    rate DECIMAL(10, 2) NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
                );
            """))
            
            print("Tables created successfully.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

# Create an instance of Api and define namespaces
invoices_ns = api.namespace('invoices', description='Invoice Operations')
admin_ns = api.namespace('admin', description='Admin Operations')
# Swagger API model for Invoice
invoice_model = api.model('Invoice', {
    'customer_name': fields.String(required=True, description='Customer Name'),
    'pan_vat': fields.String(required=False, description='PAN/VAT'),
    'address': fields.String(required=True, description='Address'),
    'phone': fields.String(required=True, description='Phone'),
    'email': fields.String(required=False, description='Email'),
    'mode_of_payment': fields.String(required=True, description='Mode of Payment'),
    'items': fields.List(fields.Nested(api.model('Item', {
        'description': fields.String(required=True, description='Item Description'),
        'quantity': fields.Integer(required=True, description='Quantity'),
        'rate': fields.Float(required=True, description='Rate'),
    })), required=True, description='List of items'),
    'sub_total':fields.Float(required=True, description='sub_total'),
    'discount': fields.Float(required=False, description='Discount'),
    'total_amount': fields.Float(required=True, description='Total Amount')
})

admin_model = api.model('Admin', {
    'username': fields.String(required=True, description='Admin username'),
    'email': fields.String(required=True, description='Admin email'),
    'password': fields.String(required=True, description='Admin password')
})


def generate_invoice_number():
    last_invoice = db.session.query(Invoice).order_by(Invoice.id.desc()).first()
    
    if last_invoice:
        last_number = int(last_invoice.invoice_number)
        new_number = last_number + 1
    else:
        new_number = 1  # Starting invoice number

    # Format the new invoice number with leading zeros, ensuring it's always 3 digits long
    formatted_invoice_number = f'{new_number:03}'
    
    return formatted_invoice_number

# Handle CORS Preflight Requests
@app.before_request
def handle_options_request():
    if request.method == 'OPTIONS':
        # Handle the preflight request
        response = jsonify({'message': 'CORS preflight successful'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "DELETE, POST, GET, PUT, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        response.status_code = 200
        return response

# Middleware (decorator) to enforce authorization
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()  # This will raise an error if no JWT is present or invalid
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Unauthorized access', 'error': str(e)}), 401
    return wrapper



@app.route('/create-admin', methods=['POST'])
def create_admin():
    data = request.json
    try:
        # Check if the admin already exists using SQLAlchemy
        existing_admin = db.session.execute(text("SELECT * FROM admins WHERE email = :email"), {'email': data['email']}).fetchone()
        if existing_admin:
            return {'message': 'Admin with this email already exists'}, 400

        hashed_password = generate_password_hash(data['password'])
        # Insert new admin using SQLAlchemy
        db.session.execute(
            text("""INSERT INTO admins (username, email, password) VALUES (:username, :email, :password)"""),
            {'username': data['username'], 'email': data['email'], 'password': hashed_password}
        )
        db.session.commit()  # Commit the transaction
        return {'message': 'Admin created successfully'}, 201
    except Exception as e:
        db.session.rollback()  # Roll back the session in case of error
        logging.error(f'Error creating admin: {e}')
        return {'message': f'Error: {e}'}, 500
        
@app.route('/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        # CORS preflight handling
        response = jsonify({"message": "CORS preflight successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200
    
    data = request.json
    try:
        admin = db.session.execute(text("SELECT * FROM admins WHERE email = :email"), {'email': data['email']}).fetchone()
        if admin and check_password_hash(admin[3], data['password']):
            access_token = create_access_token(identity=admin[0])
            return jsonify({'message': 'Login successful', 'access_token': access_token}), 200
        return jsonify({'message': 'Invalid email or password'}), 401
    except Exception as e:
        logging.error(f'Error during admin login: {e}')
        return jsonify({'message': f"Error: {e}"}), 500



@admin_ns.route('/logout')
class AdminLogout(Resource):
    @admin_required  # Protect this route
    def post(self):
        """
        Log out the admin by clearing the JWT token.
        """
        response = jsonify({'message': 'Logged out successfully'})
        unset_jwt_cookies(response)  # Clear the JWT cookie
        return response, 200

# Protected route example for admin
@admin_ns.route('/protected')
class ProtectedAdmin(Resource):
    @api.doc(security='bearerAuth')
    @jwt_required()  # Protect this route with JWT
    def get(self):
        current_admin_id = get_jwt_identity()  # Get the ID of the logged-in admin
        return {'message': f'Welcome admin {current_admin_id}!'}
@app.route('/create-invoice', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.json
    try:
        # Automatically generate invoice number
        invoice_number = generate_invoice_number()
        
        # Create the main invoice object
        new_invoice = Invoice(
            invoice_number=invoice_number,
            customer_name=data['customer_name'],
            pan_vat=data.get('pan_vat', ''),
            address=data.get('address', ''),
            phone=data.get('phone', ''),
            email=data.get('email', ''),
            mode_of_payment=data.get('mode_of_payment', ''),
            date=datetime.now(),
            sub_total=data['sub_total'],
            discount=data.get('discount', 0),  # Default to 0 if not provided
            total_amount=data['total_amount']
        )
        
        # Add the new invoice to the session
        db.session.add(new_invoice)
        db.session.commit()  # Commit to get the invoice ID

        # Add the invoice items
        for item in data['items']:            
            invoice_item = InvoiceItem(
                invoice_id=new_invoice.id,
                item_description=item['description'],  # Corrected field name
                quantity=item['quantity'],
                rate=item['rate'],
                amount= item['quantity'] * item['rate']
            )
            db.session.add(invoice_item)
        
        db.session.commit()  # Commit to save the items

        return jsonify({'message': 'Invoice created successfully', 'invoice_id': new_invoice.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f'Error creating invoice: {str(e)}')
        return jsonify({'error': str(e)}), 500


@api.doc(security='bearerAuth')
@jwt_required()
def get_all_invoices():
    try:
        invoices = Invoice.query.all()
        invoices_data = []
        for invoice in invoices:
            invoice_data = {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'customer_name': invoice.customer_name,
                'pan_vat': invoice.pan_vat,
                'address': invoice.address,
                'phone': invoice.phone,
                'email': invoice.email,
                'mode_of_payment': invoice.mode_of_payment,
                'date': invoice.date.strftime("%Y-%m-%d %H:%M:%S") if invoice.date else None,
                'sub_total': invoice.sub_total,
                'discount': invoice.discount,
                'total_amount': invoice.total_amount,
                'items': []  # Initialize items list
            }

            items = InvoiceItem.query.filter_by(invoice_id=invoice.id).all()
            for item in items:
                item_data = {
                    'description': item.item_description,
                    'quantity': item.quantity,
                    'rate': item.rate,
                    'amount': item.amount,
                }
                invoice_data['items'].append(item_data)

            invoices_data.append(invoice_data)

        return jsonify(invoices_data)

    except Exception as e:
        logging.error(f'Error fetching invoices: {str(e)}')
        return jsonify({'message': 'An error occurred while fetching invoices', 'error': str(e)}), 500


def get_invoice(invoice_id):
    try:
        invoice = db.session.get(Invoice, invoice_id)  # Updated to use db.session.get()
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404
        
        invoice_data = {
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'customer_name': invoice.customer_name,
            'pan_vat': invoice.pan_vat,
            'address': invoice.address,
            'phone': invoice.phone,
            'email': invoice.email,
            'mode_of_payment': invoice.mode_of_payment,
            'date': invoice.date.strftime("%Y-%m-%d %H:%M:%S") if invoice.date else None,
            'sub_total': invoice.sub_total,
            'discount': invoice.discount,
            'total_amount': invoice.total_amount,
            'items': []  # Initialize items list
        }
        
        items = InvoiceItem.query.filter_by(invoice_id=invoice.id).all()
        for item in items:
            item_data = {
                'description': item.item_description,
                'quantity': item.quantity,
                'rate': item.rate,
                'amount': item.amount,
            }
            invoice_data['items'].append(item_data)

        return jsonify(invoice_data)

    except Exception as e:
        logging.error(f'Error fetching invoice {invoice_id}: {str(e)}')
        return jsonify({'message': 'An error occurred while fetching the invoice', 'error': str(e)}), 500


def update_invoice(invoice_id):
    data = request.json
    try:
        invoice = db.session.get(Invoice, invoice_id)  # Updated to use db.session.get()
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404
        
        # Update invoice fields
        invoice.customer_name = data.get('customer_name', invoice.customer_name)
        invoice.pan_vat = data.get('pan_vat', invoice.pan_vat)
        invoice.address = data.get('address', invoice.address)
        invoice.phone = data.get('phone', invoice.phone)
        invoice.email = data.get('email', invoice.email)
        invoice.mode_of_payment = data.get('mode_of_payment', invoice.mode_of_payment)
        invoice.sub_total = data.get('sub_total', invoice.sub_total)
        invoice.discount = data.get('discount', invoice.discount)
        invoice.total_amount = data.get('total_amount', invoice.total_amount)

        # Clear existing items and add updated ones
        InvoiceItem.query.filter_by(invoice_id=invoice.id).delete()  # Clear existing items
        for item in data.get('items', []):
            quantity = int(item['quantity'])  # Convert to int
            rate = float(item['rate'])  # Convert to float
            invoice_item = InvoiceItem(
                invoice_id=invoice.id,
                item_description=item['description'],
                quantity=quantity,
                rate=rate,
                amount=quantity * rate  # Calculate amount
            )
            db.session.add(invoice_item)
        
        db.session.commit()  # Commit changes

        return jsonify({'message': 'Invoice updated successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f'Error updating invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500
    except ValueError as ve:
        logging.error(f'Invalid input for invoice {invoice_id}: {str(ve)}')
        return jsonify({'error': 'Invalid input data', 'details': str(ve)}), 400

@api.doc(security='bearerAuth')
@jwt_required()
def delete_invoice(invoice_id):
    try:
        invoice = db.session.get(Invoice, invoice_id)  # Updated to use db.session.get()
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404
        
        db.session.delete(invoice)
        db.session.commit()
        return jsonify({'message': 'Invoice deleted successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f'Error deleting invoice {invoice_id}: {str(e)}')
        return jsonify({'error': str(e)}), 500

# Registering the invoice route for CRUD operations
@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    return get_all_invoices()

@app.route('/api/invoices/<int:invoice_id>', methods=['GET', 'PUT', 'DELETE'])
def invoice(invoice_id):
    if request.method == 'GET':
        return get_invoice(invoice_id)
    elif request.method == 'PUT':
        return update_invoice(invoice_id)
    elif request.method == 'DELETE':
        return delete_invoice(invoice_id)
    
def wrap_text(text, width, font, font_size):
    """Wrap text to fit within a specified width."""
    from reportlab.pdfbase.pdfmetrics import stringWidth

    # No need to register Helvetica, it is built-in
    words = text.split(' ')
    lines = []
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip()
        if stringWidth(test_line, font, font_size) <= width:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word

    if current_line:  # Add the last line if there's any content
        lines.append(current_line)

    return lines

def generate_invoice_pdf(invoice_data):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)

    # Set colors
    jazzberry_jam = colors.Color(159 / 255, 30 / 255, 98 / 255)
    white = colors.white
    black = colors.black

    # Add Logo
    logo_path = "./Images/logo.png"
    pdf.drawImage(logo_path, 450, 715, width=75, height=65)

    # Company details in the header
    pdf.setFont("Helvetica-Bold", 14)
    pdf.setFillColor(black)
    pdf.drawString(50, 760, "Navata Tech Pvt. Ltd.")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(50, 745, "Naya Thimi, Bhaktapur, Nepal")
    pdf.drawString(50, 730, "Phone No: 9704501240")
    pdf.drawString(50, 715, "PAN No: 619848503")

    # Invoice Number and Date
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(black)
    pdf.drawString(420, 670, f"Invoice number: {invoice_data.get('invoice_number', 'N/A')}")
    current_date = datetime.now().strftime("%Y-%m-%d")
    pdf.drawString(420, 655, f"Date: {current_date}")

    # Align Customer Details section with Invoice Number
    y_position = 680  # Starting Y position for customer details

    # Customer Details Section without a single box, each item has its own box for value
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(black)
    pdf.drawString(50, y_position, "Customer Details")

    # List of customer details
    customer_details = [
        ("Name", invoice_data.get('customer_name', 'N/A')),
        ("PAN/VAT", invoice_data.get('pan_vat', 'N/A')),
        ("Address", invoice_data.get('address', 'N/A')),
        ("Phone", invoice_data.get('phone', 'N/A')),
        ("Email", invoice_data.get('email', 'N/A'))
    ]

    # Set starting Y position for customer details values
    y_position -= 20  # Slight gap below "Customer Details" heading
    box_width = 260  # Width for the value box
    box_height = 15  # Height of each box

    for label, value in customer_details:
        # Draw the label
        pdf.setFillColor(black)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y_position, f"{label}:")


        # Draw the box for the value
        pdf.setFillColor(white)
        pdf.setStrokeColor(jazzberry_jam)
        pdf.rect(120, y_position - 5, box_width, box_height, fill=True, stroke=True)

        # Draw the value inside the box
        pdf.setFillColor(black)
        pdf.drawString(125, y_position, str(value))

        # Move the Y position down for the next row
        y_position -= (box_height + 10)  # Ensure there's a gap for the next row
    # Mode of Payment below Email
    pdf.drawString(50, y_position, "Mode of Payment:")
    pdf.drawString(150, y_position, invoice_data.get('mode_of_payment', 'N/A'))

    # Move down table to avoid overlap with Mode of Payment
    y_position -= 45

    # Table Headings
    pdf.setFillColor(jazzberry_jam)
    pdf.rect(50, y_position, 500, 20, fill=True)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(white)
    pdf.drawString(55, y_position + 5, "S.N.")
    pdf.drawString(100, y_position + 5, "Particulars")
    pdf.drawString(400, y_position + 5, "Qty")
    pdf.drawString(450, y_position + 5, "Rate")
    pdf.drawString(500, y_position + 5, "Amount")

    # Draw a black line under the headers
    pdf.setStrokeColor(black)
    pdf.setLineWidth(1)
    pdf.line(50, y_position, 550, y_position)

    # Add Table Data
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(black)
    y = y_position - 20  # Start table rows just below the heading

    items = invoice_data.get('items', [])
    for idx, item in enumerate(items, start=1):
        pdf.drawString(55, y, str(idx))
        description = str(item.get('description', 'N/A'))  # Ensure it's a string
        pdf.drawString(100, y, description)  # Adjusted position
        pdf.drawString(400, y, str(item.get('quantity', 0)))
        pdf.drawString(450, y, f"{item.get('rate', 0)}")
        pdf.drawString(500, y, f"{item.get('amount', 0)}")

        # Draw a line below each row
        pdf.line(50, y - 5, 550, y - 5)
        y -= 15  # Move y down for the next row

    # Footer for Totals
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(400, y - 35, f"Sub Total: {invoice_data.get('sub_total', 0)}")
    pdf.drawString(400, y - 50, f"Discount: {invoice_data.get('discount', 0)}")
    pdf.drawString(400, y - 65, f"Grand Total: {invoice_data.get('total_amount', 'N/A')}")

    # Calculate position for Amount in Words Box to align with Grand Total
    amount_box_y_position = y - 85  # Adjusted to align with the total amount position

    # Function to convert the number to words in Nepali style
    def convert_to_nepali_words(total_amount):
        amount_in_words = ""

        # Check if the total_amount is 100,000 or more
        if total_amount >= 100000:
            # Calculate lakhs, thousands, hundreds, tens, and units
            lakh_value = total_amount // 100000
            thousand_value = (total_amount % 100000) // 1000
            hundred_value = (total_amount % 1000) // 100
            ten_value = (total_amount % 100) // 10
            unit_value = total_amount % 10
            
            # Create the amount in words for lakhs
            amount_in_words += f"{num2words(lakh_value, to='cardinal', lang='en')} lakh"
            
            # If there's a remaining amount, convert it to thousands
            if thousand_value > 0:
                amount_in_words += f" {num2words(thousand_value, to='cardinal', lang='en')} thousand"
            
            # If there's a remaining amount, convert it to hundreds
            if hundred_value > 0:
                amount_in_words += f" {num2words(hundred_value, to='cardinal', lang='en')} hundred"

            # If there are tens or units remaining, append them as well
            if ten_value > 0 or unit_value > 0:
                if ten_value > 0:
                    amount_in_words += f" {num2words(ten_value * 10 + unit_value, to='cardinal', lang='en')}"
                else:
                    amount_in_words += f" {num2words(unit_value, to='cardinal', lang='en')}"

        else:
            # For amounts less than 100,000, just convert it to words
            amount_in_words = num2words(total_amount, to='currency', lang='en').replace('euro', 'rupees').replace('cents', 'paisa')

        # Capitalize the final amount in words
        amount_in_words = amount_in_words.strip().capitalize()
        amount_in_words += " rupees"  # Always add "rupees" for context

        # Example to add paisa if needed, assuming total_amount could also include paisa
        if isinstance(total_amount, float):
            paisa_value = round((total_amount - int(total_amount)) * 100)
            if paisa_value > 0:
                amount_in_words += f", {num2words(paisa_value, to='cardinal', lang='en')} paisa"

        return amount_in_words

    # Amount in Words
    total_amount = invoice_data.get('total_amount', 0)
    amount_in_words = convert_to_nepali_words(total_amount)

    # Wrap the text to fit within the box
    wrapped_text = wrap_text(amount_in_words, 300, "Helvetica", 10)

    # Calculate the height of the box based on wrapped text
    line_height = 10
    amount_box_height = 40 + len(wrapped_text) * line_height  # Adjust height based on wrapped text

    # Draw the box for the amount in words
    pdf.setFillColor(white)
    pdf.setStrokeColor(jazzberry_jam)
    pdf.rect(50, amount_box_y_position, 340, amount_box_height, fill=True, stroke=True)  # Draw the box

    # Write the "Amount in Words:" label inside the box
    label_y_position = amount_box_y_position + 30  # Position for the label inside the box
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(black)
    pdf.drawString(55, label_y_position, "Amount in Words:")  # Position inside the box

    # Write the "Amount in Words" inside the box
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(black)
    for i, line in enumerate(wrapped_text):
        # Adjust Y position for each line inside the box
        pdf.drawString(55, label_y_position - line_height - (i * line_height), line)

    # Adjust the footer Y position after the amount box
    y -= (amount_box_height + 20)  # Move Y position down for footer

    # Ensure there's a gap of 10 units between the Grand Total and the Amount in Words box
    y -= 10  # Add a gap before the footer

    # Footer: Terms and Conditions
    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(black)
    pdf.drawString(50, 40, "1. Goods once sold will not be returned.")
    pdf.drawString(50, 30, "2. E. & O.E.")

    # Footer: Received by and Signatures
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(50, 100, "Received By")
    pdf.drawString(400, 100, "For Navata Tech Pvt. Ltd.")

     # Draw dashed lines above signatures
    pdf.setDash(1, 2)
    pdf.line(50, 115, 200, 115)
    pdf.line(400, 115, 550, 115)
    pdf.setDash()  # Reset to solid line

    # Save the PDF
    pdf.save()

    buffer.seek(0)
    return buffer



# API endpoint to download invoice PDF using the invoice number
@app.route('/api/invoices-pdf/<invoice_number>', methods=['GET'])
@jwt_required()  # Ensure the user is authenticated
def download_invoice_pdf(invoice_number):
    return get_invoice_pdf_by_number(invoice_number)

def get_invoice_pdf_by_number(invoice_number):
    try:
        # Fetch the invoice by its number
        invoice = Invoice.query.filter_by(invoice_number=invoice_number).first()
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404

        # Fetch invoice items
        items = InvoiceItem.query.filter_by(invoice_id=invoice.id).all()

        # Prepare item data for the invoice
        items_data = [
            {
                'description': item.item_description,
                'quantity': item.quantity,
                'rate': item.rate,
                'amount': item.amount
            } for item in items
        ]

        # Prepare invoice data
        invoice_data = {
            'invoice_number': invoice.invoice_number,
            'customer_name': invoice.customer_name,
            'pan_vat': invoice.pan_vat,
            'address': invoice.address,
            'phone': invoice.phone,
            'email': invoice.email,
            'mode_of_payment': invoice.mode_of_payment,
            'date': invoice.date.strftime("%Y-%m-%d %H:%M:%S"),
            'sub_total': invoice.sub_total,
            'discount': invoice.discount,
            'total_amount': invoice.total_amount,
            'items': items_data
        }

        # Generate the PDF (you should define this function elsewhere)
        pdf_buffer = generate_invoice_pdf(invoice_data)
        
        if not pdf_buffer:
            raise Exception("Failed to generate PDF")

        # Return the PDF as a response
        return send_file(
            pdf_buffer,
            as_attachment=True,  # Enable downloading
            download_name=f'invoice_{invoice.invoice_number}.pdf',
            mimetype='application/pdf'
        )

    except Exception as e:
        logging.error(f'Error downloading invoice PDF for invoice number {invoice_number}: {str(e)}')
        return jsonify({"error": "Internal Server Error"}), 500
if __name__ == '__main__':
    with app.app_context():
        # Call the create_tables function during application initialization
        create_tables()  # Ensure the function runs within the application context
    app.run(debug=True)
