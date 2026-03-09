import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import './globals.css'

export const metadata = {
  title: 'Restroom Reviewer',
  description: 'Find and review restrooms around the world',
}

// Move viewport settings here
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          <Navbar />
          <div style={{ height: '60px' }} /> 
          <main style={{ 
            minHeight: 'calc(100vh - 60px)',
            position: 'relative'
          }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}