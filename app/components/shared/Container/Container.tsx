export default function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-6 sm:px-0">{children}</div>
}
