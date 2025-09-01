import { Router, Route, Switch, useLocation } from 'wouter'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/admin/Dashboard'
import StoreOwnerDashboard from './pages/store/Dashboard'
import StorePage from './pages/store/StorePage'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { user, isLoading } = useAuth()
  const [, setLocation] = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/loja/:slug">
        {(params) => <StorePage slug={params.slug} />}
      </Route>
      
      {/* Rotas protegidas */}
      {user?.role === 'super_admin' && (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/*" component={AdminDashboard} />
        </>
      )}
      
      {user?.role === 'store_owner' && (
        <>
          <Route path="/dashboard" component={StoreOwnerDashboard} />
          <Route path="/dashboard/*" component={StoreOwnerDashboard} />
        </>
      )}
      
      {/* Rota padrão */}
      <Route>
        {() => {
          if (!user) {
            return <LandingPage />
          }
          
          // Redirecionar baseado no role
          if (user.role === 'super_admin') {
            setLocation('/admin')
          } else if (user.role === 'store_owner') {
            setLocation('/dashboard')
          }
          
          return <div>Redirecionando...</div>
        }}
      </Route>
    </Switch>
  )
}

export default App
