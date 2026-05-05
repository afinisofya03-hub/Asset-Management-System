import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/context/AuthContext';
import styles from './LoginForm.module.css';
import companyLogo from '../../../img/companyLogo.jpeg';

export default function LoginForm() {
	const { login } = useContext(AuthContext);
	const [selectedRole, setSelectedRole] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const nav = useNavigate();

	const submit = async e => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			if (!selectedRole) {
				setError('Please select a role first');
				setLoading(false);
				return;
			}
			if (!username || !password) {
				setError('Please enter username and password');
				setLoading(false);
				return;
			}
			await login({ username, password });
			nav('/dashboard');
		} catch (err) {
			setError(err.message || 'Invalid credentials');
			setLoading(false);
		}
	};

	return (
		<form className={styles.form} onSubmit={submit}>
			<div className={styles.header}>
				<div className={styles.logoContainer}>
					<img src={companyLogo} alt="Company Logo" className={styles.logo} />
				</div>
				<div className={styles.titleGroup}>
					<h2>Inventory Management</h2>
					<p className={styles.subtitle}>Secure access to your asset management dashboard.</p>
				</div>
			</div>

			<div className={styles.roleSection}>
				<div className={styles.roleHeader}>
					<p className={styles.roleLabel}>Access Role</p>
					<p className={styles.roleHint}>Choose a role before signing in.</p>
				</div>
				<div className={styles.roleButtons}>
					<button
						type="button"
						className={`${styles.roleBtn} ${selectedRole === 'Admin' ? styles.roleActive : ''}`}
						onClick={() => setSelectedRole('Admin')}
						aria-pressed={selectedRole === 'Admin'}
					>
						<span className={`${styles.roleIcon} ${styles.adminIcon}`} />
						<span>Admin</span>
					</button>
					<button
						type="button"
						className={`${styles.roleBtn} ${selectedRole === 'User' ? styles.roleActive : ''}`}
						onClick={() => setSelectedRole('User')}
						aria-pressed={selectedRole === 'User'}
					>
						<span className={`${styles.roleIcon} ${styles.userIcon}`} />
						<span>User</span>
					</button>
				</div>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.inputGroup}>
				<label htmlFor="username" className={styles.label}>Username</label>
				<input
					type="text"
					id="username"
					placeholder="Enter your username"
					value={username}
					onChange={e => setUsername(e.target.value)}
					disabled={loading}
				/>
			</div>

			<div className={styles.inputGroup}>
				<label htmlFor="password" className={styles.label}>Password</label>
				<input
					type="password"
					id="password"
					placeholder="Enter your password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					disabled={loading}
				/>
			</div>

			<button type="submit" disabled={loading || !selectedRole}>
				{loading ? 'Logging in...' : 'Sign in'}
			</button>

			<div className={styles.noteBox}>
				<p className={styles.noteTitle}>Demo Credentials</p>
				<p>Admin: <strong>admin</strong> / <strong>admin123</strong></p>
				<p>User: <strong>user1</strong> / <strong>admin123</strong></p>
			</div>
		</form>
	);
}

