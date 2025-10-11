import { ThemeProvider } from './context/themeContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer, Bounce} from 'react-toastify';

import Navbar from './components/navbar'

import LandingPage from './pages/landingPage'
import LoginPage from './pages/loginPage'
import RegisterPage from './pages/registerPage'
import ProfilePage from './pages/profilePage'
import MealPlanPage from './pages/mealPlanPage'
import DashboardPage from './pages/dashboardPage'
import FoodRecognitionPage from './pages/foodRecognitionPage';
import SystemArchitectureDiagram from './pages/system-architecture-diagram';
import HealthAssistant from './pages/healthAssistant'; 

function App() {

  return (
    <ThemeProvider> 
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/meal-plans" element={<MealPlanPage />} />
          <Route path="/food-recognition" element={<FoodRecognitionPage />} />
          <Route path="/system-architecture" element={<SystemArchitectureDiagram />} />
          <Route path="/health-assistant" element={<HealthAssistant />} /> 
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