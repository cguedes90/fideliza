import React, { useState } from 'react'
import { apiService } from '../services/api'

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await apiService.createLead(formData)
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', company: '', message: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>FidelizaPontos - Sistema de Fidelidade para Lojas | Aumente suas Vendas</title>
        <meta name="description" content="Sistema completo de fidelidade para lojas. Gerencie clientes, pontos e recompensas de forma simples. Aumente a retenção e vendas do seu negócio." />
        <meta name="keywords" content="sistema fidelidade, programa pontos, gestão clientes, retenção clientes, fidelização, SaaS loja" />
        <meta property="og:title" content="FidelizaPontos - Sistema de Fidelidade para Lojas" />
        <meta property="og:description" content="Transforme seus clientes em defensores da marca com nosso sistema de fidelidade completo e fácil de usar." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://fidelizaa.com.br" />
      </head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-900">FidelizaPontos</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#funcionalidades" className="text-gray-700 hover:text-primary-600">Funcionalidades</a>
                <a href="#como-funciona" className="text-gray-700 hover:text-primary-600">Como Funciona</a>
                <a href="#contato" className="text-gray-700 hover:text-primary-600">Contato</a>
                <div className="flex items-center space-x-3">
                  <a href="/login?type=admin" className="btn-secondary">Acesso Admin</a>
                  <a href="/login?type=store" className="btn-primary">Acesso Loja</a>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Transforme Clientes em <span className="text-primary-600">Defensores da Marca</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Sistema completo de fidelidade que aumenta a retenção, engajamento e vendas do seu negócio. 
                Simples de usar, poderoso nos resultados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#contato" className="btn-primary text-lg px-8 py-4">
                  Começar Gratuitamente
                </a>
                <a href="#como-funciona" className="btn-secondary text-lg px-8 py-4">
                  Ver Como Funciona
                </a>
              </div>
              
              {/* Links de Acesso Rápido */}
              <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <span className="text-sm text-gray-600 mb-2 sm:mb-0">Acesso direto:</span>
                <div className="flex gap-3">
                  <a href="/login?type=admin" className="px-4 py-2 text-sm bg-white text-primary-600 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors">
                    👨‍💼 Administrador
                  </a>
                  <a href="/login?type=store" className="px-4 py-2 text-sm bg-white text-primary-600 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors">
                    🏪 Lojista
                  </a>
                  <a href="/loja/loja-teste-demo" className="px-4 py-2 text-sm bg-white text-primary-600 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors">
                    👤 Cliente
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section id="funcionalidades" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Tudo que Você Precisa para Fidelizar
              </h2>
              <p className="text-xl text-gray-600">
                Ferramentas completas para gerenciar seu programa de fidelidade
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Gestão de Clientes</h3>
                <p className="text-gray-600">
                  Cadastre e gerencie todos os seus clientes em um só lugar. 
                  Acompanhe histórico de compras e pontos acumulados.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Sistema de Pontos</h3>
                <p className="text-gray-600">
                  Configure regras de pontuação personalizadas. Defina quantos pontos 
                  cada real gasto vale e acompanhe o saldo dos clientes.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Recompensas</h3>
                <p className="text-gray-600">
                  Crie recompensas atrativas para seus clientes. Defina produtos, 
                  descontos e benefícios que podem ser resgatados com pontos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section id="como-funciona" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Como Funciona na Prática
              </h2>
              <p className="text-xl text-gray-600">
                Processo simples e intuitivo para lojistas e clientes
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Para Lojistas */}
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-primary-600 mb-6">
                  👨‍💼 Para Lojistas
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-4">1</div>
                    <div>
                      <h4 className="font-semibold mb-2">Dashboard Completo</h4>
                      <p className="text-gray-600">Veja estatísticas dos seus clientes, pontos em circulação e resgates mensais em tempo real.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-4">2</div>
                    <div>
                      <h4 className="font-semibold mb-2">Gerencie Clientes</h4>
                      <p className="text-gray-600">Cadastre novos clientes, consulte histórico e adicione ou retire pontos com facilidade.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-4">3</div>
                    <div>
                      <h4 className="font-semibold mb-2">Configure Recompensas</h4>
                      <p className="text-gray-600">Crie recompensas atrativas definindo quantos pontos são necessários para cada benefício.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-4">4</div>
                    <div>
                      <h4 className="font-semibold mb-2">Sua Página Personalizada</h4>
                      <p className="text-gray-600">Cada loja tem sua própria página onde clientes podem consultar pontos e resgatar recompensas.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Para Clientes */}
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-green-600 mb-6">
                  👤 Para Clientes
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-4">1</div>
                    <div>
                      <h4 className="font-semibold mb-2">Acesso Fácil</h4>
                      <p className="text-gray-600">Entre na página da sua loja favorita usando apenas email ou telefone cadastrado.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-4">2</div>
                    <div>
                      <h4 className="font-semibold mb-2">Consulte seus Pontos</h4>
                      <p className="text-gray-600">Veja quantos pontos você tem acumulados e o histórico completo de todas as suas transações.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-4">3</div>
                    <div>
                      <h4 className="font-semibold mb-2">Explore Recompensas</h4>
                      <p className="text-gray-600">Veja todas as recompensas disponíveis e quantos pontos você precisa para cada uma.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-4">4</div>
                    <div>
                      <h4 className="font-semibold mb-2">Resgate Benefícios</h4>
                      <p className="text-gray-600">Use seus pontos para resgatar produtos, descontos ou serviços oferecidos pela loja.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Níveis de Acesso */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                3 Níveis de Acesso Personalizados
              </h2>
              <p className="text-xl text-gray-600">
                Cada perfil tem suas funcionalidades específicas
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Super Admin */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">Super Admin</h3>
                  <p className="text-blue-600">Controle Total</p>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>✅ Ver todas as lojas do sistema</li>
                  <li>✅ Gerenciar leads capturados</li>
                  <li>✅ Criar e editar lojas</li>
                  <li>✅ Ativar/desativar lojas</li>
                  <li>✅ Relatórios consolidados</li>
                  <li>✅ Configurações gerais</li>
                </ul>
                <div className="mt-6">
                  <a href="/login?type=admin" className="btn-primary w-full">
                    Acessar Admin
                  </a>
                </div>
              </div>

              {/* Lojista */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">Lojista</h3>
                  <p className="text-green-600">Gestão da Loja</p>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>✅ Gerenciar clientes da loja</li>
                  <li>✅ Configurar regras de pontos</li>
                  <li>✅ Criar recompensas</li>
                  <li>✅ Adicionar/retirar pontos</li>
                  <li>✅ Ver ranking de clientes</li>
                  <li>✅ Campanhas promocionais</li>
                </ul>
                <div className="mt-6">
                  <a href="/login?type=store" className="btn-primary w-full bg-green-600 hover:bg-green-700">
                    Acessar Loja
                  </a>
                </div>
              </div>

              {/* Cliente */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900">Cliente</h3>
                  <p className="text-purple-600">Consulta de Pontos</p>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>✅ Ver saldo de pontos</li>
                  <li>✅ Histórico de transações</li>
                  <li>✅ Recompensas disponíveis</li>
                  <li>✅ Consulta por email/telefone</li>
                  <li>✅ Interface simples</li>
                  <li>✅ Acesso direto por loja</li>
                </ul>
                <div className="mt-6">
                  <a href="/loja/loja-teste-demo" className="btn-primary w-full bg-purple-600 hover:bg-purple-700">
                    Testar como Cliente
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Resultados Comprovados
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">+85%</div>
                <div className="text-sm text-gray-600">Retenção de Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">+65%</div>
                <div className="text-sm text-gray-600">Frequência de Compras</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">+45%</div>
                <div className="text-sm text-gray-600">Ticket Médio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Seguro e Confiável</div>
              </div>
            </div>
          </div>
        </section>

        {/* Formulário de Contato */}
        <section id="contato" className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Pronto para Começar?
              </h2>
              <p className="text-xl text-gray-600">
                Entre em contato conosco e descubra como o FidelizaPontos pode transformar seu negócio
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
                  <p className="text-gray-600">Obrigado pelo seu interesse. Entraremos em contato em breve!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="input w-full"
                        placeholder="Nome da sua empresa"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="input w-full resize-none"
                      placeholder="Conte-nos sobre seu negócio e como podemos ajudar..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full h-12 text-lg"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">FidelizaPontos</h3>
              <p className="text-gray-400 mb-8">
                Sistema SaaS de Fidelidade Multilojas - Transformando relacionamento em resultados
              </p>
              <div className="flex justify-center space-x-8">
                <a href="/login?type=admin" className="text-gray-400 hover:text-white">Acesso Admin</a>
                <a href="/login?type=store" className="text-gray-400 hover:text-white">Acesso Loja</a>
                <a href="#funcionalidades" className="text-gray-400 hover:text-white">Funcionalidades</a>
                <a href="#contato" className="text-gray-400 hover:text-white">Contato</a>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8">
                <p className="text-gray-500 text-sm">
                  © 2024 FidelizaPontos. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}