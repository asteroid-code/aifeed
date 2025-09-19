"use client";
import CreatePostForm from "@/components/CreatePostForm";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Post = {
  id: number;
  created_at: string;
  title: string;
  content: string;
  category: string;
  slug: string;
};

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function fetchPosts() {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from("post")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error al obtener posts:", error);
      setErrorMsg("⚠️ Hubo un error al cargar los posts.");
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(postId: number) {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que quieres borrar este post?"
    );
    if (isConfirmed) {
      const { error } = await supabase.from("post").delete().match({ id: postId });
      if (error) {
        console.error("Error al borrar el post:", error);
        alert("No se pudo borrar el post. Revisa la consola para más detalles.");
      } else {
        alert("Post borrado con éxito.");
        fetchPosts();
      }
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">📰 AI Feed</h1>

      <CreatePostForm onPostCreated={fetchPosts} />

      {loading && <p>Cargando posts...</p>}
      {errorMsg && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-300 rounded">
          <p>{errorMsg}</p>
          <button
            onClick={fetchPosts}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      )}
      {!loading && !errorMsg && posts.length === 0 && <p>No hay posts aún.</p>}
      {!loading && !errorMsg && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border border-gray-300 rounded-xl p-4 shadow"
            >
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString()} — {post.category}
              </p>
              <p className="mt-2">{post.content}</p>
              <div className="mt-4 flex items-center space-x-4">
                <a
                  href={`https://twitter.com/intent/tweet?url=https://aifeed.com/post/${post.slug}&text=Noticia de AIFeed: ${post.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-300"
                >
                  Compartir en X
                </a>
                <a
                  href={`/editar/${post.id}`}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm hover:bg-yellow-600"
                >
                  Editar
                </a>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                >
                  Borrar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
