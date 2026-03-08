const BASE_URL = 'http://localhost:8000';

export const predictLoan = async (formData) => {
    const calculatedPercent = formData.person_income > 0 
        ? (parseFloat(formData.loan_amnt) / parseFloat(formData.person_income)) 
        : 0;

    const payload = {
        ...formData,
        person_age: parseInt(formData.person_age),
        person_income: parseFloat(formData.person_income),
        person_emp_exp: parseInt(formData.person_emp_exp),
        loan_amnt: parseFloat(formData.loan_amnt),
        loan_int_rate: parseFloat(formData.loan_int_rate),
        loan_percent_income: parseFloat(calculatedPercent.toFixed(2)),
        cb_person_cred_hist_length: parseInt(formData.cb_person_cred_hist_length),
        credit_score: parseInt(formData.credit_score)
    };

    const response = await fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Prediction failed');
    }

    return await response.json();
};
