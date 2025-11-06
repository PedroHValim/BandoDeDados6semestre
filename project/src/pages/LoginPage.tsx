import { useState } from 'react'
import { cadastrarHospede, loginHospede } from '../services/hospedeService'
import '../styles/LoginPage.css'

interface LoginPageProps {
  onLoginSuccess: () => void
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    cpf: '',
    telefone: '',
    senha: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        // Login
        const result = await loginHospede({
          cpf: formData.cpf,
          senha: formData.senha
        })

        if (result.success) {
          setSuccess('Login realizado com sucesso!')
          // Armazenar dados do hóspede no localStorage
          localStorage.setItem('hospede', JSON.stringify(result.data))
          setTimeout(() => {
            onLoginSuccess()
          }, 1000)
        } else {
          setError(result.error || 'Erro ao fazer login')
        }
      } else {
        // Cadastro
        const result = await cadastrarHospede({
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          cpf: formData.cpf,
          telefone: formData.telefone,
          senha: formData.senha
        })

        if (result.success) {
          setSuccess('Cadastro realizado com sucesso! Você já pode fazer login.')
          // Limpar formulário
          setFormData({
            nome: '',
            sobrenome: '',
            cpf: '',
            telefone: '',
            senha: ''
          })
          // Mudar para aba de login após 2 segundos
          setTimeout(() => {
            setIsLogin(true)
            setSuccess('')
          }, 2000)
        } else {
          setError(result.error || 'Erro ao cadastrar hóspede')
        }
      }
    } catch (err: any) {
      setError('Erro inesperado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData({
      ...formData,
      cpf: formatted
    })
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value)
    setFormData({
      ...formData,
      telefone: formatted
    })
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-overlay"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h1>Sistema de Reservas</h1>
          <p>Bem-vindo ao melhor hotel da região</p>
        </div>

        <div className="login-tabs">
          <button
            className={isLogin ? 'tab active' : 'tab'}
            onClick={() => {
              setIsLogin(true)
              setError('')
              setSuccess('')
            }}
          >
            Login
          </button>
          <button
            className={!isLogin ? 'tab active' : 'tab'}
            onClick={() => {
              setIsLogin(false)
              setError('')
              setSuccess('')
            }}
          >
            Cadastro
          </button>
        </div>

        {error && (
          <div className="message error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="message success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="nome">Nome</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sobrenome">Sobrenome</label>
                <input
                  type="text"
                  id="sobrenome"
                  name="sobrenome"
                  value={formData.sobrenome}
                  onChange={handleChange}
                  placeholder="Digite seu sobrenome"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleTelefoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="database-info">
          <p>Conexão: Supabase (PostgreSQL)</p>
          <p className="database-tables">Tabelas: Hospede, Reserva, Pagamento</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

