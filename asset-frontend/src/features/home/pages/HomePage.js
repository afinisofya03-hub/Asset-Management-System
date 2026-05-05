import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../auth/context/AuthContext';
import styles from './HomePage.module.css';

export default function MainLayout({ children }) {
	const { user, logout } = useContext(AuthContext);
	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<h1>NiSE Asset Management System</h1>
				<div className={styles.userInfo}>
					<span>{user?.username} ({user?.role})</span>
					<button onClick={logout} className={styles.logoutBtn}>Logout</button>
				</div>
			</header>
			
			<nav className={styles.nav}>
					<NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>📊 Dashboard</NavLink>
				<NavLink to="/assets" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>🧰 Asset Register</NavLink>
				<NavLink to="/assets/new" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>➕ Add New Record</NavLink>
			</nav>

			<main className={styles.main}>
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

