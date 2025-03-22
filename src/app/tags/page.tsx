import { Metadata } from "next";
import { Content } from "../../lib/content";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All tags",
  description: "All posts with tags",
};

export default async function Page() {
  const content = await Content.all();

  const groupByTagsAndCount = () => {
    return content.reduce(
      (acc, post) => {
        for (const tag of post.tags) {
          acc[tag.slug] = acc[tag.slug] || { name: tag.name, count: 0 };
          acc[tag.slug].count += 1;
        }

        return acc;
      },
      {} as Record<string, { name: string; count: number }>,
    );
  };

  const groups = groupByTagsAndCount();

  return (
    <>
      <h1>All tags</h1>
      <ul>
        {Object.entries(groups)
          .sort(([a], [b]) => {
            if (a > b) {
              return 1;
            }

            if (a === b) {
              return 0;
            }

            return -1;
          })
          .map(([slug, tag]) => (
            <li key={slug}>
              <Link href={`/tags/${slug}`}>
                {tag.name} ({tag.count})
              </Link>
            </li>
          ))}
      </ul>
    </>
  );
}
