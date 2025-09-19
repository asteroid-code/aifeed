// src/app/api/auto-generate/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Temas específicos organizados por horario para variedad
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

async function generateAIPost(topic: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    Eres "AIFeed", un periodista especializado en Inteligencia Artificial.
    
    TEMA A INVESTIGAR: "${topic}"
    
    Crea un artículo informativo sobre desarrollos y tendencias actuales en este tema.
    
    ESTRUCTURA REQUERIDA:
    - Título llamativo (8-12 palabras)
    - Intro enganchadora (20-30 palabras)
    - Desarrollo principal explicando el tema (80-120 palabras)
    - Conclusión o implicación futura (15-25 palabras)
    
    REQUISITOS:
    - TOTAL: 120-180 palabras exactamente
    - Tono profesional pero accesible
    - Incluye detalles técnicos específicos
    - Enfócate en tendencias y desarrollos significativos
    - NO menciones fechas específicas muy recientes
    
    Devuelve ÚNICAMENTE un JSON válido:
    {
      "title": "Título atractivo de 8-12 palabras",
      "content": "Artículo completo de 120-180 palabras",
      "category": "IA Avanzada, Prompt Engineering, Coding con IA, o Herramientas IA",
      "source": "AIFeed Bot",
      "topic": "${topic}",
      "relevance_score": número_del_1_al_10,
      "word_count": número_total_de_palabras,
      "generated_at": "${new Date().toISOString()}"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const postData = JSON.parse(jsonMatch[0]);
      
      // Validar longitud del contenido
      const wordCount = postData.content.split(/\s+/).length;
      if (wordCount < 120 || wordCount > 180) {
        console.warn(`⚠️  Post fuera de rango: ${wordCount} palabras`);
      }
      
      return postData;
    }
    return null;
  } catch (error) {
    console.error(`Error generando post para ${topic}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const startTime = Date.now();
    console.log(`🤖 Iniciando generación automática - ${new Date().toLocaleString('es-AR')}`);
    
    // Seleccionar tema según horario
    const availableTopics = getTopicsByHour();
    const selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    
    console.log(`🎯 Tema seleccionado: ${selectedTopic}`);
    
    // Generar post
    const postData = await generateAIPost(selectedTopic);
    
    if (!postData || !postData.title || !postData.content) {
      throw new Error("No se pudo generar el post");
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
        topic: selectedTopic
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
        author: 'AIFeed Bot',
        status: 'published',
        views: 0,
        likes: 0,
        shares: 0,
        topic: postData.topic,
        source: postData.source,
        relevance_score: postData.relevance_score,
        word_count: postData.word_count,
        auto_generated: true
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error guardando en Supabase: ${error.message}`);
    }
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Post automático generado exitosamente en ${executionTime}ms`);
    console.log(`📝 Título: "${postData.title}"`);
    console.log(`📊 Palabras: ${postData.word_count}`);
    
    return NextResponse.json({
      success: true,
      message: "Post automático generado exitosamente",
      data: {
        id: newPost.id,
        title: newPost.title,
        category: newPost.category,
        topic: newPost.topic,
        word_count: newPost.word_count,
        execution_time_ms: executionTime,
        scheduled_time: new Date().toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires'
        })
      }
    });
    
  } catch (error) {
    console.error("❌ Error en generación automática:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// También permitir POST para testing manual
export async function POST() {
  return GET();
}