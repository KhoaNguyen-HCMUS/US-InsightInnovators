import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { isAuthenticated, getUserEmail, clearAuthData } from '../utils/authStorage'
import logo from '../../public/logo.png'
import ThemeToggle from './themeToggle'	

const navItems = [
	{path: '/dashboard', label: 'Dashboard'},
  { path: '/profile', label: 'Profile' },
  { path: '/meal-plans', label: 'Meal Plans' },
  { path: '/health-assistant', label: 'Health Assistant' },
  { path: '/food-recognition', label: 'Food Recognition' }
]

export default function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isAuth = isAuthenticated()
  const userName = getUserEmail()

  const handleLogout = () => {
    clearAuthData()
    window.location.href = '/login'
  }


  return (
    <nav className="sticky top-0 z-50 border-b bg-bg border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Studium" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-xl text-text-header">
             NUTRIVIET AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuth && (
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-primary ${
                    location.pathname === item.path
                      ? 'bg-primary hover:bg-primary-hover hover:text-white text-primary-contrast'
                      : 'hover:opacity-80'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {isAuth ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-bg-hover">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white bg-secondary">
                    {userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-text-body font-medium">
                    {userName || 'User'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 rounded-md transition-all font-medium shadow-md hover:shadow-lg bg-primary hover:bg-primary-hover hover:text-white text-primary-contrast"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm px-4 py-2 rounded-md border-2 transition-colors text-text-body border-primary bg-transparent hover:bg-primary hover:text-white font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-4 py-2 rounded-md transition-all font-medium shadow-md hover:shadow-lg bg-primary hover:bg-primary-hover hover:text-white text-primary-contrast"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-body p-2 rounded-md"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border-light">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuth && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors text-primary ${
                    location.pathname === item.path
                      ? 'bg-primary hover:bg-primary-hover hover:text-white text-primary-contrast'
                      : 'hover:opacity-80'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                {/* Theme Toggle Mobile */}
                <div className="px-3 py-2">
                  <ThemeToggle />
                </div>
                
                {isAuth ? (
                  <>
                    <Link to="/profile" className="flex items-center space-x-2 px-3 py-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white bg-secondary">
                        {userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm text-text-body font-medium">
                        {userName || 'User'}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center px-4 py-3 text-sm rounded-md transition-all font-medium shadow-md hover:shadow-lg bg-primary hover:bg-primary-hover hover:text-white text-primary-contrast"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-sm rounded-md border-2 transition-colors text-text-body border-primary bg-transparent hover:bg-primary hover:text-white font-medium text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-sm rounded-md transition-all font-medium shadow-md hover:shadow-lg text-center bg-primary hover:bg-primary-hover hover:text-white text-primary-contrast"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
