import { createRoot } from 'react-dom/client'
import 
import './index.css'
import App from './App.jsx'
import Login from './auth/login.jsx'
import Register from './auth/register.jsx'
createRoot(document.getElementById('root')).render(
  <>
  <App/>
  <Login/>
  <Register/>
  </>
)
