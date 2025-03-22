import Link from "next/link";
import React from "react";

type Props = Readonly<{ children: React.ReactNode }>;

export default function Layout({ children }: Props) {
  return (
    <>
      <Link href="/">← go home</Link>
      {children}
    </>
  );
}
