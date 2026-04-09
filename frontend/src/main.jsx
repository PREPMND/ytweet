import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Register from './auth/register.jsx'
createRoot(document.getElementById('root')).render(
  <>
  <BrowserRouter>
    <App/>
  </BrowserRouter>
  </>
)
