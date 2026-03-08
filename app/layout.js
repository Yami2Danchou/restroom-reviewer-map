import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import './globals.css'

export const metadata = {
  title: 'Restroom Reviewer',
  description: 'Find and review restrooms in the world',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          <Navbar />
          {/* Spacer for fixed navbar - applies to all pages */}
          <div style={{ height: '80px' }} /> 
          <main style={{ 
            minHeight: 'calc(100vh - 80px)',
            position: 'relative'
          }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}