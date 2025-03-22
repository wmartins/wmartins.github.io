import { Post } from "../../lib/content";
import Excerpt from "./excerpt";

type Props = Readonly<{ title: string; posts: Post[] }>;

export default function Posts({ title, posts }: Props) {
  return (
    <>
      <h1>{title}</h1>
      {posts.map((post) => (
        <Excerpt key={post.path} post={post} />
      ))}
    </>
  );
}
