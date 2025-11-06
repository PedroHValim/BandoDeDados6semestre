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

  useEffect(() => {

    // ✅ Buscar quartos do backend (Mongo + Cassandra)
    fetch("http://localhost:3000/quartos")
      .then(res => res.json())
      .then(data => {
        const convertedRooms: Room[] = data.map((room: any) => {
          // Garante que 'disponibilidade' seja uma string válida
          const disponibilidade = (room.disponibilidade || "indisponível").toLowerCase();

          return {
            numero: String(room.numero),
            tipo: room.tipo ?? "Standard",
            descricao: room.descricao,
            comodidades: typeof room.comodidades === "string"
              ? room.comodidades.split(",").map((c: string) => c.trim())
              : room.comodidades, // Caso já venha como array
            preco_diaria: room.preco_diaria,
            disponibilidade: disponibilidade as Room["disponibilidade"]
          };
        });

        setRooms(convertedRooms);
      })
      .catch(error => console.error("Erro ao carregar quartos:", error));


    // ✅ Serviços ainda mockados
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
              <div className="database-badge">
                <span className="badge-label">MongoDB</span>
                <span className="badge-separator">+</span>
                <span className="badge-label">Cassandra</span>
              </div>
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
    </div>
  )
}

export default RoomsPage
