import { Metadata } from "next";
import { Content } from "../../../lib/content";
import Excerpt from "../../_components/excerpt";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const posts = await Content.all();

  const post = posts.find(post => post.tags.find(tag => tag.slug === slug));

  const tag = post?.tags.find((tag) => tag.slug === slug);

  const title = ["Tagged posts"];

  if (tag) {
    title.push(tag.name);
  }

  return {
    title: title.join(" "),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const content = await Content.all();

  const posts = content.filter((post) =>
    post.tags.find((tag) => tag.slug === slug),
  );

  return (
    <>
      <h1>All tagged posts</h1>
      {posts.map((post) => (
        <Excerpt key={post.path} post={post} />
      ))}
    </>
  );
}

export async function generateStaticParams() {
  const posts = await Content.all();

  const tags = posts.flatMap((post) => post.tags.map(p => p.slug));

  const unique = new Set(tags);

  return Array(...unique).map(tag => ({
    slug: tag
  }));
}
