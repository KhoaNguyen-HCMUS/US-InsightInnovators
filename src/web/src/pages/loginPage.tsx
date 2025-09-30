import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { login } from '..//services/auth'
import { saveAuthData } from '../utils/authStorage'
import { toast } from 'react-toastify'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login({ email, password })
      if (res.success && res.data) {
        saveAuthData({ access_token: res.data.token as string, email: res.data.user.email as string })
        navigate('/dashboard')
        toast.success('Login successful')
        // window.location.reload()
      } else {
        toast.error(res.message || 'Login failed')
      }
    } catch {
      toast.error( 'Login error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-linear-(--gradient-primary) text-text-body ">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-header" >Welcome back</h1>
          <p className="mt-2 text-sm text-text-muted" >Log in to continue to your dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl p-6 border bg-bg-card border-border-light">
          <div className="space-y-1">
            <label className="text-sm text-text-muted" >Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md px-3 py-2 border outline-none focus:ring-4 bg-bg text-text-body border-border-light box-shadow-none"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" >Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md px-3 py-2 border outline-none focus:ring-4 bg-bg text-text-body border-border-light box-shadow-none"
              placeholder="Enter your password"
              />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="h-4 w-4" />
              <label htmlFor="remember" className="text-text-muted" >Remember me</label>
            </div>
            <a href="#" className="underline text-link-hover" >Forgot password?</a>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-md px-4 py-2 font-medium bg-primary text-primary-contrast disabled:opacity-60">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm" >
          Don’t have an account? <Link to="/register" className="underline text-link-hover" >Sign up</Link>
        </div>
      </div>
    </div>
  )
}



