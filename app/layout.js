import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import './globals.css'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

export const metadata = {
  title: 'Restroom Reviewer',
  description: 'Find and review restrooms',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}