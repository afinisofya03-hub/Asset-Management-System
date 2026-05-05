import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../auth/context/AuthContext';
import styles from './HomePage.module.css';

export default function MainLayout({ children }) {
	const { user, logout } = useContext(AuthContext);
	const [navOpen, setNavOpen] = useState(true);

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.headerBrand}>
					<button
						type="button"
						className={styles.navToggleBtn}
						onClick={() => setNavOpen(prev => !prev)}
						aria-label={navOpen ? 'Collapse sidebar' : 'Expand sidebar'}
					>
						<span className={styles.hamburger} />
					</button>
					<h1>NiSE Asset Management System</h1>
				</div>
				<div className={styles.userInfo}>
					<span>{user?.username} ({user?.role})</span>
					<button onClick={logout} className={styles.logoutBtn}>Logout</button>
				</div>
			</header>
			
			<nav className={`${styles.nav} ${navOpen ? styles.navOpen : styles.navClosed}`}>
				<NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
					<span className={styles.navIcon}>📊</span>
					<span className={styles.navText}>Dashboard</span>
				</NavLink>
				<NavLink to="/assets" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
					<span className={styles.navIcon}>🧰</span>
					<span className={styles.navText}>Asset Register</span>
				</NavLink>
				<NavLink to="/assets/new" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
					<span className={styles.navIcon}>➕</span>
					<span className={styles.navText}>Add New Record</span>
				</NavLink>
			</nav>

			<main className={`${styles.main} ${navOpen ? '' : styles.mainCollapsed}`}>
				<div className={styles.contentContainer}>
					{children ? (
						children
					) : (
						<div className={styles.welcomeSection}>
							<h2>Welcome, {user?.username}!</h2>
							<p>Select an option from the navigation to get started.</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

