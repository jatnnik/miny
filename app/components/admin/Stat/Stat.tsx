interface Props {
  value: number | string
  label: string
}

export default function Stat({ value, label }: Props) {
  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      <span className="text-2xl font-semibold leading-none">{value}</span>
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  )
}
