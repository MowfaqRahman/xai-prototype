# 🏦 Loan Risk Assessment App

This project is a full-stack Loan Risk Assessment application. It uses a React frontend and a FastAPI (Python) backend powered by a machine learning model (XGBoost) to predict loan defaults. It also features advanced Explainable AI (XAI) capabilities using **SHAP**, **LIME**, and **DiCE** (Counterfactuals) to explain *why* a decision was made and *how* to improve it.

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:

* **Python 3.8+**
* **Node.js & npm**

---

## ⚙️ Backend Setup

The backend is built with FastAPI and requires a Python virtual environment. Open a terminal and navigate to your `backend` folder.

**1. Create a virtual environment**

```bash
python -m venv venv

```

**2. Activate the virtual environment**
*(Note: The command below is for Git Bash on Windows. If you are using standard Command Prompt, use `venv\Scripts\activate` instead, or `source venv/bin/activate` for Mac/Linux).*

```bash
source venv/Scripts/activate

```

**3. Install dependencies**
Make sure your virtual environment is active (you should see `(venv)` in your terminal prompt), then install the required Python packages:

```bash
pip install -r requirements.txt

```

**4. Run the FastAPI Server**
Start the backend server using the FastAPI CLI:

```bash
fastapi run

```

*(The backend will now be running at `http://localhost:8000`)*

---

## 💻 Frontend Setup

The frontend is built with React. Open a **new, separate terminal** and navigate to your `frontend` folder.

**1. Install Node modules**

```bash
npm install

```

**2. Run the Development Server**

```bash
npm run dev

```

*(The terminal will output a local URL, usually `http://localhost:3000` or `http://localhost:5173`, where you can view the web app).*

---

## 📖 API Documentation

FastAPI automatically generates interactive API documentation. While the backend server is running, you can explore the endpoints, view the expected JSON schemas, and test the API directly from your browser.

* **Swagger UI Docs:** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)
* **ReDoc Docs:** [http://localhost:8000/redoc](https://www.google.com/search?q=http://localhost:8000/redoc)
