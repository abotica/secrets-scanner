import type { HistoryItem } from '../types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface HistoryProps {
	history: HistoryItem[];
	loadHistoryItem: (item: HistoryItem) => void;
}

function History({ history, loadHistoryItem }: HistoryProps) {
	const formatDate = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		return date.toLocaleDateString();
	};

	if (history.length === 0) {
		return (
			<div className='space-y-6 px-4'>
				<div className='border border-gray-200 rounded-none p-12 text-center'>
					<p className='text-gray-500 text-sm'>No activity yet. Start by scanning a repository or uploading a file.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6 px-4'>
			<div className='border border-gray-200 rounded-none'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left text-sm'>
						<thead className='bg-black text-white'>
							<tr>
								<th className='py-3 px-4 font-bold uppercase tracking-wider text-xs'>Target</th>
								<th className='py-3 px-4 font-bold uppercase tracking-wider text-xs'>Type</th>
								<th className='py-3 px-4 font-bold uppercase tracking-wider text-xs'>Date</th>
								<th className='py-3 px-4 font-bold uppercase tracking-wider text-xs'>Status</th>
								<th className='py-3 px-4 font-bold uppercase tracking-wider text-xs text-right'>Action</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-100'>
							{history.map((item, index) => {
								const hasSecrets = item.summary.files_with_secrets > 0;
								return (
									<tr
										key={item.id}
										className={`group transition-colors ${
											index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
										} hover:bg-gray-100`}
									>
										<td className='py-4 px-4 font-medium text-black'>
											<div className='flex items-center gap-2'>
												<span className=' decoration-1 truncate'>
													{item.target}
												</span>
											</div>
										</td>
										<td className='py-4 px-4 text-gray-500 font-mono text-xs uppercase'>
											{item.type}
										</td>
										<td className='py-4 px-4 text-gray-500 font-mono text-xs'>
											{formatDate(item.timestamp)}
										</td>
										<td className='py-4 px-4'>
											<div
												className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${
													hasSecrets
														? 'bg-black text-white border-black'
														: 'bg-white border-gray-200 text-gray-600'
												}`}
											>
												{hasSecrets ? (
													<AlertTriangle className='w-3 h-3' />
												) : (
													<CheckCircle className='w-3 h-3' />
												)}
												<span className='text-[10px] font-bold uppercase tracking-widest'>
													{hasSecrets
														? `${item.summary.files_with_secrets} Issue${
																item.summary.files_with_secrets > 1 ? 's' : ''
														  }`
														: 'Safe'}
												</span>
											</div>
										</td>
										<td className='py-4 px-4 text-right'>
											<button
												onClick={() => loadHistoryItem(item)}
												className='text-xs font-bold uppercase cursor-pointer tracking-wider text-black hover:text-gray-600 underline decoration-1 underline-offset-4'
											>
												View
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default History;
