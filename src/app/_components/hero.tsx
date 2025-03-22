import Link from "next/link";
import styles from "./hero.module.css";
import Nav from "./nav";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <section>
        <h1 className={styles.title}>
          <Link href="/">William's Space</Link>
        </h1>
        <p>Random thoughts and experimentation.</p>
        <Nav
          items={[
            { href: "/about", title: "about" },
            { href: "/contact", title: "contact" },
            { href: "/tags", title: "tags" },
            { href: "/pt-br", title: "pt-br" },
          ]}
        />
      </section>
    </section>
  );
}
