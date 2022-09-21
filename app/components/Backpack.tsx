export default function Backpack({ size = 32 }) {
  return (
    <div className="block rounded-lg bg-red-400 bg-opacity-20 p-2">
      <img
        src="/backpack.png"
        alt="Rucksack Emoji"
        height={size}
        width={size}
      />
    </div>
  )
}
