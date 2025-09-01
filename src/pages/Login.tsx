import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'wouter'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState<'admin' | 'store' | null>(null)
  
  const { login, user } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const type = urlParams.get('type') as 'admin' | 'store' | null
    setLoginType(type)
  }, [])

  // Redirecionar se já estiver logado
  if (user) {
    if (user.role === 'super_admin') {
      setLocation('/admin')
    } else if (user.role === 'store_owner') {
      setLocation('/dashboard')
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      // O redirecionamento será feito automaticamente pelo App.tsx
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            FidelizaPontos
          </h1>
          <p className="text-gray-600">
            {loginType === 'admin' ? 'Acesso Administrador' : 
             loginType === 'store' ? 'Acesso Lojista' : 
             'Sistema de Gestão de Fidelidade'}
          </p>
        </div>

        <div className="card max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="Digite sua senha"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full h-12 text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-dots mr-2">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {loginType === 'admin' && (
                <>
                  <p><strong>Acesso Administrador:</strong></p>
                  <p>Email: admin@fidelizapontos.com</p>
                  <p>Senha: Admin@2024!Secure</p>
                </>
              )}
              {loginType === 'store' && (
                <>
                  <p><strong>Acesso Lojista (Teste):</strong></p>
                  <p>Email: loja@teste.com</p>
                  <p>Senha: CzXwa42xc3Kh</p>
                </>
              )}
              {!loginType && (
                <>
                  <p><strong>Credenciais de Teste:</strong></p>
                  <p><strong>Admin:</strong> admin@fidelizapontos.com / Admin@2024!Secure</p>
                  <p><strong>Loja:</strong> loja@teste.com / CzXwa42xc3Kh</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Sistema SaaS de Fidelidade Multilojas</p>
          <p className="mt-2">
            <a href="https://fidelizaa.com.br" className="text-primary-600 hover:text-primary-700">
              fidelizaa.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
