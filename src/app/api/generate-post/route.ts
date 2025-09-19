// src/app/api/auto-generate/route.ts
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🆓 SOLO PROVEEDORES COMPLETAMENTE GRATUITOS
const FREE_AI_PROVIDERS = [
  {
    name: 'groq-llama',
    enabled: !!process.env.GROQ_API_KEY,
    weight: 40, // Mayor peso - es el mejor gratuito
    dailyLimit: 14400, // tokens por minuto (muy generoso)
    model: 'llama-3.1-8b-instant'
  },
  {
    name: 'huggingface-gpt2',
    enabled: !!process.env.HUGGINGFACE_API_KEY,
    weight: 25,
    dailyLimit: 30000, // characters por mes
    model: 'gpt2-large'
  },
  {
    name: 'huggingface-t5',
    enabled: !!process.env.HUGGINGFACE_API_KEY,
    weight: 20,
    dailyLimit: 30000,
    model: 'google/flan-t5-large'
  },
  {
    name: 'cohere-free',
    enabled: !!process.env.COHERE_API_KEY,
    weight: 15,
    dailyLimit: 1000, // calls por mes (gratis para siempre)
    model: 'command-light'
  }
];

// Temas organizados por horario
const MORNING_TOPICS = [
  "OpenAI nuevos desarrollos",
  "DeepSeek modelos", 
  "nuevos modelos de IA",
  "avances en machine learning",
  "benchmarks de IA"
];

const AFTERNOON_TOPICS = [
  "ingeniería de prompts",
  "prompt engineering",
  "AI coding tools",
  "DeepSeek coder",
  "vibe coding"
];

const EVENING_TOPICS = [
  "ChatGPT nuevas funciones",
  "Claude AI",
  "Gemini AI",
  "herramientas de desarrollo con IA",
  "IA generativa nuevos usos"
];

function getTopicsByHour() {
  const currentHour = new Date().getHours();
  
  if (currentHour >= 6 && currentHour < 12) {
    return MORNING_TOPICS;
  } else if (currentHour >= 12 && currentHour < 18) {
    return AFTERNOON_TOPICS;
  } else {
    return EVENING_TOPICS;
  }
}

// Selector inteligente - prioriza los más confiables
function selectFreeAIProvider() {
  const availableProviders = FREE_AI_PROVIDERS.filter(p => p.enabled);
  
  if (availableProviders.length === 0) {
    throw new Error("⚠️ No hay proveedores GRATUITOS configurados. Configura al menos GROQ_API_KEY");
  }
  
  // Algoritmo de selección con bias hacia los más confiables
  const totalWeight = availableProviders.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const provider of availableProviders) {
    random -= provider.weight;
    if (random <= 0) {
      return provider;
    }
  }
  
  return availableProviders[0]; // Fallback al primero (Groq)
}

