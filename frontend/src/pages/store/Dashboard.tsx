import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { apiService } from '../../services/api'

export default function StoreOwnerDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (user?.role !== 'store_owner') {
    return <div>Acesso negado</div>
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Minha Loja
              </h1>
              <p className="text-sm text-gray-500">
                Bem-vindo, {user.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-8 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'customers', label: 'Clientes' },
            { id: 'rewards', label: 'Recompensas' },
            { id: 'validator', label: '🔍 Validador' },
            { id: 'transactions', label: 'Transações' }
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
        <div className="space-y-6">
          {activeTab === 'dashboard' && <StoreDashboardTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'rewards' && <RewardsTab />}
          {activeTab === 'validator' && <ValidatorTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
        </div>
      </div>
    </div>
  )
}

function StoreDashboardTab() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiService.getStoreDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

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

  const { store, stats } = dashboardData || {};

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dashboard da Loja</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalCustomers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pontos em Circulação</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalPointsInCirculation || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recompensas Ativas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.activeRewards || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resgates do Mês</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.monthlyRedemptions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info & QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informações da Loja
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Nome</p>
              <p className="text-gray-900">{store?.name || 'Carregando...'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">URL para Clientes</p>
              <div className="flex items-center space-x-2">
                <a href={store?.customUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {store?.customUrl || 'Carregando...'}
                </a>
                {store?.customUrl && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(store.customUrl);
                      alert('Link copiado para a área de transferência!');
                    }}
                    className="text-gray-400 hover:text-primary-600 p-1"
                    title="Copiar link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Compartilhe este link com seus clientes para eles acessarem seus pontos
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
              <p className="text-gray-900">R$ 1 = {store?.pointsConversionRate || '1'} ponto(s)</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            QR Code da Loja
          </h3>
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
            </div>
            <button className="btn-secondary">
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '' });
  const [editForm, setEditForm] = useState({ points: '', description: '', type: 'earned' });
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await apiService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await apiService.createCustomer(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', phone: '' });
      await loadCustomers();
    } catch (error: any) {
      alert(error.message || 'Erro ao cadastrar cliente');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditPoints = (customer: any) => {
    setEditingCustomer(customer);
    setEditForm({ points: '', description: '', type: 'earned' });
    setShowEditModal(true);
  };

  const handleUpdatePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editForm.points) return;
    
    setEditLoading(true);
    try {
      await apiService.updateCustomerPoints(editingCustomer.id, {
        points: parseInt(editForm.points),
        description: editForm.description || undefined,
        type: editForm.type as 'earned' | 'redeemed' | 'adjusted'
      });
      setShowEditModal(false);
      setEditingCustomer(null);
      setEditForm({ points: '', description: '', type: 'earned' });
      await loadCustomers();
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar pontos');
    } finally {
      setEditLoading(false);
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Gestão de Clientes</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Cadastrar Cliente
        </button>
      </div>

      {customers.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{customer.email || '-'}</div>
                      <div className="text-gray-500">{customer.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-primary-600">{customer.totalPoints}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditPoints(customer)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Editar Pontos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente cadastrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece cadastrando seus primeiros clientes.
            </p>
            <div className="mt-6">
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Cadastrar Primeiro Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cadastrar Cliente</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="input w-full"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="input w-full"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                  className="input w-full"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1" disabled={createLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={createLoading}>
                  {createLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Pontos */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Editar Pontos - {editingCustomer.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Pontos Atuais:</strong> {editingCustomer.totalPoints} pontos
              </p>
            </div>

            <form onSubmit={handleUpdatePoints} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Operação
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                  className="input w-full"
                >
                  <option value="earned">➕ Ganhar Pontos</option>
                  <option value="redeemed">➖ Resgatar Pontos</option>
                  <option value="adjusted">🔧 Ajustar Saldo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade de Pontos *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editForm.points}
                  onChange={(e) => setEditForm({...editForm, points: e.target.value})}
                  className="input w-full"
                  placeholder="Ex: 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="input w-full"
                  rows={3}
                  placeholder="Motivo da alteração (ex: Compra de R$ 100,00)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary flex-1" 
                  disabled={editLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1" 
                  disabled={editLoading}
                >
                  {editLoading ? 'Salvando...' : 'Atualizar Pontos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function RewardsTab() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ 
    name: '', 
    description: '', 
    pointsRequired: '',
    category: 'other',
    rewardType: 'voucher',
    rewardValue: '',
    maxRedemptions: '',
    validUntil: '',
    neverExpires: false,
    minimumPurchase: '',
    termsAndConditions: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await apiService.getRewards();
      setRewards(data);
    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await apiService.createReward({
        name: createForm.name,
        description: createForm.description,
        pointsRequired: parseInt(createForm.pointsRequired),
        category: createForm.category,
        rewardType: createForm.rewardType,
        rewardValue: createForm.rewardValue || undefined,
        maxRedemptions: createForm.maxRedemptions ? parseInt(createForm.maxRedemptions) : undefined,
        validUntil: createForm.neverExpires || !createForm.validUntil ? undefined : new Date(createForm.validUntil).toISOString(),
        neverExpires: createForm.neverExpires,
        minimumPurchase: createForm.minimumPurchase ? parseInt(createForm.minimumPurchase) : undefined,
        termsAndConditions: createForm.termsAndConditions || undefined
      });
      setShowCreateModal(false);
      setCreateForm({ 
        name: '', 
        description: '', 
        pointsRequired: '',
        category: 'other',
        rewardType: 'voucher',
        rewardValue: '',
        maxRedemptions: '',
        validUntil: '',
        neverExpires: false,
        minimumPurchase: '',
        termsAndConditions: ''
      });
      await loadRewards();
    } catch (error: any) {
      alert(error.message || 'Erro ao criar recompensa');
    } finally {
      setCreateLoading(false);
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Catálogo de Recompensas</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Criar Recompensa
        </button>
      </div>

      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div key={reward.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-medium text-gray-900">{reward.name}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {reward.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{reward.description || 'Sem descrição'}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary-600">{reward.pointsRequired} pts</span>
                <button className="btn-secondary text-sm">Editar</button>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma recompensa criada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Crie recompensas atrativas para seus clientes.
            </p>
            <div className="mt-6">
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Criar Primeira Recompensa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Criar Recompensa</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateReward} className="space-y-6">
              {/* Informações Básicas */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">📋 Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      className="input w-full"
                      placeholder="Ex: Desconto 10%"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      className="input w-full"
                      rows={3}
                      placeholder="Descreva os detalhes da recompensa..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                      className="input w-full"
                    >
                      <option value="discount">🏷️ Desconto</option>
                      <option value="product">🎁 Produto</option>
                      <option value="service">🛠️ Serviço</option>
                      <option value="cashback">💰 Cashback</option>
                      <option value="other">📦 Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={createForm.rewardType}
                      onChange={(e) => setCreateForm({...createForm, rewardType: e.target.value})}
                      className="input w-full"
                    >
                      <option value="percentage">📊 Porcentagem (%)</option>
                      <option value="fixed_value">💵 Valor Fixo (R$)</option>
                      <option value="free_item">🆓 Item Gratuito</option>
                      <option value="voucher">🎟️ Voucher/Cupom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Configurações de Valor */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">💎 Configurações de Valor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pontos Necessários *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={createForm.pointsRequired}
                      onChange={(e) => setCreateForm({...createForm, pointsRequired: e.target.value})}
                      className="input w-full"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Recompensa</label>
                    <input
                      type="text"
                      value={createForm.rewardValue}
                      onChange={(e) => setCreateForm({...createForm, rewardValue: e.target.value})}
                      className="input w-full"
                      placeholder="Ex: 10% ou R$ 25,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compra Mínima (centavos)</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.minimumPurchase}
                      onChange={(e) => setCreateForm({...createForm, minimumPurchase: e.target.value})}
                      className="input w-full"
                      placeholder="Ex: 5000 = R$ 50,00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Valor em centavos (5000 = R$ 50,00)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Resgates</label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.maxRedemptions}
                      onChange={(e) => setCreateForm({...createForm, maxRedemptions: e.target.value})}
                      className="input w-full"
                      placeholder="Ex: 100 (vazio = ilimitado)"
                    />
                  </div>
                </div>
              </div>

              {/* Validade */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">📅 Prazo de Validade</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="neverExpires"
                      checked={createForm.neverExpires}
                      onChange={(e) => setCreateForm({...createForm, neverExpires: e.target.checked, validUntil: ''})}
                      className="form-checkbox text-primary-600"
                    />
                    <label htmlFor="neverExpires" className="ml-2 text-sm text-gray-700">
                      ♾️ Esta recompensa nunca expira (campanha permanente)
                    </label>
                  </div>
                  {!createForm.neverExpires && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
                      <input
                        type="datetime-local"
                        value={createForm.validUntil}
                        onChange={(e) => setCreateForm({...createForm, validUntil: e.target.value})}
                        className="input w-full"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Deixe vazio para usar a configuração acima</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Termos e Condições */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">📋 Termos e Condições</h4>
                <textarea
                  value={createForm.termsAndConditions}
                  onChange={(e) => setCreateForm({...createForm, termsAndConditions: e.target.value})}
                  className="input w-full"
                  rows={4}
                  placeholder="Ex: Válido apenas para compras acima de R$ 50,00. Não cumulativo com outras promoções..."
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1" disabled={createLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={createLoading}>
                  {createLoading ? 'Criando...' : '🎯 Criar Recompensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ValidatorTab() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setValidationResult(null);

    try {
      const result = await apiService.validateRedemption(code.trim().toUpperCase());
      setValidationResult(result);
      setCode('');
    } catch (error: any) {
      setError(error.message || 'Código inválido ou erro na validação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">🔍 Validador de Resgates</h2>
        <p className="text-gray-600">Digite o código do cliente ou escaneie o QR Code</p>
      </div>

      {/* Formulário de Validação */}
      <div className="max-w-md mx-auto">
        <div className="card">
          <form onSubmit={handleValidate} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código do Resgate
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="input w-full text-center text-lg font-mono"
                placeholder="Ex: OTHER-A1B2C3"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-primary w-full h-12 text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-dots mr-2">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  Validando...
                </div>
              ) : (
                '✅ Validar Código'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Resultado da Validação */}
      {validationResult && (
        <div className="max-w-lg mx-auto">
          <div className="card bg-green-50 border-green-200">
            <div className="text-center">
              {/* Ícone de sucesso */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-green-900 mb-2">
                ✅ Código Validado!
              </h3>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Cliente:</span>
                    <span className="font-semibold text-gray-900">{validationResult.redemption.customer}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Recompensa:</span>
                    <span className="font-semibold text-gray-900">{validationResult.redemption.reward}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Pontos utilizados:</span>
                    <span className="font-semibold text-red-600">-{validationResult.redemption.pointsUsed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Código:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{validationResult.redemption.code}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-green-700 bg-green-100 rounded-lg p-3">
                <strong>✓ Resgate confirmado!</strong><br />
                O cliente pode utilizar sua recompensa agora.
              </p>

              <button
                onClick={() => {
                  setValidationResult(null);
                  setError('');
                }}
                className="btn-secondary mt-4"
              >
                Validar Outro Código
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="max-w-2xl mx-auto">
        <div className="card bg-blue-50 border-blue-200">
          <h4 className="text-lg font-medium text-blue-900 mb-3">📋 Como usar o Validador:</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li><strong>1.</strong> Cliente apresenta o QR Code ou informa o código</li>
            <li><strong>2.</strong> Digite o código na caixa acima (ex: OTHER-A1B2C3)</li>
            <li><strong>3.</strong> Clique em "Validar Código"</li>
            <li><strong>4.</strong> Se válido, aplique o desconto/recompensa ao cliente</li>
            <li><strong>5.</strong> O código será marcado como utilizado automaticamente</li>
          </ul>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ Importante:</strong> Cada código só pode ser usado uma única vez. 
              Após validado, não será possível usar novamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Histórico de Transações</h2>
      
      <div className="card">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma transação</h3>
          <p className="mt-1 text-sm text-gray-500">
            Histórico de pontos e resgates aparecerá aqui.
          </p>
        </div>
      </div>
    </div>
  )
}
