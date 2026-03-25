import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageEditions from '@site/src/components/HomepageEditions';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import Translate, {translate} from '@docusaurus/Translate';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            <Translate id="homepage.header.button">
              Getting Started
            </Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={translate({
        id: 'homepage.layout.title',
        message: 'A Linux Distribution for RISC-V',
        description: 'Home page title shown in browser/tab',
      })}
      description={translate({
        id: 'homepage.layout.description',
        message: 'openRuyi is a Linux distribution built for RISC-V.',
        description: 'Home page meta description',
      })}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageEditions />
      </main>
    </Layout>
  );
}