import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

const redirectedPath = sessionStorage.getItem('spa:redirect')
if (redirectedPath) {
  sessionStorage.removeItem('spa:redirect')
  window.history.replaceState(null, '', redirectedPath)
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:school" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
