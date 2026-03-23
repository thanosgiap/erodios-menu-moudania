'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid username or password')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <main style={{
      minHeight:      '100vh',
      background:     '#F7F3EE',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontFamily:     '"Jost", sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Philosopher&family=Jost:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { outline: none; }
        input:focus { border-color: rgba(122,106,85,0.6) !important; }
      `}</style>

      <div style={{
        width:        '100%',
        maxWidth:     '360px',
        padding:      '0 1.5rem',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily:    '"Philosopher", serif',
            fontWeight:    400,
            fontSize:      '2.2rem',
            color:         '#2C2820',
            marginBottom:  '0.3rem',
          }}>
            Erodios
          </h1>
          <p style={{
            fontSize:      '11px',
            fontWeight:    300,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color:         '#7A6A55',
          }}>
            Manager Access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display:       'block',
              fontSize:      '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color:         '#7A6A55',
              marginBottom:  '6px',
              fontWeight:    300,
            }}>
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              style={{
                width:        '100%',
                padding:      '10px 12px',
                background:   'transparent',
                border:       '0.5px solid rgba(122,106,85,0.4)',
                borderRadius: '2px',
                fontSize:     '14px',
                fontFamily:   'inherit',
                color:        '#2C2820',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display:       'block',
              fontSize:      '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color:         '#7A6A55',
              marginBottom:  '6px',
              fontWeight:    300,
            }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              style={{
                width:        '100%',
                padding:      '10px 12px',
                background:   'transparent',
                border:       '0.5px solid rgba(122,106,85,0.4)',
                borderRadius: '2px',
                fontSize:     '14px',
                fontFamily:   'inherit',
                color:        '#2C2820',
              }}
            />
          </div>

          {error && (
            <p style={{
              fontSize:     '12px',
              color:        '#9B3A2A',
              marginBottom: '1rem',
              textAlign:    'center',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width:         '100%',
              padding:       '11px',
              background:    '#2C2820',
              color:         '#F7F3EE',
              border:        'none',
              borderRadius:  '2px',
              fontSize:      '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily:    'inherit',
              cursor:        loading ? 'not-allowed' : 'pointer',
              opacity:       loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </main>
  )
}