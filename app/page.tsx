import DFAVisualizer from '@/components/dfa-visualizer'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 z-10">
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <div className="h-full w-full grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)]">
          {Array.from({ length: 1600 }).map((_, i) => (
            <div key={i} className="border border-gray-200/30" />
          ))}
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4 text-center">
        NFA Model Simulator for Password Validation
      </h1>
      <p className="text-center mb-6 max-w-2xl text-muted-foreground">
        This NFA model validates 8-character passwords that must include at
        least one digit (0-9), one or more lowercase letters (a-z), and one or
        more uppercase letters (A-Z).
      </p>
      <DFAVisualizer />
    </main>
  )
}