// 🚀 GROQ - El más potente y confiable (GRATIS)
async function generateWithGroq(topic: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Eres AIFeed, un periodista experto en IA. Responde SIEMPRE con JSON válido.'
        },
        {
          role: 'user',
          content: createPrompt(topic)
        }
      ],
      max_tokens: 600,
      temperature: 0.8,
      top_p: 0.9
    })
  });
  
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// 🤖 HuggingFace - Modelos open source (GRATIS)
async function generateWithHuggingFace(topic: string, model: string) {
  const modelEndpoint = model === 'gpt2-large' ? 
    'https://api-inference.huggingface.co/models/gpt2-large' :
    'https://api-inference.huggingface.co/models/google/flan-t5-large';
  
  const response = await fetch(modelEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: createSimplifiedPrompt(topic),
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9,
        repetition_penalty: 1.1
      },
      options: {
        wait_for_model: true,
        use_cache: false
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`);
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';
}

// 🔥 Cohere - Command Light (GRATIS para siempre)
async function generateWithCohere(topic: string) {
  const response = await fetch('https://api.cohere.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'command-light',
      prompt: createPrompt(topic),
      max_tokens: 400,
      temperature: 0.8,
      k: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Cohere API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.generations[0].text;
}

function createPrompt(topic: string) {
  return `Crea un artículo sobre: "${topic}"

IMPORTANTE: Responde SOLO con un JSON válido en este formato exacto:

{
  "title": "Título atractivo de 8-12 palabras sobre ${topic}",
  "content": "Artículo completo de 120-180 palabras explicando ${topic} con detalles técnicos, tendencias actuales y desarrollo profesional pero accesible. Incluye introducción enganchadora, desarrollo principal y conclusión.",
  "category": "IA Avanzada",
  "source": "AIFeed Bot",
  "topic": "${topic}",
  "relevance_score": 8,
  "word_count": 150,
  "generated_at": "${new Date().toISOString()}"
}

Requisitos del contenido:
- Entre 120-180 palabras total
- Tono profesional pero accesible
- Incluye detalles técnicos específicos  
- Enfócate en tendencias actuales
- NO uses fechas específicas recientes`;
}

function createSimplifiedPrompt(topic: string) {
  return `Escribe un artículo profesional sobre ${topic} en formato JSON:
{"title": "título de 8-12 palabras", "content": "artículo de 120-180 palabras con detalles técnicos", "category": "IA Avanzada", "relevance_score": 8}`;
}

async function generateFreeAIPost(topic: string) {
  const selectedProvider = selectFreeAIProvider();
  console.log(`🆓 Usando IA GRATUITA: ${selectedProvider.name} (límite: ${selectedProvider.dailyLimit})`);
  
  let response: string;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      switch (selectedProvider.name) {
        case 'groq-llama':
          response = await generateWithGroq(topic);
          break;
        case 'huggingface-gpt2':
        case 'huggingface-t5':
          response = await generateWithHuggingFace(topic, selectedProvider.model);
          break;
        case 'cohere-free':
          response = await generateWithCohere(topic);
          break;
        default:
          throw new Error(`Proveedor no soportado: ${selectedProvider.name}`);
      }
      
      // Intentar extraer JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch && selectedProvider.name.includes('huggingface')) {
        // Para HuggingFace, crear JSON manualmente si no viene en formato JSON
        const cleanResponse = response.replace(/.*inputs?:\s*"([^"]*)".*/, '$1').trim();
        const postData = {
          title: `${topic}: Nuevas Tendencias en IA`,
          content: cleanResponse.slice(0, 400) + " Esta tecnología está revolucionando el desarrollo de aplicaciones inteligentes.",
          category: "IA Avanzada",
          source: "AIFeed Bot",
          topic: topic,
          relevance_score: 7,
          word_count: cleanResponse.split(/\s+/).length,
          generated_at: new Date().toISOString(),
          ai_provider: selectedProvider.name,
          ai_model: selectedProvider.model
        };
        return postData;
      }
      
      if (jsonMatch) {
        const postData = JSON.parse(jsonMatch[0]);
        
        // Agregar metadata del proveedor
        postData.ai_provider = selectedProvider.name;
        postData.ai_model = selectedProvider.model;
        
        // Validar y ajustar contenido
        if (!postData.content || postData.content.length < 100) {
          throw new Error("Contenido muy corto");
        }
        
        const wordCount = postData.content.split(/\s+/).length;
        postData.word_count = wordCount;
        
        if (wordCount < 80) {
          console.warn(`⚠️  Post corto: ${wordCount} palabras, reintentando...`);
          attempts++;
          continue;
        }
        
        return postData;
      }
      
      throw new Error("No se pudo extraer JSON de la respuesta");
      
    } catch (error) {
      attempts++;
      console.error(`❌ Intento ${attempts}/${maxAttempts} falló con ${selectedProvider.name}:`, error);
      
      if (attempts >= maxAttempts) {
        // Fallback a otros proveedores gratuitos
        const fallbackProviders = FREE_AI_PROVIDERS.filter(p => 
          p.enabled && p.name !== selectedProvider.name
        );
        
        if (fallbackProviders.length > 0) {
          console.log(`🔄 Fallback a ${fallbackProviders[0].name}`);
          selectedProvider.name = fallbackProviders[0].name;
          selectedProvider.model = fallbackProviders[0].model;
          attempts = 0; // Reset attempts for fallback
          continue;
        }
      }
      
      // Esperar antes del retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
  
  return null;
}

export async function GET() {
  try {
    const startTime = Date.now();
    console.log(`🆓 Iniciando generación con IAs GRATUITAS - ${new Date().toLocaleString('es-AR')}`);
    
    // Verificar proveedores disponibles
    const enabledProviders = FREE_AI_PROVIDERS.filter(p => p.enabled);
    console.log(`📊 Proveedores GRATUITOS disponibles: ${enabledProviders.map(p => p.name).join(', ')}`);
    
    if (enabledProviders.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No hay APIs gratuitas configuradas. Configura GROQ_API_KEY o HUGGINGFACE_API_KEY",
        setup_guide: "Ve a console.groq.com para obtener tu API key gratuita"
      }, { status: 500 });
    }
    
    // Seleccionar tema según horario
    const availableTopics = getTopicsByHour();
    const selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    
    console.log(`🎯 Tema seleccionado: ${selectedTopic}`);
    
    // Generar post con IAs gratuitas
    const postData = await generateFreeAIPost(selectedTopic);
    
    if (!postData || !postData.title || !postData.content) {
      throw new Error("No se pudo generar el post con las IAs gratuitas disponibles");
    }
    
    // Verificar duplicados recientes
    const { data: existingPosts } = await supabase
      .from('post')
      .select('title')
      .ilike('title', `%${postData.title.slice(0, 20)}%`)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);
    
    if (existingPosts && existingPosts.length > 0) {
      console.log(`⚠️  Post similar ya existe en las últimas 24h`);
      return NextResponse.json({
        success: false,
        message: "Post duplicado detectado, omitiendo generación",
        topic: selectedTopic,
        ai_provider: postData.ai_provider
      });
    }
    
    // Crear slug único
    const slug = `${postData.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .slice(0, 40)}-${Date.now()}`;
    
    // Guardar en Supabase
    const { data: newPost, error } = await supabase
      .from('post')
      .insert([{
        title: postData.title,
        content: postData.content,
        category: postData.category,
        slug,
        created_at: new Date().toISOString(),
        author: `AIFeed Bot (${postData.ai_provider})`,
        status: 'published',
        views: 0,
        likes: 0,
        shares: 0,
        topic: postData.topic,
        source: postData.source,
        relevance_score: postData.relevance_score,
        word_count: postData.word_count,
        auto_generated: true,
        ai_provider: postData.ai_provider
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error guardando en Supabase: ${error.message}`);
    }
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Post GRATUITO generado exitosamente en ${executionTime}ms`);
    console.log(`📝 Título: "${postData.title}"`);
    console.log(`🆓 IA utilizada: ${postData.ai_provider} (GRATIS)`);
    console.log(`📊 Palabras: ${postData.word_count}`);
    
    return NextResponse.json({
      success: true,
      message: "Post automático generado con IA GRATUITA",
      data: {
        id: newPost.id,
        title: newPost.title,
        category: newPost.category,
        topic: newPost.topic,
        word_count: newPost.word_count,
        ai_provider: newPost.ai_provider,
        cost: "🆓 $0.00 (GRATIS)",
        execution_time_ms: executionTime,
        scheduled_time: new Date().toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires'
        })
      }
    });
    
  } catch (error) {
    console.error("❌ Error en generación con IAs gratuitas:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      cost: "🆓 $0.00",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}