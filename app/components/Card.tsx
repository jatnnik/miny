interface CardProps {
  withMarginTop?: boolean
  children: React.ReactNode
}

const Card = ({ children, withMarginTop = false }: CardProps) => (
  <div
    className={`rounded-lg border border-slate-200 bg-white p-8 shadow-sm ${
      withMarginTop ? 'mt-4' : ''
    }`}
  >
    {children}
  </div>
)

export default Card
