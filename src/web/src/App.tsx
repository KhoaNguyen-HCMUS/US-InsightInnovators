import { ThemeProvider } from './context/themeContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer, Bounce} from 'react-toastify';


import Navbar from './components/navbar'

import LandingPage from './pages/landingPage'
import LoginPage from './pages/loginPage'
import RegisterPage from './pages/registerPage'

function App() {

  return (
    <ThemeProvider> 
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

        </Routes>
        <ToastContainer
                  position='top-right'
                  autoClose={2000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme='light'
                  transition={Bounce}
                />
        <ToastContainer />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
