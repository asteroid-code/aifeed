"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CreatePostForm({ onPostCreated }: { onPostCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!title || !content || !category) {
      setErrorMsg("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("post").insert([
      {
        title,
        content,
        category,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
      },
    ]);

    if (error) {
      console.error("Error al crear post:", error);
      setErrorMsg("⚠️ Hubo un error al crear el post.");
    } else {
      setTitle("");
      setContent("");
      setCategory("");
      onPostCreated(); // avisamos al padre para que recargue la lista
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 border border-gray-300 rounded-xl shadow space-y-3"
    >
      <h2 className="text-xl font-semibold">📝 Crear nuevo post</h2>

      {errorMsg && (
        <div className="p-2 bg-red-100 text-red-700 border border-red-300 rounded">
          {errorMsg}
        </div>
      )}

      <input
        type="text"
        placeholder="Título"
        className="w-full p-2 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Contenido"
        className="w-full p-2 border rounded"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input
        type="text"
        placeholder="Categoría"
        className="w-full p-2 border rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {loading ? "Creando..." : "Crear post"}
      </button>
    </form>
  );
}
