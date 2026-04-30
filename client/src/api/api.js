//שכבת התקשורת עם השרת
const API = 'http://localhost:3001/api';

export const registerStudent = async (data) => {
    try {
        const res = await fetch(`${API}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const d = await res.json();
        return { ok: res.ok, data: d };
    } catch (err) {
        return { ok: false, data: { error: "שגיאת תקשורת עם השרת" } };
    }
};
export const registerTeacher = async (data) => {
    try {
        const res = await fetch(`${API}/teachers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const d = await res.json();
        return { ok: res.ok, data: d };
    } catch (err) {
        return { ok: false, data: { error: "שגיאת תקשורת עם השרת" } };
    }
};
export const loginTeacher = async (id) => {
    try {
        const res = await fetch(`${API}/teachers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        const d = await res.json();
        return { ok: res.ok, data: d };
    } catch (err) {
        return { ok: false, data: { error: "שגיאת תקשורת עם השרת" } };
    }
};

export const getAllStudents = async () => {
    const res = await fetch(`${API}/students`);
    return await res.json();
};

export const getStudentsByClass = async (teacherId) => {
    const res = await fetch(`${API}/teachers/${teacherId}/students`);
    return await res.json();
};

export const getLiveLocations = async (className) => {
    const res = await fetch(`${API}/locations/${className}`);
    return await res.json();
};
