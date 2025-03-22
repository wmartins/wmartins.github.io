import React from "react";
import styles from "./container.module.css";

type Props = Readonly<{ children?: React.ReactNode }>;

export default function Container({ children }: Props) {
  return <div className={styles.container}>{children}</div>;
}
