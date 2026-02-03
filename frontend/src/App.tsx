import type { HistoryItem } from './types';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { APP_CONFIG } from './config';
import { motion, AnimatePresence } from 'framer-motion';

import StatusIndicator from './components/StatusIndicator';
import ErrorAlert from './components/ErrorAlert';
import ScanResults from './components/ScanResults';
import EmptyState from './components/EmptyState';
import GitForm from './components/forms/GitForm';
import UploadForm from './components/forms/UploadForm';
import AIReport from './components/AIReport';
import History from './components/History';
import Navbar from './components/shared/Navbar';

function App() {
	const [backendStatus, setBackendStatus] = useState<
		'online' | 'offline' | 'loading'
	>('loading');
	const [repoUrl, setRepoUrl] = useState('');
	const [token, setToken] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [results, setResults] = useState<any>(null);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [view, setView] = useState<'scan' | 'history'>('scan');
	const [activeTab, setActiveTab] = useState<'git' | 'upload' | 'history'>(
		'git',
	);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Health status check - repeatedly check every 30 seconds
	useEffect(() => {
		const checkHealth = async () => {
			try {
				await axios.get(`${APP_CONFIG.api.baseUrl}/health`);
				setBackendStatus('online');
			} catch (error) {
				console.error('Health check failed:', error);
				setBackendStatus('offline');
			}
		};

		checkHealth();

		setInterval(checkHealth, 30000);
	}, []);

	// Fetch history on mount
	useEffect(() => {
		fetchHistory();
	}, []);

	// Auto close error after 3 seconds
	useEffect(() => {
		if (!error) return;

		const timer = setTimeout(() => {
			setError(null);
		}, 3000);

		return () => clearTimeout(timer);
	}, [error]);

	// Clear results when switching tabs
	useEffect(() => {
		setResults(null);
	}, [activeTab]);

	// Handle scan/form submission for github repo
	const handleScan = async (e: React.SubmitEvent) => {
		e.preventDefault();

		if (!repoUrl || repoUrl.trim() === '') {
			setError('Please enter a repository URL.');
			return;
		}

		setLoading(true);
		setError(null);
		setResults(null);

		try {
			const response = await axios.post(`${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.scan}`, {
				repo_url: repoUrl,
				github_token: token,
			});
			setResults(response.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
			fetchHistory();
		}
	};

	const handleFileUpload = async (e: React.SubmitEvent) => {
		e.preventDefault();
		const files = fileInputRef.current?.files;

		if (!files || files.length === 0) {
			setError('Please select a file.');
			return;
		}

		const file = files[0];
		setLoading(true);
		setError(null);
		setResults(null);

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await axios.post(
				`${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.upload}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);

			setResults(response.data);
		} catch (err: any) {
			console.error(err);
			setError('Upload failed or file is too large.');
		} finally {
			setLoading(false);
			fetchHistory();
		}
	};

	// Function to fetch history
	const fetchHistory = async () => {
		setError(null);

		try {
			const res = await axios.get(`${APP_CONFIG.api.baseUrl}${APP_CONFIG.api.endpoints.history}`);
			console.log('Fetched history:', res.data);
			setHistory(res.data);
		} catch (e) {
			console.error('Failed to load history', e);
			setError('Failed to load scan history');
		}
	};

	// Function to load a history item
	const loadHistoryItem = (item: HistoryItem) => {
		const data = item.full_result;
		setResults(data);
	};

	return (
		<>
			{/* TABS NAVBAR */}
			<Navbar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				onViewHistory={() => setView('history')}
				onTabChange={() => setView('scan')}
			/>

			<AnimatePresence mode='wait'>
				{view === 'scan' ? (
					<motion.div
						key='scan'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}>
						{/* HEADINGS */}
						<div className='flex flex-col items-center justify-center mt-10'>
							<h1 className='text-3xl font-light text-black uppercase tracking-wide mb-2 md:text-5xl'>
								{APP_CONFIG.ui.hero.title}
							</h1>
							<h2 className='text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mb-6 md:text-sm'>
								{APP_CONFIG.ui.hero.subtitle}
							</h2>
						</div>

						{/* STATUS INDICATOR */}
						<StatusIndicator
							label={APP_CONFIG.ui.indicator.label}
							status={backendStatus}
						/>

						{/* VIEWS BASED ON TABS */}
						{activeTab === 'git' ? (
							<GitForm
								handleScan={handleScan}
								loading={loading}
								repoUrl={repoUrl}
								setRepoUrl={setRepoUrl}
								token={token}
								setToken={setToken}
							/>
						) : (
							<UploadForm
								handleFileUpload={handleFileUpload}
								loading={loading}
								fileInputRef={fileInputRef}
							/>
						)}
					</motion.div>
				) : (
					<motion.div
						key='history'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className='mt-10'>
						<div className='flex flex-col items-center justify-center'>
							<h1 className='text-3xl font-light text-black uppercase tracking-wide mb-6 md:text-5xl'>
								{APP_CONFIG.ui.historyView.title}
							</h1>
						</div>
						<History
							history={history}
							loadHistoryItem={loadHistoryItem}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* RESULTS */}
			<AnimatePresence mode='wait'>
				{results?.findings.length > 0 && (
					<motion.div
						key='results'
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className='overflow-hidden px-4'>
						<ScanResults results={results} />
						<AIReport aiReport={results.ai_report} />
					</motion.div>
				)}
				{results && results?.findings.length === 0 && (
					<motion.div
						key='empty'
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className='overflow-hidden px-4'>
						<EmptyState />
					</motion.div>
				)}
			</AnimatePresence>

			<ErrorAlert error={error} />
		</>
	);
}

export default App;
