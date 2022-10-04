export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-white p-6 shadow-md ring-1 ring-black ring-opacity-5 sm:p-8">
      {children}
    </div>
  )
}
