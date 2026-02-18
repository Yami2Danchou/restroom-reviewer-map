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