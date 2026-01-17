import { useState } from 'react'
import './App.css'
import AuthView from './pages/AuthView'
import ListingCards from './pages/ListingCards'

function App() {
  const [user, setUser] = useState(null)
  const [pinVerified, setPinVerified] = useState(false)
  const [currentPage, setCurrentPage] = useState('authview')

  const handleAuthenticated = ({ user: nextUser, pinVerified: verified }) => {
    setUser(nextUser)
    if (typeof verified === 'boolean') {
      setPinVerified(verified)
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

  if (currentPage === 'listingcards') {
    if (!user || !pinVerified) {
      return (
        <AuthView
          onAuthenticated={handleAuthenticated}
          onNavigate={handleNavigate}
          user={user}
        />
      )
    }

    return (
      <ListingCards
        user={user}
        onSignOut={handleSignOut}
        onNavigate={handleNavigate}
      />
    )
  }

  return (
    <AuthView
      onAuthenticated={handleAuthenticated}
      onNavigate={handleNavigate}
      user={user}
    />
  )
}

export default App
