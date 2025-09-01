import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { apiService } from '../../services/api'

export default function AdminDashboard() {
  const { user, logout, impersonateStoreOwner } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (user?.role !== 'super_admin') {
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
                FidelizaPontos Admin
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
            { id: 'dashboard', label: 'Dashboard', count: null },
            { id: 'stores', label: 'Lojas', count: null },
            { id: 'leads', label: 'Leads', count: null },
            { id: 'reports', label: 'Relatórios', count: null }
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
              {tab.count && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'stores' && <StoresTab impersonateStoreOwner={impersonateStoreOwner} />}
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  )
}

function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [recentStores, setRecentStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiService.getAdminDashboard();
        setStats(data.stats);
        setRecentStores(data.recentStores);
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dashboard Geral</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lojas Ativas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.activeStores || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes Totais</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalCustomers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Leads</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalLeads || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lojas Inativas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.inactiveStores || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Stores */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lojas Recentes</h3>
        {recentStores.length > 0 ? (
          <div className="space-y-3">
            {recentStores.map((store) => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{store.name}</p>
                  <p className="text-sm text-gray-500">/{store.slug}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  store.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {store.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma loja cadastrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Lojas recentes aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StoresTab({ impersonateStoreOwner }: { impersonateStoreOwner: (storeId: string) => Promise<void> }) {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [credentialsData, setCredentialsData] = useState<any>(null);
  const [passwordData, setPasswordData] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    cnpj: '',
    segment: '',
    ownerEmail: '',
    pointsConversionRate: '1.00'
  });
  const [editForm, setEditForm] = useState({
    name: '',
    cnpj: '',
    segment: '',
    ownerEmail: '',
    isActive: true
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await apiService.getStores();
      setStores(data);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await apiService.createStore(createForm);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        cnpj: '',
        segment: '',
        ownerEmail: '',
        pointsConversionRate: '1.00'
      });
      await loadStores();
    } catch (error: any) {
      alert(error.message || 'Erro ao criar loja');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditStore = (store: any) => {
    setEditingStore(store);
    setEditForm({
      name: store.name,
      cnpj: store.cnpj,
      segment: store.segment,
      ownerEmail: store.ownerEmail,
      isActive: store.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    
    setEditLoading(true);
    try {
      await apiService.updateStore(editingStore.id, editForm);
      setShowEditModal(false);
      setEditingStore(null);
      await loadStores();
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar loja');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (store: any) => {
    try {
      await apiService.updateStore(store.id, {
        isActive: !store.isActive
      });
      await loadStores();
    } catch (error: any) {
      alert(error.message || 'Erro ao alterar status da loja');
    }
  };

  const handleDeleteStore = async (store: any) => {
    if (!confirm(`Tem certeza que deseja excluir a loja "${store.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await apiService.deleteStore(store.id);
      await loadStores();
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir loja');
    }
  };

  const handleShowCredentials = async (store: any) => {
    try {
      const credentials = await apiService.getStoreCredentials(store.id);
      setCredentialsData({ ...credentials, storeId: store.id });
      setShowCredentialsModal(true);
    } catch (error: any) {
      alert(error.message || 'Erro ao carregar credenciais');
    }
  };

  const handleImpersonate = async (storeId: string) => {
    try {
      await impersonateStoreOwner(storeId);
      // Redirecionar para dashboard do lojista
      window.location.href = '/dashboard';
    } catch (error: any) {
      alert(error.message || 'Erro ao fazer login como lojista');
    }
  };

  const handleResetPassword = async (store: any) => {
    try {
      const result = await apiService.resetStoreOwnerPassword(store.id);
      setPasswordData({ ...result, storeName: store.name });
      setShowPasswordModal(true);
    } catch (error: any) {
      alert(error.message || 'Erro ao redefinir senha');
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
        <h2 className="text-xl font-semibold text-gray-900">Gestão de Lojas</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Criar Nova Loja
        </button>
      </div>

      {stores.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segmento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email do Proprietário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                        <div className="text-sm text-gray-500">/{store.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {store.cnpj}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {store.segment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {store.ownerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        store.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {store.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col space-y-1">
                        <button 
                          onClick={() => handleShowCredentials(store)}
                          className="text-primary-600 hover:text-primary-900 text-left"
                        >
                          🔑 Acesso Lojista
                        </button>
                        <button 
                          onClick={() => handleResetPassword(store)}
                          className="text-orange-600 hover:text-orange-900 text-left"
                        >
                          🔄 Nova Senha
                        </button>
                        <a href={store.customUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                          🌐 Loja Pública
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditStore(store)}
                          className="text-primary-600 hover:text-primary-800 transition-colors"
                          title="Editar loja"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(store)}
                          className={`transition-colors ${
                            store.isActive 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={store.isActive ? 'Desativar loja' : 'Ativar loja'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {store.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteStore(store)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Excluir loja"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma loja cadastrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando sua primeira loja no sistema.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Criar Primeira Loja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Nova Loja</h3>
            
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="input w-full"
                  placeholder="Nome da loja"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  required
                  value={createForm.cnpj}
                  onChange={(e) => setCreateForm({...createForm, cnpj: e.target.value})}
                  className="input w-full"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segmento
                </label>
                <input
                  type="text"
                  required
                  value={createForm.segment}
                  onChange={(e) => setCreateForm({...createForm, segment: e.target.value})}
                  className="input w-full"
                  placeholder="Ex: Varejo, Alimentação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email do Proprietário
                </label>
                <input
                  type="email"
                  required
                  value={createForm.ownerEmail}
                  onChange={(e) => setCreateForm({...createForm, ownerEmail: e.target.value})}
                  className="input w-full"
                  placeholder="proprietario@email.com"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                  disabled={createLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={createLoading}
                >
                  {createLoading ? 'Criando...' : 'Criar Loja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Editar Loja
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

              <form onSubmit={handleUpdateStore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Loja
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="input w-full"
                    placeholder="Nome da loja"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.cnpj}
                    onChange={(e) => setEditForm({...editForm, cnpj: e.target.value})}
                    className="input w-full"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segmento
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.segment}
                    onChange={(e) => setEditForm({...editForm, segment: e.target.value})}
                    className="input w-full"
                    placeholder="Ex: Varejo, Alimentação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Proprietário
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.ownerEmail}
                    onChange={(e) => setEditForm({...editForm, ownerEmail: e.target.value})}
                    className="input w-full"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={editForm.isActive}
                        onChange={() => setEditForm({...editForm, isActive: true})}
                        className="form-radio text-primary-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Ativa</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!editForm.isActive}
                        onChange={() => setEditForm({...editForm, isActive: false})}
                        className="form-radio text-primary-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Inativa</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="btn-primary"
                  >
                    {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Credenciais */}
      {showCredentialsModal && credentialsData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6H6a6 6 0 01-6-6V9a6 6 0 016-6h8a6 6 0 016 6v8z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🔑 Acesso para Lojista
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {credentialsData.store.name}
                </h4>
                
                <div className="text-left space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Email de Login:</strong></p>
                    <div className="bg-white px-3 py-2 rounded border font-mono text-sm">
                      {credentialsData.loginCredentials.email}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Dashboard:</strong></p>
                    <div className="bg-white px-3 py-2 rounded border">
                      <button
                        onClick={() => handleImpersonate(credentialsData.storeId)}
                        className="text-primary-600 hover:text-primary-800 w-full text-left"
                      >
                        🚪 Acessar como Lojista
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Loja Pública:</strong></p>
                    <div className="bg-white px-3 py-2 rounded border">
                      <a href={credentialsData.store.customUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        Ver Loja Pública
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>📋 Instruções:</strong><br />
                  {credentialsData.note}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setCredentialsData(null);
                }}
                className="btn-primary w-full"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Senha */}
      {showPasswordModal && passwordData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6H6a6 6 0 01-6-6V9a6 6 0 016-6h8a6 6 0 016 6v8z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🔑 Nova Senha Gerada
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {passwordData.storeName}
                </h4>
                
                <div className="text-left space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong></p>
                    <div className="bg-white px-3 py-2 rounded border font-mono text-sm">
                      {passwordData.credentials.email}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Nova Senha:</strong></p>
                    <div className="bg-yellow-50 px-3 py-2 rounded border-2 border-yellow-300 font-mono text-lg font-bold text-center">
                      {passwordData.credentials.password}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>📋 Importante:</strong><br />
                  {passwordData.credentials.note}
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-orange-800">
                  <strong>⚠️ Atenção:</strong><br />
                  Anote essa senha! Ela substitui a senha anterior e deve ser comunicada ao lojista.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData(null);
                }}
                className="btn-primary w-full"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LeadsTab() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const data = await apiService.getLeads();
        setLeads(data);
      } catch (error) {
        console.error('Erro ao carregar leads:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Leads Capturados</h2>
      
      {leads.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.company || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lead.status === 'new' ? 'Novo' :
                         lead.status === 'contacted' ? 'Contatado' :
                         lead.status === 'converted' ? 'Convertido' : 'Perdido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum lead capturado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Leads do formulário de contato aparecerão aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ReportsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Relatórios</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relatório de Lojas</h3>
          <p className="text-sm text-gray-500 mb-4">
            Dados consolidados de todas as lojas da plataforma.
          </p>
          <button className="btn-secondary">
            Gerar Relatório
          </button>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relatório Financeiro</h3>
          <p className="text-sm text-gray-500 mb-4">
            Análise de pontos e recompensas por período.
          </p>
          <button className="btn-secondary">
            Gerar Relatório
          </button>
        </div>
      </div>
    </div>
  )
}
