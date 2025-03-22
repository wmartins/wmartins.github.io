import Link from "next/link";
import { Post } from "../../lib/content";
import styles from "./excerpt.module.css";
import Datetime from "./datetime";

type Props = Readonly<{ post: Post }>;

export default function Excerpt({ post }: Props) {
  return (
    <section className={styles.excerpt}>
      <h1 className={styles.title}>
        <Link href={`/${post.path}`} className={styles.link}>
          {post.title}
        </Link>
      </h1>
      {post.date && <Datetime date={post.date} />}
      <p>{post.excerpt}</p>
    </section>
  );
}
