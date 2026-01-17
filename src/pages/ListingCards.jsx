import { useEffect, useMemo, useState } from 'react'

const CATEGORY_OPTIONS = [
  'Vegan',
  'Açai & Bowls',
  'Italian/Pizza',
  'Japanese',
  'Mexican',
  'Arabic',
  'Argentine',
  'Barbeque',
  'Chicken Shop',
  'Fast Food',
  'Grocery',
  'Sandwich Shop',
  'Desserts',
  'Bakery/Cafe',
  'Bar',
  'Casual/Local',
]

const uniqueValues = (list, key) =>
  Array.from(new Set(list.map((item) => item[key]))).sort()

export default function ListingCards({ user, onSignOut, onNavigate }) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [category, setCategory] = useState('')
  const [stars, setStars] = useState('')

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        setLoadError('')
        const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

        if (!projectId || !apiKey) {
          setLoadError('Missing Firebase configuration.')
          setRestaurants([])
          return
        }

        const fetchAllDocuments = async () => {
          let nextPageToken = ''
          const allDocs = []

          do {
            const params = new URLSearchParams({
              key: apiKey,
              pageSize: '1000',
            })

            if (nextPageToken) {
              params.set('pageToken', nextPageToken)
            }

            const response = await fetch(
              `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/restaurants?${params.toString()}`
            )

            if (!response.ok) {
              throw new Error(`Request failed: ${response.status}`)
            }

            const payload = await response.json()
            const docs = Array.isArray(payload.documents) ? payload.documents : []
            allDocs.push(...docs)
            nextPageToken = payload.nextPageToken ?? ''
          } while (nextPageToken)

          return allDocs
        }

        const docs = await fetchAllDocuments()

        const getFieldValue = (field) => {
          if (!field) return ''
          if (field.stringValue !== undefined) return field.stringValue
          if (field.integerValue !== undefined)
            return Number(field.integerValue)
          if (field.doubleValue !== undefined) return Number(field.doubleValue)
          if (field.booleanValue !== undefined) return field.booleanValue
          if (field.arrayValue?.values) {
            return field.arrayValue.values.map((value) => getFieldValue(value))
          }
          if (field.mapValue?.fields) {
            return Object.fromEntries(
              Object.entries(field.mapValue.fields).map(([key, value]) => [
                key,
                getFieldValue(value),
              ])
            )
          }
          return ''
        }

        const data = docs.map((doc) => {
          const fields = doc.fields ?? {}
          const id = doc.name?.split('/').pop() ?? ''
          const categories = getFieldValue(fields.categories)
          const normalizedCategories = Array.isArray(categories)
            ? categories
            : categories
              ? [categories]
              : []

          return {
            id,
            name: String(getFieldValue(fields.name) || 'Untitled'),
            city: String(getFieldValue(fields.city) || ''),
            state: String(getFieldValue(fields.state) || ''),
            country: String(getFieldValue(fields.country) || ''),
            rating: Number(getFieldValue(fields.rating) || 0),
            price:
              getFieldValue(fields.price) ||
              getFieldValue(fields.priceLevel) ||
              '',
            phone:
              getFieldValue(fields.phone) ||
              getFieldValue(fields.phoneNumber) ||
              '',
            address:
              getFieldValue(fields.address) ||
              getFieldValue(fields.location) ||
              '',
            photoUrl:
              getFieldValue(fields.photoUrl) ||
              getFieldValue(fields.photo) ||
              getFieldValue(fields.imageUrl) ||
              getFieldValue(fields.image) ||
              '',
            categories: normalizedCategories
              .map((value) => String(value))
              .filter(Boolean),
          }
        })

        setRestaurants(data)
      } catch (error) {
        console.error('Failed to load restaurants:', error)
        setLoadError('Unable to load restaurants from Firebase.')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const countries = useMemo(
    () => uniqueValues(restaurants, 'country'),
    [restaurants]
  )
  const states = useMemo(() => {
    const filtered = country
      ? restaurants.filter((item) => item.country === country)
      : restaurants
    return uniqueValues(filtered, 'state')
  }, [country, restaurants])
  const categories = useMemo(() => CATEGORY_OPTIONS, [])

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase()
    const minStars = stars ? Number(stars) : null

    return restaurants.filter((restaurant) => {
      const matchesQuery = query
        ? restaurant.name.toLowerCase().includes(query)
        : true
      const matchesCountry = country ? restaurant.country === country : true
      const matchesState = state ? restaurant.state === state : true
      const matchesCategory = category
        ? restaurant.categories?.includes(category)
        : true
      const matchesStars = minStars ? restaurant.rating >= minStars : true

      return (
        matchesQuery &&
        matchesCountry &&
        matchesState &&
        matchesCategory &&
        matchesStars
      )
    })
  }, [search, country, state, category, stars, restaurants])

  const handleSignOut = () => {
    onSignOut()
    onNavigate('authview')
  }

  return (
    <div className="page">
      <header className="listing-header">
        <div>
          <p className="eyebrow">FriendlyEats</p>
          <h1>Restaurant listings</h1>
          <p className="subtext">Use filters to discover your next favorite meal.</p>
        </div>
        <div className="user-card">
          <p className="user-label">Google User ID</p>
          <p className="user-id">{user?.id}</p>
          <p className="user-email">{user?.email}</p>
          <button type="button" onClick={handleSignOut} className="ghost">
            Sign out
          </button>
        </div>
      </header>

      <section className="filters">
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">All countries</option>
            {countries.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select value={state} onChange={(event) => setState(event.target.value)}>
            <option value="">All states</option>
            {states.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select value={stars} onChange={(event) => setStars(event.target.value)}>
            <option value="">All star ratings</option>
            {[5, 4, 3].map((value) => (
              <option key={value} value={value}>
                {value}+ stars
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="cards">
        {loading ? (
          <p className="empty">Loading restaurants...</p>
        ) : loadError ? (
          <p className="empty">{loadError}</p>
        ) : filteredRestaurants.length === 0 ? (
          <p className="empty">No restaurants match your filters.</p>
        ) : (
          <div className="card-grid">
            {filteredRestaurants.map((restaurant) => (
              <article key={restaurant.id} className="restaurant-card">
                {restaurant.photoUrl ? (
                  <img
                    src={restaurant.photoUrl}
                    alt={`Photo of ${restaurant.name}`}
                    className="card-photo"
                    loading="lazy"
                  />
                ) : (
                  <div className="card-photo placeholder">No photo</div>
                )}
                <div className="card-body">
                  <div className="card-top">
                    <h3>{restaurant.name}</h3>
                    <span className="rating">{restaurant.rating.toFixed(1)}</span>
                  </div>
                  <p className="card-meta">
                    {restaurant.address}
                    {restaurant.address ? ' · ' : ''}
                    {restaurant.city}
                    {restaurant.city ? ', ' : ''}
                    {restaurant.state}
                    {restaurant.state ? ' · ' : ''}
                    {restaurant.country}
                  </p>
                  <div className="card-details">
                    <span>Price: {restaurant.price || 'N/A'}</span>
                    <span>Phone: {restaurant.phone || 'N/A'}</span>
                    <span>ID: {restaurant.id}</span>
                  </div>
                  <div className="badge">
                    {restaurant.categories?.[0] || 'Casual/Local'}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
