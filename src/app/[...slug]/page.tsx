import { Metadata } from "next";
import { Content } from "../../lib/content";
import styles from "./page.module.css";
import Datetime from "../_components/datetime";
import Link from "next/link";

type StaticParam = Awaited<ReturnType<typeof generateStaticParams>>[number];

type Params = Promise<StaticParam>;

type Props = { params: Params };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = await Content.single(slug.join("/"));

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function Index({ params }: Props) {
  const { slug } = await params;

  const post = await Content.single(slug.join("/"));

  return (
    <article>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{post.title}</h1>
        {post.date && <Datetime date={post.date} />}
      </div>
      <div
        className={styles.post}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      {post.tags.length > 0 && (
        <footer className={styles.footer}>
          Tags:{" "}
          {post.tags.map((tag) => (
            <Link
              className={styles.tag}
              key={tag.slug}
              href={`/tags/${tag.slug}`}
            >
              {tag.name}
            </Link>
          ))}
        </footer>
      )}
    </article>
  );
}

export async function generateStaticParams() {
  const content = await Content.all();

  return content.map(({ path }) => {
    return {
      slug: path.split("/"),
    };
  });
}
