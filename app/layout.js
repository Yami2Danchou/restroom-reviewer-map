import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import './globals.css'

export const metadata = {
  title: 'Restroom Reviewer - Davao City',
  description: 'Find and review restrooms in Davao City',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <AuthProvider>
          <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Navbar />
            <main style={{ flex: 1, position: 'relative' }}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}