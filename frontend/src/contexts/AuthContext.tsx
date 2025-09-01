import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'store_owner'
  storeId?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  impersonateStoreOwner: (storeId: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Recuperar token do localStorage ao carregar
    const savedToken = localStorage.getItem('fideliza_token')
    const savedUser = localStorage.getItem('fideliza_user')
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Erro ao recuperar dados de autenticação:', error)
        localStorage.removeItem('fideliza_token')
        localStorage.removeItem('fideliza_user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { apiService } = await import('../services/api');
      const data = await apiService.login(email, password);
      
      setToken(data.token)
      setUser(data.user as User)
      
      // Salvar no localStorage
      localStorage.setItem('fideliza_token', data.token)
      localStorage.setItem('fideliza_user', JSON.stringify(data.user))
    } catch (error) {
      throw error;
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('fideliza_token')
    localStorage.removeItem('fideliza_user')
  }

  const impersonateStoreOwner = async (storeId: string): Promise<void> => {
    try {
      const { apiService } = await import('../services/api');
      const data = await apiService.impersonateStoreOwner(storeId);
      
      setToken(data.token)
      setUser(data.user as User)
      
      // Salvar no localStorage
      localStorage.setItem('fideliza_token', data.token)
      localStorage.setItem('fideliza_user', JSON.stringify(data.user))
    } catch (error) {
      throw error;
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    impersonateStoreOwner,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
