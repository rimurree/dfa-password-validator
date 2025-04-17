import DFAVisualizer from '@/components/dfa-visualizer'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Password Validator
      </h1>
      <p className="text-center mb-6 max-w-2xl">
        This NFA model validates 8-character passwords that must include at
        least one digit (0-9), one or more lowercase letters (a-z), and one or
        more uppercase letters (A-Z).
      </p>
      <DFAVisualizer />
    </main>
  )
}
