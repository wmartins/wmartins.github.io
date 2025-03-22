import { Metadata } from "next";
import { Content } from "../lib/content";
import Hero from "./_components/hero";
import Posts from "./_components/posts";

export default async function Index() {
  const posts = await Content.posts("en-us");

  return (
    <>
      <Hero />
      <Posts title="Recent posts" posts={posts} />
    </>
  );
}
