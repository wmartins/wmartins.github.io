import Link from "next/link";
import styles from "./nav.module.css";

type Item = { href: string; title: string };

type Props = Readonly<{ items: Item[] }>;

export default function Nav({ items }: Props) {
  return (
    <nav className={styles.nav}>
      {items.map(({ href, title }) => (
        <Link key={href} href={href}>
          {title}
        </Link>
      ))}
    </nav>
  );
}
