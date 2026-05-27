# InvoxaFlow 🧾

> Professional invoice generation and payment tracking platform for freelancers and small agencies in Nigeria and Africa.

![InvoxaFlow](https://img.shields.io/badge/InvoxaFlow-Invoice%20Platform-0f172a?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20MongoDB-3b82f6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)

---

## ✨ Features

- **Invoice CRUD** — Create, edit, delete, and view professional invoices
- **PDF Generation** — Download pixel-perfect invoice PDFs via Puppeteer
- **Email Delivery** — Send invoices to clients with PDF attached via Nodemailer
- **Paystack Payments** — Accept card, bank transfer, USSD payments
- **Flutterwave Payments** — Accept card, mobile money payments
- **Real-time Tracking** — Dashboard with paid/unpaid/overdue stats
- **Search & Filter** — Find invoices by client name, email, or invoice ID
- **Pagination** — Handle large invoice volumes cleanly
- **JWT Authentication** — Secure login with bcrypt password hashing
- **Business Branding** — Logo, business name, email signature on invoices
- **Multi-currency** — NGN, USD, GBP, EUR, KES, GHS, ZAR support
- **Line Items** — Itemised billing with tax and discount support
- **Mobile Responsive** — Works on all screen sizes

---

## 🗂 Project Structure

```
invoxaflow/
├── server/                     # Node.js + Express backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── invoiceController.js
│   │   ├── paymentController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js             # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   └── Invoice.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── invoices.js
│   │   ├── payments.js
│   │   └── users.js
│   ├── utils/
│   │   ├── pdfGenerator.js     # Puppeteer PDF generation
│   │   └── emailSender.js      # Nodemailer email sending
│   ├── index.js                # Express app entry
│   ├── package.json
│   └── .env.example
│
└── client/                     # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── AppLayout.jsx
    │   │   │   ├── StatusBadge.jsx
    │   │   │   ├── Spinner.jsx
    │   │   │   ├── ConfirmModal.jsx
    │   │   │   ├── EmptyState.jsx
    │   │   │   ├── Pagination.jsx
    │   │   │   └── LoadingScreen.jsx
    │   │   └── invoice/
    │   │       ├── InvoiceForm.jsx
    │   │       └── PaymentModal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── InvoiceListPage.jsx
    │   │   ├── CreateInvoicePage.jsx
    │   │   ├── EditInvoicePage.jsx
    │   │   ├── InvoiceDetailPage.jsx
    │   │   └── SettingsPage.jsx
    │   ├── services/
    │   │   └── api.js          # Axios service layer
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn
- Gmail account (for email sending)
- Paystack account (for payments)
- Flutterwave account (for payments)

---

### 1. Clone the repository

```bash
git clone https://github.com/Milesnnaji/invoxaflow.git
cd invoxaflow
```

---

### 2. Setup the Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/invoxaflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Paystack — get from https://dashboard.paystack.com/#/settings/developers
PAYSTACK_SECRET_KEY=<your_paystack_secret_key>
PAYSTACK_PUBLIC_KEY=<your_paystack_public_key>

# Flutterwave — get from https://dashboard.flutterwave.com/settings/apis
FLUTTERWAVE_SECRET_KEY=<your_flutterwave_secret_key>
FLUTTERWAVE_PUBLIC_KEY=<your_flutterwave_public_key>

# Gmail — use an App Password (not your regular password)
# Enable at: https://myaccount.google.com/apppasswords
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=InvoxaFlow <yourname@gmail.com>
```

Start the server:

```bash
npm run dev
```

Server runs on: `http://localhost:5000`

---

### 3. Setup the Frontend

```bash
cd ../client
npm install
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices (paginated, searchable) |
| GET | `/api/invoices/stats` | Dashboard stats |
| GET | `/api/invoices/:id` | Get single invoice |
| POST | `/api/invoices` | Create invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |
| GET | `/api/invoices/:id/pdf` | Download PDF |
| POST | `/api/invoices/:id/send` | Send via email |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/paystack/initialize` | Init Paystack checkout |
| POST | `/api/payments/paystack/verify` | Verify Paystack payment |
| POST | `/api/payments/flutterwave/initialize` | Init Flutterwave checkout |
| POST | `/api/payments/flutterwave/verify` | Verify Flutterwave payment |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/update` | Update profile/settings |
| PUT | `/api/users/change-password` | Change password |

---

## 🗄 Database Models

### User
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  businessName: String,
  businessAddress: String,
  businessPhone: String,
  logo: String (base64 or URL),
  currency: String (default: 'NGN'),
  emailSignature: String,
  website: String,
  createdAt: Date
}
```

### Invoice
```js
{
  userId: ObjectId (ref: User),
  invoiceId: String (auto-generated, e.g. INV-A3F2-4821),
  clientName: String,
  clientEmail: String,
  clientAddress: String,
  clientPhone: String,
  description: String,
  items: [{ description, quantity, unitPrice, total }],
  amount: Number,
  tax: Number (%),
  discount: Number (%),
  status: 'Paid' | 'Unpaid' | 'Pending' | 'Overdue',
  dueDate: Date,
  paymentReference: String,
  paymentGateway: 'paystack' | 'flutterwave' | 'manual' | '',
  paidAt: Date,
  notes: String,
  currency: String,
  createdAt: Date
}
```

---

## 🌐 Deployment

### Backend → Render

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Root Directory** to `server`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `node index.js`
6. Add all environment variables from `.env`

> **Note:** Puppeteer requires a specific build pack on Render. Add the environment variable:
> `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false`
> And install `puppeteer` (which bundles Chromium).

### Frontend → Vercel

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Set **Root Directory** to `client`
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `dist`
6. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`

---

## 🔒 Security Notes

- All passwords are hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days by default
- All invoice routes are protected with JWT middleware
- Payment verification is done server-side (never trust client)
- Input validation via express-validator on all routes
- Users can only access their own invoices
- Environment variables are used for all secrets

---

## 📧 Gmail Setup for Nodemailer

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Create a new App Password for "Mail"
5. Use the 16-character password as `EMAIL_PASS` in your `.env`

---

## 💳 Payment Gateway Setup

### Paystack
1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys
3. Copy your **Secret Key** (starts with `sk_test_` for test mode)
4. Add to `PAYSTACK_SECRET_KEY` in your `.env`

### Flutterwave
1. Sign up at [flutterwave.com](https://flutterwave.com)
2. Go to Settings → API Keys
3. Copy your **Secret Key** (starts with `FLWSECK_TEST-`)
4. Add to `FLUTTERWAVE_SECRET_KEY` in your `.env`

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| PDF | Puppeteer |
| Email | Nodemailer |
| Payments | Paystack API, Flutterwave API |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Notifications | React Hot Toast |

---

## 📄 License

MIT — free to use and modify.

---

Built with ❤️ for African freelancers 🌍
