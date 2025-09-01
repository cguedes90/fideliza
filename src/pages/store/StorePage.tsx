import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import QRCode from 'qrcode'

interface StorePageProps {
  slug: string
}

interface Store {
  id: string
  name: string
  slug: string
  customUrl: string
  isActive: boolean
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  totalPoints: number
}

export default function StorePage({ slug }: StorePageProps) {
  const [store, setStore] = useState<Store | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loginForm, setLoginForm] = useState({ email: '', phone: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'login' | 'points' | 'rewards' | 'redemptions'>('login')

  useEffect(() => {
    const loadStore = async () => {
      try {
        const storeData = await apiService.getPublicStore(slug);
        setStore(storeData);
      } catch (error) {
        console.error('Erro ao carregar loja:', error);
        setStore(null);
      }
    };

    loadStore();
  }, [slug])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await apiService.customerLogin(slug, loginForm.email, loginForm.phone);
      setCustomer(data.customer);
      setActiveTab('points');
    } catch (err: any) {
      setError(err.message || 'Erro no login. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    setCustomer(null)
    setActiveTab('login')
    setLoginForm({ email: '', phone: '' })
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando loja...</p>
        </div>
      </div>
    )
  }

  if (!store.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Loja Temporariamente Indisponível
          </h1>
          <p className="text-gray-600">
            Esta loja está sendo atualizada. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">
                {store.name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Sistema de Fidelidade
              </p>
            </div>
            {customer && (
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!customer ? (
          <LoginSection
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            handleLogin={handleLogin}
            isLoading={isLoading}
            error={error}
            storeName={store.name}
          />
        ) : (
          <CustomerDashboard
            customer={customer}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            storeSlug={slug}
          />
        )}
      </div>
    </div>
  )
}

interface LoginSectionProps {
  loginForm: { email: string; phone: string }
  setLoginForm: (form: { email: string; phone: string }) => void
  handleLogin: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
  error: string
  storeName: string
}

function LoginSection({ loginForm, setLoginForm, handleLogin, isLoading, error, storeName }: LoginSectionProps) {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Bem-vindo à {storeName}
        </h2>
        <p className="mt-2 text-gray-600">
          Faça login para ver seus pontos e recompensas
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email (opcional)
            </label>
            <input
              id="email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="input w-full"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefone (opcional)
            </label>
            <input
              id="phone"
              type="tel"
              value={loginForm.phone}
              onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
              className="input w-full"
              placeholder="(11) 99999-9999"
              disabled={isLoading}
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>
              * Informe ao menos um meio de contato (email ou telefone) para acessar sua conta de fidelidade.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!loginForm.email && !loginForm.phone)}
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
              'Acessar Minha Conta'
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by <strong>FidelizaPontos</strong></p>
        <p className="mt-1">Sistema de Fidelidade Multilojas</p>
      </div>
    </div>
  )
}

interface CustomerDashboardProps {
  customer: Customer
  activeTab: 'login' | 'points' | 'rewards' | 'redemptions'
  setActiveTab: (tab: 'login' | 'points' | 'rewards' | 'redemptions') => void
}

