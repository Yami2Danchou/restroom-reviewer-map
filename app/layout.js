import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import './globals.css'

// Import Leaflet CSS here instead of in the component
import 'leaflet/dist/leaflet.css'

export const metadata = {
  title: 'Restroom Reviewer - Davao City',
  description: 'Find and review restrooms in Davao City',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}