import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './auth/login.jsx'

    const [email,setEmail]=useState('');
    const [username,setUsername]=useState('');
createRoot(document.getElementById('root')).render(
  
  <>
  <App/>
  <Login/>
  </>
)