function CustomerDashboard({ customer, activeTab, setActiveTab, storeSlug }: CustomerDashboardProps & { storeSlug: string }) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Olá, {customer.name}!
          </h2>
          <div className="mt-4">
            <p className="text-sm opacity-90">Seus pontos disponíveis</p>
            <p className="text-4xl font-bold mt-1">
              {customer.totalPoints}
            </p>
            <p className="text-sm opacity-90">pontos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex justify-center space-x-8">
        {[
          { id: 'points' as const, label: 'Meus Pontos' },
          { id: 'rewards' as const, label: 'Recompensas' },
          { id: 'redemptions' as const, label: 'Meus Resgates' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      {activeTab === 'points' && <PointsTab customer={customer} />}
      {activeTab === 'rewards' && <RewardsTab customer={customer} storeSlug={storeSlug} />}
      {activeTab === 'redemptions' && <RedemptionsTab customer={customer} />}
    </div>
  )
}

function PointsTab({ customer }: { customer: Customer }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await apiService.getCustomerTransactions(customer.id);
        setTransactions(data);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [customer.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 text-center">
        Histórico de Pontos
      </h3>
      
      {transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    transaction.type === 'earned' ? 'bg-green-100' :
                    transaction.type === 'redeemed' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      transaction.type === 'earned' ? 'text-green-600' :
                      transaction.type === 'redeemed' ? 'text-red-600' : 'text-yellow-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={transaction.type === 'earned' ? 'M12 4v16m8-8H4' : 'M18 12H6'} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description || (
                        transaction.type === 'earned' ? 'Pontos ganhos' :
                        transaction.type === 'redeemed' ? 'Pontos resgatados' : 'Ajuste'
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-lg font-semibold ${
                  transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            <h4 className="mt-2 text-sm font-medium text-gray-900">Nenhuma movimentação</h4>
            <p className="mt-1 text-sm text-gray-500">
              Seu histórico de pontos aparecerá aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function RedemptionsTab({ customer }: { customer: Customer }) {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRedemptions = async () => {
      try {
        const data = await apiService.getCustomerRedemptions(customer.id);
        setRedemptions(data);
      } catch (error) {
        console.error('Erro ao carregar resgates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRedemptions();
  }, [customer.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ Pendente';
      case 'completed': return '✅ Utilizado';
      case 'cancelled': return '❌ Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 text-center">
        Histórico de Resgates
      </h3>
      
      {redemptions.length > 0 ? (
        <div className="space-y-4">
          {redemptions.map((redemption) => (
            <div key={redemption.id} className="card border-2 border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">
                    {redemption.rewardName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(redemption.redeemedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(redemption.status)}`}>
                  {getStatusText(redemption.status)}
                </span>
              </div>

              {redemption.notes && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700">
                    <strong>💳 {redemption.notes}</strong>
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {redemption.status === 'pending' ? 'Aguardando uso' : 
                   redemption.completedAt ? `Usado em ${new Date(redemption.completedAt).toLocaleDateString('pt-BR')}` :
                   'Resgatado'}
                </span>
                <span className="text-lg font-semibold text-red-600">
                  -{redemption.pointsUsed} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <h4 className="mt-2 text-sm font-medium text-gray-900">Nenhum resgate realizado</h4>
            <p className="mt-1 text-sm text-gray-500">
              Seus resgates de recompensas aparecerão aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function RewardsTab({ customer, storeSlug }: { customer: Customer; storeSlug: string }) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [currentRedemption, setCurrentRedemption] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const data = await apiService.getPublicRewards(storeSlug);
        setRewards(data);
      } catch (error) {
        console.error('Erro ao carregar recompensas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, [storeSlug]);

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      const result = await apiService.redeemReward(customer.id, rewardId);
      setCurrentRedemption(result.redemption);
      
      // Gerar QR Code com o código do resgate
      const qrUrl = await QRCode.toDataURL(result.redemption.code, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrUrl);
      
      setShowRedemptionModal(true);
      
      // Atualizar pontos do cliente localmente
      customer.totalPoints = result.newBalance;
      
    } catch (error: any) {
      alert(error.message || 'Erro ao resgatar recompensa');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 text-center">
        Recompensas Disponíveis
      </h3>
      
      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="card border-2 border-gray-200 hover:border-primary-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-medium text-gray-900">{reward.name}</h4>
                <span className="text-2xl font-bold text-primary-600">{reward.pointsRequired}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{reward.description || 'Recompensa exclusiva da loja'}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{reward.pointsRequired} pontos</span>
                <button 
                  onClick={() => handleRedeem(reward.id)}
                  disabled={customer.totalPoints < reward.pointsRequired || redeeming === reward.id}
                  className={`btn-sm ${
                    customer.totalPoints >= reward.pointsRequired 
                      ? 'btn-primary' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {redeeming === reward.id ? 'Resgatando...' : 
                   customer.totalPoints >= reward.pointsRequired ? 'Resgatar' : 'Pontos Insuficientes'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <h4 className="mt-2 text-sm font-medium text-gray-900">Nenhuma recompensa disponível</h4>
            <p className="mt-1 text-sm text-gray-500">
              Recompensas criadas pela loja aparecerão aqui.
            </p>
          </div>
        </div>
      )}

      {/* Modal de Sucesso do Resgate */}
      {showRedemptionModal && currentRedemption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              {/* Ícone de sucesso */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                🎉 Resgate Realizado!
              </h3>
              
              <p className="text-gray-600 mb-4">
                Sua recompensa <strong>"{currentRedemption.reward}"</strong> foi resgatada com sucesso!
              </p>

              {/* QR Code e Código */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-700 mb-4">
                    <strong>📱 Apresente este QR Code na loja:</strong>
                  </p>
                  
                  {qrCodeUrl && (
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
                      <img src={qrCodeUrl} alt="QR Code do resgate" className="w-32 h-32 mx-auto" />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-600 mb-3">
                    <strong>Ou informe o código:</strong>
                  </p>
                  <div className="text-lg font-mono font-bold text-primary-600 bg-white px-3 py-2 rounded border-2 border-dashed border-primary-300">
                    {currentRedemption.code}
                  </div>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>📋 Como usar:</strong><br />
                  {currentRedemption.instructions}
                </p>
              </div>

              {/* Informações do resgate */}
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Pontos utilizados:</span>
                  <span className="font-semibold text-red-600">-{currentRedemption.pointsUsed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saldo atual:</span>
                  <span className="font-semibold text-green-600">{customer.totalPoints}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowRedemptionModal(false);
                  setCurrentRedemption(null);
                }}
                className="btn-primary w-full"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

