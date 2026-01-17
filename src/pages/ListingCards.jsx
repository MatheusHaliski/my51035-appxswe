import { useMemo, useState } from 'react'

const RESTAURANTS = [
  {
    id: '001',
    name: 'Café Aurora',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    category: 'Bakery/Cafe',
    rating: 4.6,
    price: '$$',
    phone: '+1 (415) 555-0194',
    address: '2140 Market St',
    photoUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '002',
    name: 'Pinelo Sandwich Co.',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    category: 'Sandwich Shop',
    rating: 4.3,
    price: '$',
    phone: '+1 (512) 555-0142',
    address: '705 Congress Ave',
    photoUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '003',
    name: 'Tucan Bistro',
    city: 'Toronto',
    state: 'ON',
    country: 'Canada',
    category: 'Casual/Local',
    rating: 4.8,
    price: '$$$',
    phone: '+1 (416) 555-0131',
    address: '118 King St W',
    photoUrl:
      'https://images.unsplash.com/photo-1421622548261-c45bfe178854?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '004',
    name: 'Rio Verde',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brazil',
    category: 'Casual/Local',
    rating: 4.2,
    price: '$$',
    phone: '+55 (11) 5555-0109',
    address: 'Av. Paulista, 1578',
    photoUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '005',
    name: 'Midnight Udon',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    category: 'Japanese',
    rating: 4.7,
    price: '$$',
    phone: '+1 (212) 555-0188',
    address: '92 Allen St',
    photoUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '006',
    name: 'Verde Vivo',
    city: 'Lisbon',
    state: 'LX',
    country: 'Portugal',
    category: 'Vegan',
    rating: 4.5,
    price: '$$',
    phone: '+351 555 0112',
    address: 'Rua das Flores, 44',
    photoUrl:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '007',
    name: 'Bella Trattoria',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    category: 'Italian/Pizza',
    rating: 4.4,
    price: '$$$',
    phone: '+1 (312) 555-0174',
    address: '300 W Adams St',
    photoUrl:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '008',
    name: 'Barrio Tacos',
    city: 'Mexico City',
    state: 'CDMX',
    country: 'Mexico',
    category: 'Mexican',
    rating: 4.6,
    price: '$',
    phone: '+52 55 5555 0133',
    address: 'Av. Reforma 120',
    photoUrl:
      'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '009',
    name: 'Al Noor Grill',
    city: 'Dubai',
    state: 'DU',
    country: 'UAE',
    category: 'Arabic',
    rating: 4.3,
    price: '$$',
    phone: '+971 4 555 0199',
    address: 'Jumeirah Beach Rd',
    photoUrl:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '010',
    name: 'Smokehouse 88',
    city: 'Nashville',
    state: 'TN',
    country: 'USA',
    category: 'Barbeque',
    rating: 4.1,
    price: '$$',
    phone: '+1 (615) 555-0167',
    address: '415 Broadway',
    photoUrl:
      'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=800&q=80',
  },
]

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
            name: getFieldValue(fields.name) || 'Untitled',
            city: getFieldValue(fields.city) || '',
            state: getFieldValue(fields.state) || '',
            country: getFieldValue(fields.country) || '',
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
            categories: normalizedCategories,
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
  }, [country])
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
                <img
                  src={restaurant.photoUrl}
                  alt={`Photo of ${restaurant.name}`}
                  className="card-photo"
                />
                <div className="card-body">
                  <div className="card-top">
                    <h3>{restaurant.name}</h3>
                    <span className="rating">{restaurant.rating.toFixed(1)}</span>
                  </div>
                  <p className="card-meta">
                    {restaurant.address} · {restaurant.city}, {restaurant.state} ·{' '}
                    {restaurant.country}
                  </p>
                  <div className="card-details">
                    <span>Price: {restaurant.price}</span>
                    <span>Phone: {restaurant.phone}</span>
                    <span>ID: {restaurant.id}</span>
                  </div>
                  <div className="badge">{restaurant.category}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
