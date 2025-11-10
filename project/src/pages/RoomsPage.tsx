import { useState, useEffect } from 'react'
import RoomCard from '../components/RoomCard'
import ServiceCard from '../components/ServiceCard'
import '../styles/RoomsPage.css'

interface RoomsPageProps {
  onLogout: () => void
}

interface Room {
  numero: string
  tipo: string
  descricao: string
  comodidades: string[]
  preco_diaria: number
  disponibilidade: 'livre' | 'ocupado' | 'manutencao'
}

interface Service {
  nome: string
  descricao: string
  preco: number
  incluso: boolean
}

function RoomsPage({ onLogout }: RoomsPageProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [activeTab, setActiveTab] = useState<'rooms' | 'services'>('rooms')

  // Estados para o modal de adicionar quarto
  const [mostrarModal, setMostrarModal] = useState(false)
  const [formData, setFormData] = useState({
    numero: '',
    descricao: '',
    comodidades: '',
    preco_diaria: '',
    disponibilidade: ''
  })

  useEffect(() => {
    // ✅ Buscar quartos do backend (Mongo + Cassandra)
    fetch("http://localhost:3000/quartos")
      .then(res => res.json())
      .then(data => {
        const convertedRooms: Room[] = data.map((room: any) => {
          const disponibilidade = (room.disponibilidade || "indisponível").toLowerCase()
          return {
            numero: String(room.numero),
            tipo: room.tipo ?? "Standard",
            descricao: room.descricao,
            comodidades: typeof room.comodidades === "string"
              ? room.comodidades.split(",").map((c: string) => c.trim())
              : room.comodidades,
            preco_diaria: room.preco_diaria,
            disponibilidade: disponibilidade as Room["disponibilidade"]
          }
        })
        setRooms(convertedRooms)
      })
      .catch(error => console.error("Erro ao carregar quartos:", error))

    // ✅ Serviços mockados
    const mockServices: Service[] = [
      { nome: 'Café da Manhã', descricao: 'Buffet completo', preco: 45.00, incluso: true },
      { nome: 'Spa', descricao: 'Massagens relaxantes', preco: 150.00, incluso: false },
      { nome: 'Transfer Aeroporto', descricao: 'Transporte ida e volta', preco: 80.00, incluso: false },
      { nome: 'Piscina', descricao: 'Aquecida com bar molhado', preco: 0.00, incluso: true },
      { nome: 'Academia', descricao: '24 horas', preco: 0.00, incluso: true },
      { nome: 'Room Service', descricao: '24 horas', preco: 25.00, incluso: false },
      { nome: 'Estacionamento', descricao: 'Coberto e seguro', preco: 30.00, incluso: false },
      { nome: 'Lavanderia', descricao: 'Expressa', preco: 40.00, incluso: false }
    ]
    setServices(mockServices)
  }, [])

  // Função para lidar com as mudanças nos inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Função para adicionar novo quarto (POST /inserirQuartoCompleto)
  const handleAdicionarQuarto = async () => {
    try {
      const response = await fetch("http://localhost:3000/inserirQuarto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        alert("✅ Quarto adicionado com sucesso!")
        setMostrarModal(false)
        setFormData({
          numero: '',
          descricao: '',
          comodidades: '',
          preco_diaria: '',
          disponibilidade: ''
        })
        // Atualiza lista de quartos automaticamente
        setRooms(prev => [...prev, {
          numero: formData.numero,
          tipo: "Standard",
          descricao: formData.descricao,
          comodidades: formData.comodidades.split(',').map(c => c.trim()),
          preco_diaria: Number(formData.preco_diaria),
          disponibilidade: formData.disponibilidade as Room["disponibilidade"]
        }])
      } else {
        alert(data.error || "Erro ao adicionar quarto.")
      }
    } catch (error) {
      console.error("❌ Erro ao adicionar quarto:", error)
    }
  }

  return (
    <div className="rooms-page">
      <header className="rooms-header">
        <div className="header-content">
          <h1>Sistema de Reservas</h1>
          <button onClick={onLogout} className="logout-button">
            Sair
          </button>
        </div>
      </header>

      <div className="rooms-container">
        <div className="tabs-container">
          <button
            className={activeTab === 'rooms' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('rooms')}
          >
            Quartos Disponíveis
          </button>
          <button
            className={activeTab === 'services' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('services')}
          >
            Serviços
          </button>
        </div>

        {activeTab === 'rooms' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Quartos</h2>

              {/* Substituímos os badges por um botão */}
              <button
                onClick={() => setMostrarModal(true)}
                className="add-room-button"
              >
                ➕ Adicionar Quarto
              </button>
              <button
                className="delete-room-button"
                onClick={() => {
                  const numero = prompt("Digite o número do quarto que deseja excluir:");
                  if (numero) {
                    fetch(`http://localhost:3000/excluirQuarto/${numero}`, {
                      method: "DELETE",
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        alert(data.mensagem || "Quarto excluído com sucesso!");
                        // Atualiza a lista de quartos
                        setRooms((prev) => prev.filter((r) => r.numero !== numero));
                      })
                      .catch((err) => console.error("Erro ao excluir quarto:", err));
                  }
                }}
              >
                Excluir Quarto
              </button>
            </div>

            <p className="section-description">
              Escolha o quarto ideal para sua estadia. Disponibilidade em tempo real.
            </p>

            <div className="legend">
              <div className="legend-item">
                <span className="status-indicator disponivel"></span>
                <span>Livre</span>
              </div>
              <div className="legend-item">
                <span className="status-indicator ocupado"></span>
                <span>Ocupado</span>
              </div>
              <div className="legend-item">
                <span className="status-indicator manutencao"></span>
                <span>Manutenção</span>
              </div>
            </div>

            <div className="cards-grid">
              {rooms.map((room) => (
                <RoomCard key={room.numero} room={room} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Serviços</h2>
              <div className="database-badge">
                <span className="badge-label">MongoDB</span>
              </div>
            </div>
            <p className="section-description">
              Aproveite nossos serviços exclusivos durante sua hospedagem.
            </p>
            <div className="cards-grid">
              {services.map((service, index) => (
                <ServiceCard key={index} service={service} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de adicionar quarto */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adicionar Novo Quarto</h3>

            <input
              name="numero"
              placeholder="Número"
              value={formData.numero}
              onChange={handleChange}
            />
            <input
              name="descricao"
              placeholder="Descrição"
              value={formData.descricao}
              onChange={handleChange}
            />
            <input
              name="comodidades"
              placeholder="Comodidades (separe por vírgulas)"
              value={formData.comodidades}
              onChange={handleChange}
            />
            <input
              name="preco_diaria"
              placeholder="Preço da diária"
              value={formData.preco_diaria}
              onChange={handleChange}
            />
            <input
              name="disponibilidade"
              placeholder="Disponibilidade (ex: livre)"
              value={formData.disponibilidade}
              onChange={handleChange}
            />

            <div className="modal-buttons">
              <button onClick={handleAdicionarQuarto} className="confirm-button">Adicionar</button>
              <button onClick={() => setMostrarModal(false)} className="cancel-button">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomsPage
