"use client";
import React, { useState } from 'react';
import styles from './book.module.css'; // Reusing for consistent styling

export default function DynamicFormRenderer({ fields, onSubmit, onCancel, initialValues = {} }) {
    const [formData, setFormData] = useState(initialValues);

    const handleChange = (label, value) => {
        setFormData({ ...formData, [label]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {fields.map((field, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <label style={{ fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>
                        {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                    </label>

                    {field.type === 'text' && (
                        <input
                            type="text"
                            className={styles.input}
                            required={field.required}
                            value={formData[field.label] || ''}
                            onChange={(e) => handleChange(field.label, e.target.value)}
                        />
                    )}
                    {field.type === 'number' && (
                        <input
                            type="number"
                            className={styles.input}
                            required={field.required}
                            value={formData[field.label] || ''}
                            onChange={(e) => handleChange(field.label, e.target.value)}
                        />
                    )}
                    {field.type === 'date' && (
                        <input
                            type="date"
                            className={styles.input}
                            required={field.required}
                            value={formData[field.label] || ''}
                            onChange={(e) => handleChange(field.label, e.target.value)}
                        />
                    )}
                    {field.type === 'dropdown' && (
                        <select
                            className={styles.input}
                            required={field.required}
                            value={formData[field.label] || ''}
                            onChange={(e) => handleChange(field.label, e.target.value)}
                        >
                            <option value="">Select...</option>
                            {field.options?.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}
                    {field.type === 'checkbox' && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {field.options?.map((opt, i) => (
                                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <input
                                        type="checkbox"
                                        value={opt}
                                        checked={(formData[field.label] || []).includes(opt)}
                                        onChange={(e) => {
                                            const current = formData[field.label] || [];
                                            if (e.target.checked) handleChange(field.label, [...current, opt]);
                                            else handleChange(field.label, current.filter(x => x !== opt));
                                        }}
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <button type="submit" className={styles.button} style={{ marginTop: '1rem' }}>
                Submit & Join Queue
            </button>
        </form>
    );
}
