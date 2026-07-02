import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import './pages.css'

const savedTheme = window.localStorage.getItem('lifefundies-theme')
document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
