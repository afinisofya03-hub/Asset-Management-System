import React from 'react';
import Dashboard from '../components/Dashboard';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
	return (
		<div className={styles.container}>
			<header className={styles.pageIntro}>
				<div className={styles.pageIntroInfo}>
					<p className={styles.subTitle}>Executive Summary</p>
					<h1>Business Asset Dashboard</h1>
					<p>Monitor enterprise asset performance, inventory health, and operational risk from one central view.</p>
				</div>
			</header>

			<section className={styles.pageBody}>
				<Dashboard />
			</section>
		</div>
	);
}

