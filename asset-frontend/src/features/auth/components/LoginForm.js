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
			<div className={styles.logoContainer}>
				<img src={companyLogo} alt="Company Logo" className={styles.logo} />
			</div>
			<h2>NiSE Inventory Management System</h2>
			<p className={styles.subtitle}>Login to your account</p>
			
			{/* Role Selection */}
			<div className={styles.roleSection}>
				<p className={styles.roleLabel}>Select Your Role:</p>
				<div className={styles.roleButtons}>
					<button
						type="button"
						className={`${styles.roleBtn} ${selectedRole === 'Admin' ? styles.roleActive : ''}`}
						onClick={() => setSelectedRole('Admin')}
					>
						👨‍💼 Admin
					</button>
					<button
						type="button"
						className={`${styles.roleBtn} ${selectedRole === 'User' ? styles.roleActive : ''}`}
						onClick={() => setSelectedRole('User')}
					>
						👤 User
					</button>
				</div>
			</div>

			{error && <div className={styles.error}>{error}</div>}
			
			<div>
				<input 
					type="text"
					placeholder="Username" 
					value={username} 
					onChange={e => setUsername(e.target.value)}
					disabled={loading}
				/>
			</div>
			<div>
				<input 
					type="password"
					placeholder="Password" 
					value={password} 
					onChange={e => setPassword(e.target.value)}
					disabled={loading}
				/>
			</div>
			<button type="submit" disabled={loading || !selectedRole}>
				{loading ? 'Logging in...' : 'Login'}
			</button>
			<div style={{ marginTop: '12px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
				<p><strong>Demo Credentials:</strong></p>
				<p>Admin: admin / admin123</p>
				<p>User: user1 / admin123</p>
			</div>
		</form>
	);
}

