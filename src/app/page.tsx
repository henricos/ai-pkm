import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FsItemRepository } from "@/lib/pkm/fs-item-repository";

/**
 * Home page — requer autenticação.
 * Exibe lista de tópicos como smoke test do read model.
 * Fase 2 substituirá por shell de navegação completa.
 */
export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const repo = new FsItemRepository();
  const topics = repo.listTopics();

  return (
    <main className="min-h-screen bg-surface p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-[1.5rem] font-medium tracking-[-0.01em] text-on-surface mb-1">
            ai-pkm
          </h1>
          <p className="text-[0.875rem] text-on-surface/60">
            Autenticado como {session.user?.name}
          </p>
        </header>

        {/* Read model smoke test — Fase 2 substituirá por shell de navegação */}
        <section>
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-on-surface/60 mb-4">
            Tópicos ({topics.length})
          </h2>
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li
                key={topic.id}
                className="bg-surface-container-lowest p-4 rounded-sm shadow-ambient"
              >
                <span className="text-[0.875rem] font-medium text-on-surface">
                  {topic.id}
                </span>
                <p className="text-[0.75rem] text-on-surface/60 mt-0.5">
                  {topic.descricao}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
