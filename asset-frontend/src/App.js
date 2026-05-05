import React, { useContext } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import './App.css';
import LoginPage from './features/auth/pages/LoginPage';
import MainLayout from './features/home/pages/HomePage';
import DashboardPage from './features/assets/pages/DashboardPage';
import AssetPage from './features/assets/pages/AssetPage';
import FormFactory from './features/assets/forms/FormFactory';
import ViewFactory from './features/assets/views/ViewFactory';
import { AuthContext } from './features/auth/context/AuthContext';

function App() {
	const { user } = useContext(AuthContext);
	const Private = ({ children }) => user ? children : <Navigate to="/login" />;
	
	// Layout wrapper that includes header & nav
	const LayoutWithNav = ({ children }) => (
		<MainLayout>
			{children}
		</MainLayout>
	);

	// Wrapper to read categoryId route param and render ViewFactory
	function CategoryViewWrapper() {
		const { categoryId } = useParams();
		const id = parseInt(categoryId, 10);
		return <ViewFactory categoryId={id} />;
	}

	function LegacyEditRedirect() {
		const { id } = useParams();
		const mode = window.location.pathname.includes('/office-stock') ? 'stock' : 'asset';
		return <Navigate to={`/assets/${id}/edit?mode=${mode}`} replace />;
	}

	return (
		<div className="App">
			<Routes>
				<Route path="/login" element={<LoginPage />} />
			<Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
				<Route path="/dashboard" element={<Private><LayoutWithNav><DashboardPage /></LayoutWithNav></Private>} />
				<Route path="/assets" element={<Private><LayoutWithNav><AssetPage /></LayoutWithNav></Private>} />
				<Route path="/office-assets" element={<Navigate to="/assets?mode=asset" replace />} />
				<Route path="/office-stock" element={<Navigate to="/assets?mode=stock" replace />} />
				<Route path="/assets/new" element={<Private><LayoutWithNav><FormFactory /></LayoutWithNav></Private>} />
				<Route path="/office-assets/new" element={<Navigate to="/assets/new?mode=asset" replace />} />
				<Route path="/office-stock/new" element={<Navigate to="/assets/new?mode=stock" replace />} />
				<Route path="/assets/:id/edit" element={<Private><LayoutWithNav><FormFactory /></LayoutWithNav></Private>} />
				<Route path="/office-assets/:id/edit" element={<LegacyEditRedirect />} />
				<Route path="/office-stock/:id/edit" element={<LegacyEditRedirect />} />
				{/* Category-specific list views (optional) - use ViewFactory to render category views */}
				<Route path="/assets/category/:categoryId" element={<Private><LayoutWithNav><CategoryViewWrapper /></LayoutWithNav></Private>} />
				
				<Route path="*" element={<div style={{padding:20}}>Page not found</div>} />
			</Routes>
		</div>
	);
}

export default App;

