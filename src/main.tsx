import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import StudyPlanPage from './components/StudyPlanPage.tsx'
import './index.css'

const redirectedPath = sessionStorage.getItem('spa:redirect')
if (redirectedPath) {
  sessionStorage.removeItem('spa:redirect')
  window.history.replaceState(null, '', redirectedPath)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/study-plan" element={<StudyPlanPage showHeader />} />
        <Route path="/" element={<App />} />
        <Route path="/:school" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)


