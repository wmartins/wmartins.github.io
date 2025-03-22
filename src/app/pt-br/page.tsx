import { Content } from "../../lib/content";
import Hero from "../_components/hero";
import Posts from "../_components/posts";

export default async function Page() {
  const posts = await Content.posts("pt-br");

  return (
    <>
      <Hero />
      <Posts title="Postagens recentes" posts={posts} />
    </>
  );
}
