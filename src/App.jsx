import { useRef, useState } from 'react'
import './App.css'
import AuthView from './pages/AuthView'
import ListingCards from './pages/ListingCards'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [user, setUser] = useState(null)
  const [pinVerified, setPinVerified] = useState(false)
  const [currentPage, setCurrentPage] = useState('authview')
  const [loginAttempts, setLoginAttempts] = useState({})
  const [blockedLogins, setBlockedLogins] = useState([])
  const usersLogins = useRef([])

  const generateSignInToken = () =>
    `token-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`

  const handleAuthenticated = ({ user: nextUser, pinVerified: verified }) => {
    setUser(nextUser)
    if (typeof verified === 'boolean') {
      setPinVerified(verified)
    }

    if (verified && nextUser) {
      const token = generateSignInToken()
      console.log(`Sign-in token for ${nextUser.email}:`, token)
      usersLogins.current = [
        ...usersLogins.current,
        {
          ...nextUser,
          token,
          signedInAt: new Date().toISOString(),
        },
      ]
      setLoginAttempts((prev) => {
        if (!prev[nextUser.email]) return prev
        const { [nextUser.email]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleSignOut = () => {
    setUser(null)
    setPinVerified(false)
    setCurrentPage('authview')
  }

  const handleFailedPinAttempt = (email) => {
    if (!email) return 0
    let attemptCount = 0
    setLoginAttempts((prev) => {
      attemptCount = (prev[email] ?? 0) + 1
      return { ...prev, [email]: attemptCount }
    })

    if (attemptCount >= 3) {
      setBlockedLogins((prev) =>
        prev.includes(email) ? prev : [...prev, email]
      )
    }

    return attemptCount
  }

  if (currentPage === 'listingcards') {
    if (!user || !pinVerified) {
      return (
        <AuthView
          onAuthenticated={handleAuthenticated}
          onNavigate={handleNavigate}
          blockedLogins={blockedLogins}
          onFailedPinAttempt={handleFailedPinAttempt}
          user={user}
        />
      )
    }

    return (
      <ErrorBoundary onError={(error) => console.error('ListingCards error:', error)}>
        <ListingCards
          user={user}
          onSignOut={handleSignOut}
          onNavigate={handleNavigate}
        />
      </ErrorBoundary>
    )
  }

  return (
    <AuthView
      onAuthenticated={handleAuthenticated}
      onNavigate={handleNavigate}
      blockedLogins={blockedLogins}
      onFailedPinAttempt={handleFailedPinAttempt}
      user={user}
    />
  )
}

export default App
