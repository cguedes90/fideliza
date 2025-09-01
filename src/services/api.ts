const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('fideliza_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...(options?.headers as Record<string, string>),
      } as HeadersInit,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro de comunicação' }));
      
      // Tratar diferentes tipos de erro
      if (response.status === 401) {
        // Token expirado ou inválido - limpar localStorage
        localStorage.removeItem('fideliza_token');
        localStorage.removeItem('fideliza_user');
        window.location.href = '/login';
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      if (response.status === 403) {
        throw new Error(error.error || 'Acesso negado');
      }
      
      if (response.status === 429) {
        throw new Error(error.error || 'Muitas tentativas. Aguarde alguns minutos.');
      }
      
      if (response.status >= 500) {
        throw new Error('Erro no servidor. Tente novamente mais tarde.');
      }
      
      throw new Error(error.error || `Erro ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{
      token: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        storeId?: string;
      };
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Admin - Dashboard
  async getAdminDashboard() {
    return this.request<{
      stats: {
        activeStores: number;
        inactiveStores: number;
        totalLeads: number;
        totalCustomers: number;
      };
      recentStores: Array<{
        id: string;
        name: string;
        slug: string;
        createdAt: string;
        isActive: boolean;
      }>;
    }>('/admin/dashboard');
  }

  // Admin - Stores
  async getStores() {
    return this.request<Array<{
      id: string;
      name: string;
      slug: string;
      cnpj: string;
      segment: string;
      ownerEmail: string;
      isActive: boolean;
      createdAt: string;
      customUrl: string;
    }>>('/admin/stores');
  }

  async createStore(data: {
    name: string;
    cnpj: string;
    segment: string;
    ownerEmail: string;
    pointsConversionRate?: string;
  }) {
    return this.request('/admin/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStore(id: string, data: any) {
    return this.request(`/admin/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStore(id: string) {
    return this.request(`/admin/stores/${id}`, {
      method: 'DELETE',
    });
  }

  async getStoreCredentials(id: string) {
    return this.request<{
      store: {
        name: string;
        slug: string;
        email: string;
        customUrl: string;
      };
      loginCredentials: {
        email: string;
        dashboardUrl: string;
      };
      note: string;
    }>(`/admin/stores/${id}/credentials`);
  }

  async impersonateStoreOwner(id: string) {
    return this.request<{
      message: string;
      token: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        storeId: string;
      };
    }>(`/admin/stores/${id}/impersonate`, {
      method: 'POST',
    });
  }

  async resetStoreOwnerPassword(id: string) {
    return this.request<{
      message: string;
      credentials: {
        email: string;
        password: string;
        note: string;
      };
    }>(`/admin/stores/${id}/reset-password`, {
      method: 'POST',
    });
  }

  // Admin - Leads
  async getLeads() {
    return this.request<Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      company?: string;
      message?: string;
      status: string;
      createdAt: string;
    }>>('/admin/leads');
  }

  // Store Owner - Dashboard
  async getStoreDashboard() {
    return this.request<{
      store: {
        id: string;
        name: string;
        slug: string;
        customUrl: string;
        pointsConversionRate: string;
      };
      stats: {
        totalCustomers: number;
        activeRewards: number;
        monthlyRedemptions: number;
        totalPointsInCirculation: number;
      };
    }>('/store/dashboard');
  }

  // Store Owner - Customers
  async getCustomers() {
    return this.request<Array<{
      id: string;
      name: string;
      email?: string;
      phone?: string;
      totalPoints: number;
      isActive: boolean;
      createdAt: string;
    }>>('/store/customers');
  }

  async createCustomer(data: {
    name: string;
    email?: string;
    phone?: string;
  }) {
    return this.request('/store/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomerPoints(customerId: string, data: {
    points: number;
    description?: string;
    type: 'earned' | 'redeemed' | 'adjusted';
  }) {
    return this.request(`/store/customers/${customerId}/points`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async validateRedemption(code: string) {
    return this.request<{
      success: boolean;
      message: string;
      redemption: {
        id: string;
        code: string;
        customer: string;
        reward: string;
        description?: string;
        pointsUsed: number;
        redeemedAt: string;
        completedAt: string;
      };
    }>('/store/validate-redemption', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Store Owner - Rewards
  async getRewards() {
    return this.request<Array<{
      id: string;
      name: string;
      description?: string;
      pointsRequired: number;
      isActive: boolean;
      createdAt: string;
    }>>('/store/rewards');
  }

  async createReward(data: {
    name: string;
    description?: string;
    pointsRequired: number;
    category?: string;
    rewardType?: string;
    rewardValue?: string;
    maxRedemptions?: number;
    validUntil?: string;
    neverExpires?: boolean;
    minimumPurchase?: number;
    termsAndConditions?: string;
  }) {
    return this.request('/store/rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Public API - Store Page
  async getPublicStore(slug: string) {
    return this.request<{
      id: string;
      name: string;
      slug: string;
      customUrl: string;
      isActive: boolean;
      pointsConversionRate: string;
    }>(`/public/store/${slug}`);
  }

  async customerLogin(storeSlug: string, email?: string, phone?: string) {
    return this.request<{
      customer: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        totalPoints: number;
      };
      store: {
        name: string;
        slug: string;
      };
    }>('/public/customer-login', {
      method: 'POST',
      body: JSON.stringify({ storeSlug, email, phone }),
    });
  }

  async getPublicRewards(slug: string) {
    return this.request<Array<{
      id: string;
      name: string;
      description?: string;
      pointsRequired: number;
      isActive: boolean;
    }>>(`/public/store/${slug}/rewards`);
  }

  async getCustomerTransactions(customerId: string) {
    return this.request<Array<{
      id: string;
      type: string;
      points: number;
      description?: string;
      createdAt: string;
    }>>(`/public/customer/${customerId}/transactions`);
  }

  async redeemReward(customerId: string, rewardId: string) {
    return this.request<{
      message: string;
      redemption: {
        id: string;
        code: string;
        reward: string;
        pointsUsed: number;
        status: string;
        instructions: string;
      };
      newBalance: number;
    }>(`/public/customer/${customerId}/redeem/${rewardId}`, {
      method: 'POST',
    });
  }

  async getCustomerRedemptions(customerId: string) {
    return this.request<Array<{
      id: string;
      rewardName: string;
      pointsUsed: number;
      status: string;
      redeemedAt: string;
      completedAt?: string;
      notes?: string;
    }>>(`/public/customer/${customerId}/redemptions`);
  }

  // Leads públicos
  async createLead(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
  }) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();