import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { Gallery } from '@/app/Gallery'

const root = document.getElementById('root')
if (!root) throw new Error('#root not found')
createRoot(root).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).has('gallery') ? <Gallery /> : <App />}
  </StrictMode>,
)
