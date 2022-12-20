export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-white p-5 shadow-md ring-1 ring-black ring-opacity-5 sm:p-7">
      {children}
    </div>
  )
}
