import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LoanForm from './components/LoanForm';
import ResultCard from './components/ResultCard';
import { predictLoan } from './services/api';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictLoan(formData);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Loan <strong>Predictor</strong></h1>
          <p style={{ color: 'var(--secondary)' }}>
            Fill in the details below to check loan eligibility powered by AI.
          </p>
        </header>

        {!result ? (
          <LoanForm 
            onSubmit={handleSubmit} 
            loading={loading} 
            error={error} 
          />
        ) : (
          <ResultCard 
            result={result} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
