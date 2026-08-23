import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import AppLayout from '@/components/AppLayout';

export const metadata = {
  title: 'Gakkou No Shiken (学校の試験) | Official Japanese Exam Portal',
  description:
    'Practice official Computer-Based Testing (CBT) mock tests for JFT-Basic & Specified Skilled Worker (SSW) exams with authentic Prometric UI, audio listening, and instant scoring.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <head>
        <link rel="icon" type="image/png" href="/img/logo.png" />
        {/* Leaflet CSS for maps */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Leaflet JS */}
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          defer
        ></script>
      </head>
      <body className="flex flex-col min-h-full text-slate-800 bg-slate-50 antialiased font-sans selection:bg-red-500 selection:text-white relative overflow-x-hidden bg-grid-mesh">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
