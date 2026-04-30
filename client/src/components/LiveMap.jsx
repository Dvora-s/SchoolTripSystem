
import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const makeIcon = (color, label) => new L.DivIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="background:white;padding:1px 5px;border-radius:4px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.3)">${label}</div>
        <div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 12],
    popupAnchor: [0, -20],
});

const playAlert = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
};

// haversine - מחשב מרחק בק"מ בין שתי נקודות על כדור הארץ
// משתמש בנוסחת Haversine שמתחשבת בעקמומיות כדור הארץ
const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function LiveMap({ className, teacherId }) {
    const [locations, setLocations] = useState([]);   // מיקומים מהשרת
    const [alerts, setAlerts] = useState([]);          // התראות פעילות
    const [history, setHistory] = useState({});        // היסטוריית התרחקויות { [studentId]: { name, count } }
    const alertedRef = useRef({});                     // עוקב אחרי מי כבר קיבלה התראה (למניעת כפילויות)

    // fetchLocations - שולף מיקומים מהשרת ובודק חריגות
    const fetchLocations = useCallback(async () => {
        try {
            const res = await fetch(`/api/locations/${className}?teacherId=${teacherId}`);
            const data = await res.json();
            if (!Array.isArray(data)) return;
            setLocations(data);

            const teacher = data.find(s => s.Role === 'teacher');
            if (!teacher) return;
            data.filter(s => s.Role === 'student').forEach(student => {
                const dist = haversine(teacher.Latitude, teacher.Longitude, student.Latitude, student.Longitude);
                if (dist >= 3) {
                    if (!alertedRef.current[student.ID]) {
                        alertedRef.current[student.ID] = true;
                        const alertId = Date.now() + student.ID;
                        playAlert();
                        setAlerts(prev => [...prev, { id: alertId, studentId: student.ID, name: student.FullName, dist: dist.toFixed(2) }]);
                        setHistory(prev => ({
                            ...prev,
                            [student.ID]: { name: student.FullName, count: (prev[student.ID]?.count || 0) + 1 }
                        }));
                    }
                } else {
                    // חזרה לטווח — אפס דגל כדי שתוכל לקבל התראה שוב בעתיד
                    alertedRef.current[student.ID] = false;
                }
            });
        } catch (err) {
            console.error('שגיאה בטעינת מיקומים:', err);
        }
    }, [className, teacherId]);

    // callStudentBack - נקראת כשהמורה לוחצת "קראי לה להתקרב"
    // סוגרת את ההתראה ושולחת POST לשרת שמפעיל חזרה מונפשת בסימולציה
    const callStudentBack = async (alertId, studentId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        alertedRef.current[studentId] = false;
        await fetch(`/api/locations/callback/${studentId}`, { method: 'POST' });
    };

    // רענון אוטומטי כל 20 שניות
    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 20000);
        return () => clearInterval(interval);
    }, [fetchLocations]);

    if (locations.length === 0)
        return <p className="empty" style={{ marginTop: '2rem' }}>טוען מיקומים...</p>;

    const center = [locations[0].Latitude, locations[0].Longitude];

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3>מיקומים בזמן אמת — כיתה {className}</h3>

            {/* התראות ריחוק — מוצגות בפינה שמאל עליונה, נשארות עד סגירה ידנית */}
            <div style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {alerts.map(alert => (
                    <div key={alert.id} style={{
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        color: 'white',
                        padding: '0.85rem 1.1rem',
                        borderRadius: '12px',
                        boxShadow: '0 6px 20px rgba(220,38,38,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        minWidth: '300px',
                        animation: 'fadeIn 0.3s ease-out',
                    }}>
                        <span style={{ fontSize: '0.95rem' }}>⚠️ <strong>{alert.name}</strong> התרחקה {alert.dist} ק"מ!</span>
                        <button onClick={() => callStudentBack(alert.id, alert.studentId)}
                            style={{
                                marginRight: 'auto',
                                background: 'white',
                                border: 'none',
                                color: '#dc2626',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                            }}>📣 קראי לה להתקרב</button>
                    </div>
                ))}
            </div>

            {/* מפה */}
            <MapContainer center={center} zoom={14} style={{ height: '480px', borderRadius: '14px' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {locations.map(s => (
                    <Marker key={s.ID} position={[s.Latitude, s.Longitude]}
                        icon={makeIcon(
                            s.Role === 'teacher' ? '#dc2626' : '#2563eb',
                            s.Role === 'teacher' ? `👩🏫 ${s.FullName}` : s.FullName
                        )}>
                        <Popup>
                            <strong>{s.FullName}</strong>{s.Role === 'teacher' && ' (מורה)'}<br />
                            <small>ת"ז: {s.ID}</small><br />
                            <small>עדכון אחרון: {new Date(s.UpdatedAt).toLocaleTimeString('he-IL')}</small>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* היסטוריית התרחקויות — מוצגת רק אם יש נתונים */}
            {Object.keys(history).length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                    <h3>היסטוריית התרחקויות</h3>
                    <table>
                        <thead>
                            <tr><th>שם תלמידה</th><th>מספר פעמים</th></tr>
                        </thead>
                        <tbody>
                            {Object.entries(history)
                                .sort((a, b) => b[1].count - a[1].count)
                                .map(([id, { name, count }]) => (
                                    <tr key={id}>
                                        <td>{name}</td>
                                        <td style={{
                                            textAlign: 'center',
                                            color: count >= 3 ? '#dc2626' : 'inherit',
                                            fontWeight: count >= 3 ? 'bold' : 'normal'
                                        }}>{count} {count >= 3 && '⚠️'}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
