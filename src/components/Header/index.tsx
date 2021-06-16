import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <>
      <div className={styles.headerContainer}>
        <Link href="">
          <div className={styles.imageContainer}>
            <img src="/images/logo.png" alt="logo" />
            SpaceTravelling
          </div>
        </Link>
      </div>
    </>
  );
}
