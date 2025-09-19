"use client";
    import CreatePostForm from "@/components/CreatePostForm";
    import { supabase } from "@/lib/supabaseClient";
    import { useEffect, useState } from "react";
    import { useRouter } from "next/navigation";
    import { TerminalPost } from "@/components/terminal-post"; // ¡Importamos tu nuevo componente!

    type Post = {
      id: number;
      created_at: string;
      title: string;
      content: string;
      category: string;
      slug: string;
    };

    export default function Page() {
      const router = useRouter();
      const [posts, setPosts] = useState<Post[]>([]);
      const [loading, setLoading] = useState(true);
      const [errorMsg, setErrorMsg] = useState<string | null>(null);

      async function fetchPosts() {
        // ... (esta función se queda igual)
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
        // ... (esta función se queda igual)
        const isConfirmed = window.confirm(
          "¿Estás seguro de que quieres borrar este post?"
        );
        if (isConfirmed) {
          const { error } = await supabase.from("post").delete().match({ id: postId });
          if (error) {
            console.error("Error al borrar el post:", error);
            alert("No se pudo borrar el post.");
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
        // Añadimos un fondo negro a toda la página para que el diseño luzca
        <main className="p-6 bg-black min-h-screen">
          <h1 className="text-3xl font-bold mb-4 text-green-400 font-mono text-center">
            📰 AI Feed
          </h1>
          
          <CreatePostForm onPostCreated={fetchPosts} />

          {loading && <p className="text-green-400">Cargando posts...</p>}
          {errorMsg && (
            <div className="p-3 mb-4 bg-red-900 text-red-300 border border-red-700 rounded">
              <p>{errorMsg}</p>
              <button onClick={fetchPosts} className="mt-2 px-3 py-1 bg-red-600 text-white rounded">
                Reintentar
              </button>
            </div>
          )}

          {!loading && !errorMsg && posts.length > 0 && (
            <div className="space-y-8 mt-8"> {/* Aumentamos el espacio entre posts */}
              {posts.map((post) => (
                // ¡AQUÍ USAMOS TU NUEVO COMPONENTE!
                <TerminalPost
                  key={post.id}
                  category={post.category}
                  date={new Date(post.created_at).toLocaleDateString("es-ES")}
                  title={post.title}
                  content={post.content}
                  onEdit={() => router.push(`/editar/${post.id}`)}
                  onDelete={() => handleDelete(post.id)}
                />
              ))}
            </div>
          )}
        </main>
      );
    }