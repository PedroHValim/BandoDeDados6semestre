import '../styles/ServiceCard.css'

interface Service {
  nome: string
  descricao: string
  preco: number
  incluso: boolean
}

interface ServiceCardProps {
  service: Service
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="service-card">
      <div className="service-header">
        <h3>{service.nome}</h3>
        {service.incluso && (
          <span className="included-badge">Incluído</span>
        )}
      </div>

      <p className="service-description">{service.descricao}</p>

      <div className="service-footer">
        <div className="service-price">
          {service.incluso ? (
            <span className="free-price">Gratuito</span>
          ) : (
            <>
              <span className="price-label">A partir de</span>
              <span className="price-value">R$ {service.preco.toFixed(2)}</span>
            </>
          )}
        </div>
        <button className="service-button">
          {service.incluso ? 'Ver Mais' : 'Solicitar'}
        </button>
      </div>
    </div>
  )
}

export default ServiceCard
