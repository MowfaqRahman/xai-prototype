import React from 'react';

const InputGroup = ({ label, value, onChange, type = "text", options = null }) => (
    <div style={{ marginBottom: '1.2rem' }}>
        <label style={{ 
            display: 'block', 
            fontSize: '0.85rem', 
            color: 'var(--secondary)', 
            marginBottom: '0.5rem' 
        }}>
            {label}
        </label>
        {options ? (
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="glass-input"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="glass-input"
            />
        )}
    </div>
);

export default InputGroup;
