"use client";

// Importaciones combinadas
import { useEffect, useState, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Tu solución para desenvolver los params sin advertencias
  const { id } = use(params);

  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Buscamos los datos del post (nuestra lógica)
  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("post")
        .select("title, content, category")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al buscar el post:", error);
        setError("Post no encontrado.");
      } else if (data) {
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
      }
      setLoading(false);
    }

    if (id) {
      fetchPost();
    }
  }, [id]);

  // 2. Función para guardar los cambios (nuestra lógica)
  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await supabase
      .from("post")
      .update({ title, content, category })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar el post:", error);
      setError("No se pudo actualizar el post.");
    } else {
      alert("¡Post actualizado con éxito!");
      router.push("/");
    }
  }

  if (loading) return <main className="p-8"><p>Cargando...</p></main>;
  if (error) return <main className="p-8"><p className="text-red-500">{error}</p></main>;

  // 3. El formulario completo (nuestra lógica)
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-4">Editando Post</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium">Título</label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="content" className="block font-medium">Contenido</label>
          <textarea
            id="content"
            name="content"
            className="w-full p-2 border rounded"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category" className="block font-medium">Categoría</label>
          <input
            id="category"
            name="category"
            type="text"
            className="w-full p-2 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Guardar Cambios
        </button>
      </form>
    </main>
  );
}
