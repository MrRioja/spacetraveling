import Link from 'next/link';

import styles from './header.module.scss';

interface HeaderProps {
  homePage?: boolean;
}

export default function Header({ homePage }: HeaderProps): JSX.Element {
  const homePageStyle = homePage
    ? `${styles.container} ${styles.homePage}`
    : styles.container;

  return (
    <header className={homePageStyle}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
