import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../../api/axios';
import styles from './Dashboard.module.css';
import { isStockCategory } from '../config/categoryMasters';

export default function Dashboard() {
	const [assets, setAssets] = useState([]);
	const [categories, setCategories] = useState([]);
	const reportRef = useRef(null);

	useEffect(() => {
		api.getAssets().then(setAssets);
		api.getCategories().then(setCategories);
	}, []);

	const handleExportPdf = async () => {
		if (!reportRef.current) return;

		const canvas = await html2canvas(reportRef.current, {
			scale: 2,
			useCORS: true,
			backgroundColor: '#ffffff'
		});

		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF('landscape', 'pt', 'a4');
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

		pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
		pdf.save('dashboard-report.pdf');
	};

	const getCategoryName = (categoryId) => (
		categories.find(category => Number(category.id) === Number(categoryId))?.name || 'Unknown'
	);

	const buildAssetSummary = items => {
		const grouped = {};

		items.forEach(item => {
			const key = `${item.categoryId}||${item.asset_name}`;
			if (!grouped[key]) {
				grouped[key] = {
					category: getCategoryName(item.categoryId),
					asset_name: item.asset_name,
					total: 0,
					assigned: 0,
					available: 0,
					maintenance: 0,
					disposal: 0
				};
			}

			grouped[key].total += 1;
			if (item.condition_status === 'Asset in use') grouped[key].assigned += 1;
			else if (item.condition_status === 'Assets in Storage') grouped[key].available += 1;
			else if (item.condition_status === 'Assets under repair') grouped[key].maintenance += 1;
			else if (item.condition_status === 'Assets disposed') grouped[key].disposal += 1;
		});

		return Object.values(grouped).sort((left, right) => (
			left.category.localeCompare(right.category) || left.asset_name.localeCompare(right.asset_name)
		));
	};

	const buildStockSummary = items => {
		const grouped = {};

		items.forEach(item => {
			const key = `${item.categoryId}||${item.asset_name}`;
			if (!grouped[key]) {
				grouped[key] = {
					category: getCategoryName(item.categoryId),
					asset_name: item.asset_name,
					opening: 0,
					received: 0,
					issued: 0,
					balance: 0,
					value: 0
				};
			}

			grouped[key].opening += Number(item.opening_stock || 0);
			grouped[key].received += Number(item.received_stock || 0);
			grouped[key].issued += Number(item.issue_stock || 0);
			grouped[key].balance += Number(item.closing_stock || 0);
			grouped[key].value += Number(item.total_price || 0);
		});

		return Object.values(grouped).sort((left, right) => (
			left.category.localeCompare(right.category) || left.asset_name.localeCompare(right.asset_name)
		));
	};

	const calculateOverallMetrics = items => {
		let total = 0, assigned = 0, available = 0, maintenance = 0, disposal = 0;
		
		items.forEach(item => {
			if (isStockCategory(item.categoryId)) {
				// Stock-based: count units
				total += (item.closing_stock || 0);
				assigned += (item.issue_stock || 0);
				available += Math.max(0, (item.closing_stock || 0) - (item.issue_stock || 0));
			} else {
				// Traditional: count items
				total += 1;
				if (item.condition_status === 'Asset in use') assigned += 1;
				else if (item.condition_status === 'Assets in Storage') available += 1;
				else if (item.condition_status === 'Assets under repair') maintenance += 1;
				else if (item.condition_status === 'Assets disposed') disposal += 1;
			}
		});
		
		return { total, assigned, available, maintenance, disposal };
	};

	const calculateAssetMetrics = items => {
		let totalAssets = 0;
		let inUse = 0;
		let inStorage = 0;
		let underRepair = 0;
		let disposed = 0;

		items.forEach(item => {
			totalAssets += 1;
			if (item.condition_status === 'Asset in use') inUse += 1;
			else if (item.condition_status === 'Assets in Storage') inStorage += 1;
			else if (item.condition_status === 'Assets under repair') underRepair += 1;
			else if (item.condition_status === 'Assets disposed') disposed += 1;
		});

		return { totalAssets, inUse, inStorage, underRepair, disposed };
	};

	const calculateStockMetrics = items => {
		let totalBalance = 0;
		let totalReceived = 0;
		let totalIssued = 0;
		let totalValue = 0;

		items.forEach(item => {
			totalBalance += Number(item.closing_stock || 0);
			totalReceived += Number(item.received_stock || 0);
			totalIssued += Number(item.issue_stock || 0);
			totalValue += Number(item.total_price || 0);
		});

		return { totalBalance, totalReceived, totalIssued, totalValue };
	};

	const assetItems = assets.filter(item => !isStockCategory(item.categoryId));
	const stockItems = assets.filter(item => isStockCategory(item.categoryId));
	const overallMetrics = calculateOverallMetrics(assets);
	const assetMetrics = calculateAssetMetrics(assetItems);
	const stockMetrics = calculateStockMetrics(stockItems);
	const assetSummary = buildAssetSummary(assetItems);
	const stockSummary = buildStockSummary(stockItems);

	const utilizationPercent = overallMetrics.total > 0 ? Math.round((overallMetrics.assigned / overallMetrics.total) * 100) : 0;
	const stockTurnoverPercent = stockMetrics.totalReceived > 0 ? Math.round((stockMetrics.totalIssued / stockMetrics.totalReceived) * 100) : 0;
	const averageStockValue = stockItems.length > 0 ? stockMetrics.totalValue / stockItems.length : 0;

	return (
		<div className={styles.container} ref={reportRef}>
			<div className={styles.pageHeader}>
				<h2>Dashboard Overview</h2>
				<p>Combined visibility for all office assets and inventory stock without filters.</p>
			</div>

		<div className={styles.toolbar}>
			<button className={styles.exportButton} onClick={handleExportPdf}>
				Export PDF
			</button>
		</div>

		<div className={styles.analyticsRow}>
			<div className={styles.analyticsCard}>
				<span>Asset Utilization</span>
				<strong>{utilizationPercent}%</strong>
				<p>Share of total assets currently assigned or issued.</p>
			</div>
			<div className={styles.analyticsCard}>
				<span>Inventory Turnover</span>
				<strong>{stockTurnoverPercent}%</strong>
				<p>Issued stock relative to received stock over the current dataset.</p>
			</div>
			<div className={styles.analyticsCard}>
				<span>Average Stock Value</span>
				<strong>RM {averageStockValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</strong>
				<p>Average estimated value per stock line item.</p>
			</div>
		</div>

		<div className={styles.mainStats}>
				<div className={styles.statCard + ' ' + styles.card1}>
					<div className={styles.statIcon}>📦</div>
					<div className={styles.statContent}>
						<div className={styles.statLabel}>Total Records / Units</div>
						<div className={styles.statValue}>{overallMetrics.total}</div>
					</div>
				</div>
				<div className={styles.statCard + ' ' + styles.card2}>
					<div className={styles.statIcon}>✓</div>
					<div className={styles.statContent}>
						<div className={styles.statLabel}>In Use / Issued</div>
						<div className={styles.statValue}>{overallMetrics.assigned}</div>
					</div>
				</div>
				<div className={styles.statCard + ' ' + styles.card3}>
					<div className={styles.statIcon}>📍</div>
					<div className={styles.statContent}>
						<div className={styles.statLabel}>Available / Balance</div>
						<div className={styles.statValue}>{overallMetrics.available}</div>
					</div>
				</div>
				<div className={styles.statCard + ' ' + styles.card4}>
					<div className={styles.statIcon}>🔧</div>
					<div className={styles.statContent}>
						<div className={styles.statLabel}>Maintenance</div>
						<div className={styles.statValue}>{overallMetrics.maintenance}</div>
					</div>
				</div>
				<div className={styles.statCard + ' ' + styles.card5}>
					<div className={styles.statIcon}>🗑️</div>
					<div className={styles.statContent}>
						<div className={styles.statLabel}>Disposed</div>
						<div className={styles.statValue}>{overallMetrics.disposal}</div>
					</div>
				</div>
			</div>

			<div className={styles.sectionGrid}>
				<section className={styles.sectionCard}>
					<div className={styles.sectionHeader}>
						<h3>Office Assets</h3>
						<p>All fixed assets in one section, grouped by category and asset name.</p>
					</div>
					<div className={styles.sectionStats}>
						<div className={styles.miniStat}><span>Total Assets</span><strong>{assetMetrics.totalAssets}</strong></div>
						<div className={styles.miniStat}><span>In Use</span><strong>{assetMetrics.inUse}</strong></div>
						<div className={styles.miniStat}><span>In Storage</span><strong>{assetMetrics.inStorage}</strong></div>
						<div className={styles.miniStat}><span>Under Repair</span><strong>{assetMetrics.underRepair}</strong></div>
						<div className={styles.miniStat}><span>Disposed</span><strong>{assetMetrics.disposed}</strong></div>
					</div>
					<div className={styles.tableWrapper}>
						<table className={styles.summaryTable}>
							<thead>
								<tr>
									<th>No</th>
									<th>Category</th>
									<th>Asset Name</th>
									<th>Total</th>
									<th>In Use</th>
									<th>In Storage</th>
									<th>Under Repair</th>
									<th>Disposed</th>
									<th>Usage %</th>
								</tr>
							</thead>
							<tbody>
								{assetSummary.length === 0 ? (
									<tr><td colSpan="9" className={styles.emptyCell}>No asset records available</td></tr>
								) : assetSummary.map((item, index) => {
									const usage = item.total > 0 ? Math.round((item.assigned / item.total) * 100) : 0;
									return (
										<tr key={`${item.category}-${item.asset_name}`}>
											<td>{index + 1}</td>
											<td><strong>{item.category}</strong></td>
											<td>{item.asset_name}</td>
											<td className={styles.centerText}>{item.total}</td>
											<td className={styles.centerText}><span className={styles.goodText}>{item.assigned}</span></td>
											<td className={styles.centerText}><span className={styles.infoText}>{item.available}</span></td>
											<td className={styles.centerText}><span className={styles.warnText}>{item.maintenance}</span></td>
											<td className={styles.centerText}><span className={styles.badText}>{item.disposal}</span></td>
											<td className={styles.centerText}>
												<div className={styles.progressContainer}>
													<div className={styles.progressBarTrack}>
														<div className={styles.progressBar} style={{width:`${usage}%`}}></div>
													</div>
													<span className={styles.progressText}>{usage}%</span>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</section>

				<section className={styles.sectionCard}>
					<div className={styles.sectionHeader}>
						<h3>Inventory Stock</h3>
						<p>All stock categories shown together with opening, received, issued, and current balance.</p>
					</div>
					<div className={styles.sectionStats}>
						<div className={styles.miniStat}><span>Total Balance</span><strong>{stockMetrics.totalBalance}</strong></div>
						<div className={styles.miniStat}><span>Received</span><strong>{stockMetrics.totalReceived}</strong></div>
						<div className={styles.miniStat}><span>Issued</span><strong>{stockMetrics.totalIssued}</strong></div>
						<div className={styles.miniStat}><span>Total Value</span><strong>RM {stockMetrics.totalValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</strong></div>
					</div>
					<div className={styles.tableWrapper}>
						<table className={styles.summaryTable}>
							<thead>
								<tr>
									<th>No</th>
									<th>Category</th>
									<th>Item Name</th>
									<th>Opening</th>
									<th>Received</th>
									<th>Issued</th>
									<th>Balance</th>
									<th>Total Value (RM)</th>
								</tr>
							</thead>
							<tbody>
								{stockSummary.length === 0 ? (
									<tr><td colSpan="8" className={styles.emptyCell}>No inventory stock records available</td></tr>
								) : stockSummary.map((item, index) => (
									<tr key={`${item.category}-${item.asset_name}`}>
										<td>{index + 1}</td>
										<td><strong>{item.category}</strong></td>
										<td>{item.asset_name}</td>
										<td className={styles.centerText}>{item.opening}</td>
										<td className={styles.centerText}><span className={styles.goodText}>{item.received}</span></td>
										<td className={styles.centerText}><span className={styles.warnText}>{item.issued}</span></td>
										<td className={styles.centerText}><span className={styles.infoText}>{item.balance}</span></td>
										<td className={styles.rightText}>RM {item.value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</div>
	);
}


