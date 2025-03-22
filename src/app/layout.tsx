import React from "react";
import "./layout.css";
import Container from "./_components/container";

import "highlight.js/styles/default.css";
import { Metadata } from "next";

type Props = Readonly<{
  children: React.ReactNode;
}>;

export function generateMetadata(): Metadata {
  const title = "William's Space";
  const description = "William Martins on the web";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function Layout({ children }: Props) {
  // TODO: We should check how to detect the language here
  return (
    <html lang="en-us">
      <body>
        <Container>
          <main>{children}</main>
        </Container>
      </body>
    </html>
  );
}
