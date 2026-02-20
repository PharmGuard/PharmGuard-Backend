# PharmGuard
#backend 
this is the backend code for pharmguard

# PharmGuard Backend API

PharmGuard is a secure, role-based backend architecture designed for pharmacy inventory and staff management. It features enterprise-level security protocols and integrates with a Data Science microservice for predictive stock-out alerts.

This project was developed as a backend engineering capstone project under the mentorship of Emmanuel Daniel.

## Core Features
* **Role-Based Access Control (RBAC):** Strict permission layers for Admins, Pharmacists, and Storekeepers based on a structured Data Flow Diagram (DFD).
* **Corporate Authentication:** Public registration is disabled. Admins securely invite employees, triggering an OTP email for secure password setup.
* **Smart Inventory Management:** Multi-tenant architecture ensuring pharmacies only interact with their own specific stock.
* **Data Science Integration:** Communicates with a Python-based ML microservice via Axios to provide predictive alerts on drug stockouts.
* **Immutable Audit Logging:** Tamper-proof logging system to track all staff actions for maximum security and accountability.
* **Account Recovery:** Secure, OTP-based "Forgot/Reset Password" flow.

## 🛠️ Languages & Tech Stack
* **Language:** JavaScript 
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MySQL
* **ORM:** Sequelize
* **Security & Auth:** JSON Web Tokens (JWT), bcryptjs (Password Hashing)
* **API Integration:** Axios (for connecting to the Data Science ML model)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
* Node.js
* MySQL
* Postman (for API testing)
