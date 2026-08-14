import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const API_BASE = 'http://localhost:3000';

function App() {
  const [count, setCount] = useState(0)
  const [ticks, setTicks] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch ticks on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/ticks`)
      .then((r) => r.json())
      .then((data) => setTicks(data.ticks))
      .catch(() => {/* backend not running */})
  }, [])

  const addTick = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/ticks`, { method: 'POST' })
      const data = await res.json()
      setTicks(data.ticks)
    } finally {
      setLoading(false)
    }
  }

  const resetTicks = async () => {
    await fetch(`${API_BASE}/api/ticks`, { method: 'DELETE' })
    setTicks([])
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks">
        <h2>Ticks <span className="ticks-count">({ticks.length})</span></h2>
        <div className="ticks-actions">
          <button
            id="btn-add-tick"
            type="button"
            className="counter"
            onClick={addTick}
            disabled={loading}
          >
            {loading ? 'Adding…' : '+ Add Tick'}
          </button>
          <button
            id="btn-reset-ticks"
            type="button"
            className="counter reset"
            onClick={resetTicks}
            disabled={ticks.length === 0}
          >
            Reset
          </button>
        </div>
        {ticks.length === 0 ? (
          <p className="ticks-empty">No ticks yet — press <strong>Add Tick</strong> to start!</p>
        ) : (
          <ol id="ticks-list" className="ticks-list">
            {ticks.map((t) => (
              <li key={t} className="tick-item">Tick #{t}</li>
            ))}
          </ol>
        )}
      </div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>


      <section id="spacer"></section>
    </>
  )
}

export default App
