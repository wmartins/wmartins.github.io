import { z } from "zod";
import { join } from "path";
import { readdir, readFile } from "fs/promises";
import grayMatter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import remarkParse from "remark-parse";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeExtractExcerpt from "rehype-extract-excerpt";

namespace Metadata {
  const schema = z.object({
    title: z.string(),
    date: z.date().optional(),
    tags: z.array(z.string()).default([]),
  });

  export const parse = (value: unknown) => schema.parse(value);
}

type Metadata = ReturnType<typeof Metadata.parse>;

export type Post = {
  title: string;
  excerpt: string;
  date?: Date;
  path: string;
  html: string;
  tags: Tag[];
};

namespace Post {
  export const defaultLanguage = "en-us";

  const normalize = (path: string) => {
    const isPost = /\d{4}\/\d{2}/;

    if (!isPost.test(path)) {
      return path;
    }

    const [_year, _month, ...parts] = path.split("/");

    if (parts.length > 1 && parts[0] !== defaultLanguage) {
      return join("post", ...parts);
    }

    return join("post", defaultLanguage, ...parts);
  };

  export const toFile = (path: string) => {
    return `${normalize(path)}.md`;
  };

  export const toSlug = (
    path: string,
    language: string,
    metadata: Metadata,
  ) => {
    const normalized = path
      .replace(/^post\//, "")
      .replace(new RegExp(`^${defaultLanguage}/`), "")
      .replace(/\.md$/, "");

    const prefix = metadata.date
      ? `${metadata.date.getFullYear()}/${(metadata.date.getUTCMonth() + 1).toString().padStart(2, "0")}/${language !== defaultLanguage ? `${language}/` : ""}`
      : "";

    return `${prefix}${normalized}`;
  };
}

type Tag = {
  name: string;
  slug: string;
};

namespace Tag {
  const WORD_SEPARATOR_REGEX =
    /[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/;
  const CAPITAL_PLUS_LOWER_REGEX =
    /[A-ZÀ-Ý\u00C0-\u00D6\u00D9-\u00DD][a-zà-ÿ]/g;
  const CAPITAL_REGEX = /[A-ZÀ-Ý\u00C0-\u00D6\u00D9-\u00DD]+/g;

  const kebabCase = (str: string) => {
    const result = str
      .replace(
        CAPITAL_PLUS_LOWER_REGEX,
        (match) => ` ${match[0].toLowerCase()}${match[1]}`,
      )
      .replace(CAPITAL_REGEX, (match) => ` ${match.toLowerCase()}`)
      .trim()
      .split(WORD_SEPARATOR_REGEX)
      .join("-")
      .replace(/^-/, "")
      .replace(/-\s*$/, "");

    return result;
  };

  export const create = (tag: string): Tag => {
    return {
      name: tag,
      slug: kebabCase(tag).replace(/ /g, "-"),
    };
  };
}

export namespace Content {
  const paths = {
    all: join(process.cwd(), "content"),
    posts: join(process.cwd(), "content", "post"),
  };

  const read = async (folder: string, file: string): Promise<Post> => {
    const contents = await readFile(join(folder, file));

    const { data, content } = grayMatter(contents);

    const metadata = Metadata.parse(data);

    const processed = await remark()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeHighlight)
      .use(rehypeExtractExcerpt)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(content);

    const excerpt =
      typeof processed.data.excerpt === "string" ? processed.data.excerpt : "";

    const language = folder.startsWith(paths.posts)
      ? folder.replace(`${paths.posts}/`, "")
      : Post.defaultLanguage;

    return {
      path: Post.toSlug(file, language, metadata),
      date: metadata.date,
      title: metadata.title,
      excerpt: excerpt,
      html: processed.toString(),
      tags: metadata.tags.map((tag) => Tag.create(tag)),
    };
  };

  const sort = (posts: Post[]) => {
    const ordered = posts.sort((a, b) => {
      if (a.date && b.date) {
        return Number(b.date) - Number(a.date);
      }

      return 0;
    });

    return ordered;
  };

  export const single = async (path: string) => {
    return read(paths.all, Post.toFile(path));
  };

  export const all = async () => {
    const folder = paths.all;
    const loaded = await readdir(folder, { recursive: true });

    const extracted = await Promise.all(
      loaded
        .filter((file) => file.endsWith(".md"))
        .map((file) => read(folder, file)),
    );

    return sort(extracted);
  };

  export const posts = async (lang: string) => {
    const folder = join(paths.posts, lang);
    const loaded = await readdir(folder, { recursive: true });

    const extracted = await Promise.all(
      loaded
        .filter((file) => file.endsWith(".md"))
        .map((file) => read(folder, file)),
    );

    return sort(extracted);
  };
}
