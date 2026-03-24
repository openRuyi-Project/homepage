import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faCube, faDesktop, faGears } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

type EditionItem = {
    icon: IconDefinition;
    title: ReactNode;
    description: ReactNode;
    downloadLink: string;
};

const EditionList: EditionItem[] = [
    {
        icon: faServer,
        title: (
            <Translate id="homepage.editions.server.title">
                Server Edition
            </Translate>
        ),
        description: (
            <Translate id="homepage.editions.server.description">
                openRuyi Server Edition is specifically designed for use on bare-metal servers.
            </Translate>
        ),
        downloadLink: '//releases.openruyi.cn/creek/2026.03/rva23/',
    },
    {
        icon: faCube,
        title: (
            <Translate id="homepage.editions.container.title">
                Container Edition
            </Translate>
        ),
        description: (
            <Translate id="homepage.editions.container.description">
                openRuyi Container Edition is a powerful, minimal base operating
                system for both public and private cloud environments.
            </Translate>
        ),
        downloadLink: 'https://releases.openruyi.cn/creek/2026.03/rva23/',
    },
    {
        icon: faDesktop,
        title: (
            <Translate id="homepage.editions.workstation.title">
                Workstation Edition
            </Translate>
        ),
        description: (
            <Translate id="homepage.editions.workstation.description">
                openRuyi Workstation Edition is designed for desktop use and includes
                labwc.
            </Translate>
        ),
        downloadLink: '//releases.openruyi.cn/creek/2026.03/rva23/openruyi-2026.03-Workstation-labwc-dvd.iso',
    },
    {
        icon: faGears,
        title: (
            <Translate id="homepage.editions.zero.title">
                Zero Edition
            </Translate>
        ),
        description: (
            <Translate id="homepage.editions.zero.description">
                openRuyi Zero is a special Edition for SoC bringup and kernel
                development, especially in the pre-Silicon stage.
            </Translate>
        ),
        downloadLink: '//releases.openruyi.cn/creek/2026.03/rva23/',
    },
];

function EditionCard({ icon, title, description, downloadLink }: EditionItem) {
    return (
        <div className={styles.editionCard}>
            <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <div className={styles.cardContent}>
                <Heading as="h3" className={styles.cardTitle}>
                    {title}
                </Heading>
                <p className={styles.cardDescription}>{description}</p>
                <Link
                    className={`button button--primary ${styles.downloadBtn}`}
                    to={downloadLink}>
                    <Translate id="homepage.editions.download">Download now</Translate>
                </Link>
            </div>
        </div>
    );
}

export default function HomepageEditions(): ReactNode {
    return (
        <section className={styles.editions}>
            <div className="container">
                <Heading as="h2" className={styles.editionsTitle}>
                    <Translate id="homepage.editions.sectionTitle">Choose your editions here</Translate>
                </Heading>
                <div className={styles.editionsGrid}>
                    {EditionList.map((props, idx) => (
                        <EditionCard key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
