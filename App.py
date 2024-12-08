from flask import Flask, request, jsonify, send_file
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
from reportlab.pdfbase.ttfonts import TTFont
from sqlalchemy import text 
from functools import wraps
from models import db, Invoice, InvoiceItem 
from num2words import num2words 
from datetime import datetime,timedelta


# Initialize Flask app
app = Flask(__name__)
CORS(app)
api = Api(app, version='1.0', title='Navata Billing API', description='API for managing billing and generating invoices')
swagger = Swagger(app)

# Configure SQLAlchemy with pymysql
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://technavata_admin:%40Navata%40321@localhost/technavata_navata_billing'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT configuration with expiration
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Change this to a strong key in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)


# Initialize SQLAlchemy with the app
db.init_app(app)
jwt = JWTManager(app)

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
        return str(last_number + 1)
    return '1'  # Starting invoice number


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


@admin_ns.route('/login')
class AdminLogin(Resource):
    @api.expect(admin_model)
    def post(self):
        create_tables()  # Ensure tables are created before querying
        data = request.json
        try:
            # Query the admin by email using SQLAlchemy
            admin = db.session.execute(text("SELECT * FROM admins WHERE email = :email"), {'email': data['email']}).fetchone()
            
            if admin and check_password_hash(admin[3], data['password']):
                # Generate JWT token
                access_token = create_access_token(identity=admin[0])  # Use admin ID as identity
                return {'message': 'Login successful', 'access_token': access_token}, 200
            
            return {'message': 'Invalid credentials'}, 401
        except Exception as e:
            return {'message': f'Error: {e}'}, 500
@admin_ns.route('/create')
class AdminCreate(Resource):
    @api.expect(admin_model)
    def post(self):
        create_tables()  # Ensure tables are created before querying
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
            return {'message': f'Error: {e}'}, 500

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    try:
        # Query all invoices
        invoices = Invoice.query.all()
        invoice_list = []

        for invoice in invoices:
            # Prepare invoice data
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
            
            # Fetch associated items for each invoice
            items = InvoiceItem.query.filter_by(invoice_id=invoice.id).all()
            for item in items:
                item_data = {
                    'description': item.item_description,
                    'quantity': item.quantity,
                    'rate': item.rate,
                    'amount': item.amount,
                }
                invoice_data['items'].append(item_data)

            invoice_list.append(invoice_data)

        return jsonify(invoice_list)

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return jsonify({'message': 'An error occurred while fetching invoices', 'error': str(e)}), 500



@api.route('/invoices/<int:invoice_id>')
class InvoiceResource(Resource):
    def get(self, invoice_id):
        """Fetch an invoice by its ID."""
        try:
            # Fetch invoice by ID
            invoice = Invoice.query.get(invoice_id)
            
            if not invoice:
                return {'message': 'Invoice not found'}, 404
            
            # Prepare the invoice data
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
            
            # Fetch associated items for this invoice
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
            print(f"An error occurred: {str(e)}")
            return {'message': 'An error occurred while fetching the invoice'}, 500

    @api.expect(invoice_model)  # Ensure invoice_model is defined in your code
    def put(self, invoice_id):
        """Update an existing invoice by its ID."""
        data = request.json

        try:
            # Fetch the invoice to be updated
            invoice = Invoice.query.get(invoice_id)
            if not invoice:
                return {'message': 'Invoice not found'}, 404

            # Update invoice fields
            invoice.customer_name = data['customer_name']
            invoice.pan_vat = data.get('pan_vat')
            invoice.address = data['address']
            invoice.phone = data['phone']
            invoice.email = data.get('email')
            invoice.mode_of_payment = data['mode_of_payment']
            invoice.sub_total = data['sub_total']
            invoice.discount = data.get('discount', 0)
            invoice.total_amount = data['total_amount']

            # Remove existing items associated with this invoice
            InvoiceItem.query.filter_by(invoice_id=invoice_id).delete()

            # Now insert each updated item
            for item in data['items']:
                new_item = InvoiceItem(
                    invoice_id=invoice_id,
                    item_description=item['description'],
                    quantity=item['quantity'],
                    rate=item['rate'],
                    amount=item['quantity'] * item['rate']
                )
                db.session.add(new_item)

            # Commit the transaction
            db.session.commit()

            return {
                'message': 'Invoice updated successfully',
                'invoice_number': invoice.invoice_number
            }, 200

        except Exception as e:
            db.session.rollback()
            print(f"An error occurred: {str(e)}")
            return {'message': 'An error occurred while updating the invoice', 'error': str(e)}, 500

