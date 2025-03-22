import styles from "./datetime.module.css";

type Props = Readonly<{ date: Date }>;

export default function Datetime({ date }: Props) {
  const formatter = new Intl.DateTimeFormat("en-us", { dateStyle: "medium" });

  return (
    <time className={styles.datetime} dateTime={date.toLocaleTimeString()}>
      {formatter.format(date)}
    </time>
  );
}
