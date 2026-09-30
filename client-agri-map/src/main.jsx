import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/design-tokens.css'
import './index.css'
import { UserProvider } from './contexts/UserContext'
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
    <UserProvider>
    <App />
    </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
)
