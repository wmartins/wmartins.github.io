import React from "react";
import Container from "./container";

type Props = Readonly<{ lang: string; children?: React.ReactNode }>;

export default function Layout({ lang, children }: Props) {
  return (
    <html lang={lang}>
      <body>
        <Container>
          <main>{children}</main>
        </Container>
      </body>
    </html>
  );
}