def wrap_text(text, width, font, font_size):
    """Wrap text to fit within a specified width."""
    from reportlab.pdfbase.pdfmetrics import stringWidth

    # Register the font (ensure Helvetica is available)
    try:
        pdfmetrics.registerFont(TTFont('Helvetica', 'Helvetica.ttf'))  # Ensure the file exists
    except Exception as e:
        print(f"Font registration error: {e}")
        # Fallback to built-in Helvetica
        font = "Helvetica"

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

    # Add the last line if there's any content
    if current_line:
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

    # Invoice Number and Date
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(black)
    pdf.drawString(400, 680, f"Invoice number: {invoice_data.get('invoice_number', 'N/A')}")
    current_date = datetime.now().strftime("%Y-%m-%d")
    pdf.drawString(400, 665, f"Date: {current_date}")

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
        ("Phone", invoice_data.get('phone', 'N/A')),
        ("Email", invoice_data.get('email', 'N/A'))
    ]

    # Set starting Y position for customer details values
    y_position -= 20  # Slight gap below "Customer Details" heading
    box_width = 180  # Width for the value box
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
        y_position -= 25

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

    # Amount in Words
    total_amount = invoice_data.get('total_amount', 0)
    amount_in_words = num2words(total_amount, to='currency', lang='en').replace('euro', 'rupees').replace('cents', 'paisa').capitalize()

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
    pdf.drawString(50, 30, "2. All disputes are subject to Kathmandu jurisdiction.")

    # Finalize PDF
    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer
@api.route('/invoice-pdf/<int:invoice_number>')
class InvoicePDF(Resource):
    @jwt_required()  # Ensure JWT token is required to access this route
    def get(self, invoice_number):
        """Fetch an invoice by its number and generate a PDF."""
        try:
            # Fetch invoice by its number
            invoice = Invoice.query.filter_by(invoice_number=invoice_number).first()
            if not invoice:
                return {'message': 'Invoice not found'}, 404
            
            # Prepare the invoice data
            invoice_data = {
                'invoice_number': invoice.invoice_number,
                'customer_name': invoice.customer_name,
                'pan_vat': invoice.pan_vat,
                'address': invoice.address,
                'phone': invoice.phone,
                'email': invoice.email,
                'mode_of_payment': invoice.mode_of_payment,
                'date_issued': invoice.date.strftime("%Y-%m-%d %H:%M:%S") if invoice.date else None,
                'sub_total': invoice.sub_total or 0,
                'discount': invoice.discount or 0,
                'total_amount': invoice.total_amount or 0,
                'items': []  # Initialize items list
            }

            # Fetch associated items for this invoice
            items = InvoiceItem.query.filter_by(invoice_id=invoice.id).all()
            for idx, item in enumerate(items, start=1):
                item_data = {
                    'serial_number': idx,
                    'description': item.item_description,
                    'quantity': item.quantity,
                    'rate': item.rate,
                    'amount': item.amount,
                }
                invoice_data['items'].append(item_data)

            # Generate the PDF using a helper function (ensure this is defined elsewhere in your code)
            pdf_buffer = generate_invoice_pdf(invoice_data)
            
            if not pdf_buffer:
                return {'message': 'Error generating invoice PDF'}, 500

            # Create a unique filename for the invoice PDF
            filename = f"invoice_{invoice_data['customer_name'].replace(' ', '_')}_{invoice_data['invoice_number']}.pdf"

            # Send the PDF file back to the client
            pdf_buffer.seek(0)  # Move to the beginning of the BytesIO buffer
            return send_file(pdf_buffer, as_attachment=True, download_name=filename, mimetype='application/pdf')

        except Exception as e:
            print(f"An error occurred: {str(e)}")
            return {'message': 'An error occurred while generating the invoice PDF', 'error': str(e)}, 500
        
if __name__ == '__main__':
    with app.app_context():
        create_tables()  # Call create_tables within the app context
    app.run(debug=True)

