import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/lexend'
import './styles.css'
import './theme.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
