import { useMemo, useState } from 'react'

const VALID_PIN = '1234'

const generateUserId = (email) => {
  const seed = email.replace(/[^a-z0-9]/gi, '').slice(0, 6).toLowerCase()
  return `google-${seed || 'user'}-${Math.floor(Math.random() * 900 + 100)}`
}

export default function AuthView({
  onAuthenticated,
  onNavigate,
  user,
  blockedLogins = [],
  onFailedPinAttempt,
}) {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [pinError, setPinError] = useState('')

  const canSignIn = email.trim().length > 3 && email.includes('@')

  const signedInUser = useMemo(() => {
    if (user) return user
    return null
  }, [user])

  const handleGoogleSignIn = () => {
    setError('')
    if (!canSignIn) {
      setError('Enter your Google email to continue.')
      return
    }

    const normalizedEmail = email.trim()
    const displayName = normalizedEmail.split('@')[0]
    const nextUser = {
      name: displayName || 'Google User',
      email: normalizedEmail,
      id: generateUserId(normalizedEmail),
    }

    onAuthenticated({ user: nextUser, pinVerified: false })
  }

  const handlePinSubmit = () => {
    setPinError('')
    if (!pin.trim()) {
      setPinError('Enter the 4-digit PIN sent to your email.')
      return
    }

    if (signedInUser && blockedLogins.includes(signedInUser.email)) {
      setPinError('Your account is blocked due to too many failed attempts.')
      return
    }

    if (pin.trim() !== VALID_PIN) {
      const attempts = onFailedPinAttempt?.(signedInUser?.email) ?? 0
      if (attempts >= 3) {
        setPinError('Too many incorrect attempts. Your account is blocked.')
      } else {
        setPinError('Incorrect PIN. Please try again.')
      }
      return
    }

    if (signedInUser) {
      onAuthenticated({ user: signedInUser, pinVerified: true })
      onNavigate('listingcards')
    }
  }

  return (
    <div className="page">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Welcome</p>
          <h1>Sign in to FriendlyEats</h1>
          <p className="subtext">
            Use Google sign-in and a secure PIN to unlock curated restaurant
            cards.
          </p>
        </div>

        <div className="auth-section">
          <label htmlFor="email">Google email</label>
          <input
            id="email"
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="button" className="primary" onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>
        </div>

        {signedInUser && (
          <div className="auth-section">
            <div className="signed-in">
              <span className="status-dot" />
              Signed in as <strong>{signedInUser.email}</strong>
            </div>
            <label htmlFor="pin">Enter PIN</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              placeholder="1234"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
            {pinError && <p className="error-text">{pinError}</p>}
            <button type="button" className="primary" onClick={handlePinSubmit}>
              Verify PIN
            </button>
            <p className="helper">Demo PIN: 1234</p>
          </div>
        )}
      </div>
    </div>
  )
}
