export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      {children}
    </div>
  )
}
