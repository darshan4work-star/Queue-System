"use client";
import React, { useState } from 'react';
import styles from './formBuilder.module.css';

export default function FormBuilder({ vendorId, initialFields = [], onSave, onCancel }) {
    const [fields, setFields] = useState(initialFields);

    const addField = () => {
        setFields([...fields, { label: '', type: 'text', options: [], required: false }]);
    };

    const updateField = (index, key, value) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    };

    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(fields);
    };

    return (
        <div className={styles.container}>
            <h3>Customize Intake Form</h3>
            <div className={styles.fieldList}>
                {fields.map((field, index) => (
                    <div key={index} className={styles.fieldCard}>
                        <div className={styles.row}>
                            <input
                                type="text"
                                placeholder="Field Label (e.g., Age)"
                                value={field.label}
                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                className={styles.input}
                            />
                            <select
                                value={field.type}
                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                className={styles.select}
                            >
                                <option value="text">Text Input</option>
                                <option value="number">Number</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="date">Date</option>
                            </select>
                            <button onClick={() => removeField(index)} className={styles.removeBtn}>×</button>
                        </div>

                        {(field.type === 'dropdown' || field.type === 'checkbox') && (
                            <div className={styles.optionsRow}>
                                <small>Options (comma separated):</small>
                                <input
                                    type="text"
                                    placeholder="e.g., Male, Female, Other"
                                    value={field.options?.join(', ') || ''}
                                    onChange={(e) => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                                    className={styles.input}
                                />
                            </div>
                        )}

                        <div className={styles.reqRow}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(index, 'required', e.target.checked)}
                                /> Required?
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addField} className={styles.addBtn}>+ Add Field</button>
            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
                <button onClick={handleSave} className={styles.saveBtn}>Save Form</button>
            </div>
        </div>
    );
}
