import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { register } from '../services/auth'
import { saveAuthData } from '../utils/authStorage'
import { toast } from 'react-toastify'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await register({ full_name: name, email, password })
      if (res.success && res.data) {
        saveAuthData({ access_token: res.data.access_token, full_name: res.data.full_name, email: res.data.email })
        toast.success('Register successful. Please login to continue.')
        navigate('/login')
      } else {
        toast.error(res.message || 'Register failed')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Register error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-linear-(--gradient-primary) text-text-body ">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-header" >Create your account</h1>
          <p className="mt-2 text-sm text-text-muted" >Join students tracking their progress with clarity</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl p-6 border bg-bg-card border-border-light">
          <div className="space-y-1">
            <label className="text-sm text-text-muted" >Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md px-3 py-2 border outline-none focus:ring-4 bg-bg text-text-body border-border-light box-shadow-none"
              placeholder="Enter your full name"
            />
          </div>
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
          <button type="submit" disabled={loading} className="w-full rounded-md px-4 py-2 font-medium bg-primary text-primary-contrast disabled:opacity-60">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm" >
          Already have an account? <Link to="/login" className="underline text-link-hover" >Log in</Link>
        </div>
      </div>
    </div>
  )
}


