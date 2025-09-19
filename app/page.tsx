"use client" // Converting to Client Component to fix event handler error

import { TerminalPost } from "@/components/terminal-post"

export default function Home() {
  const handleEdit = () => {
    console.log("Editando post...")
  }

  const handleDelete = () => {
    console.log("Borrando post...")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 relative overflow-hidden">
      {/* Subtle animated background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-400/5 animate-pulse-slow"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/8 rounded-full blur-3xl animate-float-delayed"></div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-green-400 font-mono mb-8">AI Feed</h1>

        <TerminalPost
          category="Inteligencia Artificial"
          date="2025-09-19"
          title="Los nuevos avances en IA generativa están revolucionando el desarrollo"
          content={`Los modelos de lenguaje de última generación han alcanzado capacidades 
impresionantes en la generación de código, texto y contenido multimedia.

Características principales:
• Mejor comprensión del contexto
• Generación más precisa
• Integración con herramientas de desarrollo
• Capacidades multimodales avanzadas

Esto representa un cambio paradigmático en cómo interactuamos 
con la tecnología y desarrollamos software.`}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <TerminalPost
          category="Desarrollo Web"
          date="2025-09-19"
          title="Next.js 15 introduce nuevas funcionalidades para el desarrollo moderno"
          content={`La nueva versión de Next.js trae mejoras significativas:

- App Router mejorado
- Mejor rendimiento en SSR
- Nuevos hooks para manejo de estado
- Integración nativa con Vercel AI SDK

Estas actualizaciones facilitan la creación de aplicaciones
web más rápidas y eficientes.`}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <TerminalPost
          category="Tutorial"
          date="2025-09-19"
          title="Cómo crear componentes reutilizables en React"
          content={`Guía paso a paso para crear componentes modulares:

1. Definir las props necesarias
2. Implementar TypeScript para type safety
3. Usar composition patterns
4. Aplicar principios de diseño consistentes

Los componentes bien diseñados mejoran la mantenibilidad
y escalabilidad de las aplicaciones.`}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </main>
  )
}
