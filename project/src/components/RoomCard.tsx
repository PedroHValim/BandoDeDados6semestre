import '../styles/RoomCard.css'
;

interface Room {
  numero: string
  tipo: string
  descricao: string
  comodidades: string[]
  preco_diaria: number
  disponibilidade: 'livre' | 'ocupado' | 'manutencao'
}

interface RoomCardProps {
  room: Room
}

function RoomCard({ room }: RoomCardProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'livre': return 'Livre'
      case 'ocupado': return 'Ocupado'
      case 'manutencao': return 'Em Manutenção'
      default: return status
    }
  }

  return (
    <div className={`room-card ${room.disponibilidade}`}>
      <div className={`status-badge ${room.disponibilidade}`}>
          {getStatusText(room.disponibilidade)}
        </div>

      <div className="room-content">
        <div className="room-header">
          <h3>Quarto {room.numero}</h3>
          <span className="room-type">{room.tipo}</span>
        </div>

        <p className="room-description">{room.descricao}</p>

        <div className="room-amenities">
          <h4>Comodidades:</h4>
          <div className="amenities-list">
            {room.comodidades.map((comodidade, index) => (
              <span key={index} className="amenity-tag">
                {comodidade}
              </span>
            ))}
          </div>
        </div>

        <div className="room-footer">
          <div className="price">
            <span className="price-label">Diária</span>
            <span className="price-value">
              R$ {room.preco_diaria.toFixed(2)}
            </span>
          </div>
          <button
            className="reserve-button"
            disabled={room.disponibilidade !== 'livre'}
            onClick={() => {
            fetch("http://localhost:3000/atualizar-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    numero_quarto: Number(room.numero),
                    status: "ocupado"
                })
            })
            .then(response => {
                if (!response.ok) { 
                    return response.json().then(errorData => {
                        throw new Error(errorData.mensagem || `Erro do servidor: ${response.status}`);
                    }).catch(() => {
                        throw new Error(`Erro de rede ou do servidor: Status ${response.status}`);
                    });
                }
                return response.json(); 
            })
            .then(data => {
                console.log("Status atualizado com sucesso:", data);
                alert(`Status atualizado com sucesso! Mensagem do servidor: ${data.mensagem}`);
            })
            .catch(error => {
                console.error("Erro ao atualizar status:", error);
                alert("Erro ao atualizar o status do quarto! Detalhe: " + error.message);
            });
        }}
          >
            {room.disponibilidade === 'livre' ? 'Reservar' : 'Indisponível'}
            
          </button>
        </div>
      </div>

      <div className="cassandra-indicator">
        <span>Status em tempo real - Cassandra</span>
      </div>
    </div>
  )
}

export default RoomCard
