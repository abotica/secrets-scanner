export const APP_CONFIG = {
	// GENERAL META INFORMATION
	meta: {
		title: 'Secrets Scanner',
		version: '1.0.0 (Beta)',
		author: 'Andrija Botica',
	},

	// UI TEXTS
	ui: {
		hero: {
			title: 'Secrets Scanner',
			subtitle: 'Security analysis tool',
			badge: 'PRO',
		},
		form: {
			repoName: 'repositoryField',
			repoLegend: 'GitHub Repository URL',
			repoPlaceholder: 'https://github.com/username/repo',
			tokenName: 'tokenField',
			tokenLegend: 'GitHub Token',
			tokenPlaceholder: 'ghp_xxxxxxxxxxxx',
			submitButton: 'Start Security Scan',
			scanningButton: 'Scanning Repository...',
			uploadLabel: 'Upload File to Scan',
			scanningText: 'Scanning...',
			uploadLimitLabel: 'Max size 10MB',
		},
		results: {
			title: 'Scan Results',
			emptyState: 'No secrets detected. Clean code!',
			emptyStateParagraph: 'Repository analysis complete. 0 issues detected.',
			columns: {
				file: 'File Path',
				type: 'Secret Type',
				line: 'Line Number',
			},
		},
		ai: {
			title: '🤖 AI Security Recommendations',
			loading: 'Generating AI report...',
			error: 'Could not generate AI report.',
		},
		alerts: {
			errorTitle: 'Scan Failed',
			genericError: 'An unexpected error occurred. Check the console.',
		},
		indicator: {
			label: 'Backend Status',
		},
		historyView: {
			title: 'Scan History',
		},
	},

	// API SETTINGS (URLS)
	api: {
		baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
		endpoints: {
			scan: '/scan-repo',
			health: '/health',
			history: '/scan-history',
			upload: '/scan-upload',
		},
	},
};
