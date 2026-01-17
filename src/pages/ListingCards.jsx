import { useMemo, useState } from 'react'

const RESTAURANTS = [
  {
    id: '001',
    name: 'Café Aurora',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    category: 'Cafe',
    rating: 4.6,
  },
  {
    id: '002',
    name: 'Pinelo Sandwich Co.',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    category: 'Sandwiches',
    rating: 4.3,
  },
  {
    id: '003',
    name: 'Tucan Bistro',
    city: 'Toronto',
    state: 'ON',
    country: 'Canada',
    category: 'Bistro',
    rating: 4.8,
  },
  {
    id: '004',
    name: 'Rio Verde',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brazil',
    category: 'Brazilian',
    rating: 4.2,
  },
  {
    id: '005',
    name: 'Midnight Udon',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    category: 'Japanese',
    rating: 4.7,
  },
]

const uniqueValues = (list, key) =>
  Array.from(new Set(list.map((item) => item[key]))).sort()

export default function ListingCards({ user, onSignOut, onNavigate }) {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [category, setCategory] = useState('')
  const [stars, setStars] = useState('')

  const countries = useMemo(() => uniqueValues(RESTAURANTS, 'country'), [])
  const states = useMemo(() => {
    const filtered = country
      ? RESTAURANTS.filter((item) => item.country === country)
      : RESTAURANTS
    return uniqueValues(filtered, 'state')
  }, [country])
  const categories = useMemo(() => uniqueValues(RESTAURANTS, 'category'), [])

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase()
    const minStars = stars ? Number(stars) : null

    return RESTAURANTS.filter((restaurant) => {
      const matchesQuery = query
        ? restaurant.name.toLowerCase().includes(query)
        : true
      const matchesCountry = country ? restaurant.country === country : true
      const matchesState = state ? restaurant.state === state : true
      const matchesCategory = category ? restaurant.category === category : true
      const matchesStars = minStars ? restaurant.rating >= minStars : true

      return (
        matchesQuery &&
        matchesCountry &&
        matchesState &&
        matchesCategory &&
        matchesStars
      )
    })
  }, [search, country, state, category, stars])

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
        {filteredRestaurants.length === 0 ? (
          <p className="empty">No restaurants match your filters.</p>
        ) : (
          <div className="card-grid">
            {filteredRestaurants.map((restaurant) => (
              <article key={restaurant.id} className="restaurant-card">
                <div className="card-top">
                  <h3>{restaurant.name}</h3>
                  <span className="rating">{restaurant.rating.toFixed(1)}</span>
                </div>
                <p className="card-meta">
                  {restaurant.city}, {restaurant.state} · {restaurant.country}
                </p>
                <div className="badge">{restaurant.category}</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
