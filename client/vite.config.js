/*
 * vite.config.js - הגדרות סביבת הפיתוח
 * ----------------------------------------
 * קובץ זה אחראי על הגדרות Vite - כלי הבנייה של הפרויקט.
 * החלק החשוב כאן הוא ה-proxy: כל בקשה שיוצאת מהלקוח ל-/api
 * מועברת אוטומטית לשרת על פורט 3001.
 * כך אם הפורט של השרת ישתנה - משנים רק כאן, ולא בכל הקוד.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // כל בקשה שמתחילה ב-/api תועבר לשרת על פורט 3001
      '/api': 'http://localhost:3001',
    },
  },
})
