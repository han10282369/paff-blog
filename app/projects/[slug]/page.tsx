import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) notFound();
  const content = await unified().use(remarkParse).use(remarkRehype).use(rehypeStringify)
    .process(project.long_description || project.description);
  const links = [
    { label: "GitHub", url: project.link_github },
    { label: "Gitee", url: project.link_gitee },
    { label: "在线演示", url: project.link_live },
    { label: "项目资料", url: project.link_docs },
  ].filter(link => /^(https?:\/\/|\/(?!\/))/.test(link.url));

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-10 md:py-12">
      <Link href="/projects" className="text-sm text-sky-600 dark:text-sky-400">返回项目列表</Link>
      <article className="mt-5 rounded-3xl border border-white/40 bg-white/40 p-5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-800/50 md:p-10">
        <h1 className="text-2xl font-bold leading-snug text-slate-900 dark:text-white md:text-3xl">{project.name}</h1>
        <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">{project.description}</p>
        {project.cover_image && <img src={project.cover_image} alt={`${project.name}界面截图`} className="my-8 h-auto w-full rounded-xl" />}
        <div className="prose prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: String(content) }} />
        {links.length > 0 && <nav aria-label="项目链接" className="mt-8 flex flex-wrap gap-5">
          {links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline underline-offset-4 dark:text-sky-400">{link.label}</a>)}
        </nav>}
      </article>
    </main>
  );
}
