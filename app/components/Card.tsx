interface CardProps {
  withMarginTop?: boolean
}

const Card: React.FC<CardProps> = ({ children, withMarginTop = false }) => (
  <div
    className={`rounded-lg border border-slate-200 bg-white p-8 shadow-sm ${
      withMarginTop ? 'mt-4' : ''
    }`}
  >
    {children}
  </div>
)

export default Card
