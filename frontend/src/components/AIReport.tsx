import { SquareTerminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIReport = ({ aiReport }: { aiReport: string }) => {
	return (
		<div className='my-10 pt-10 border-t border-gray-100'>
			<div className='bg-gray-50 border border-gray-200 p-6 sm:p-8'>
				<div className='flex items-center gap-3 mb-4'>
					<SquareTerminal className='w-5 h-5 text-black' />
					<h3 className='font-bold text-sm text-black uppercase tracking-wider'>
						AI Recommendation
					</h3>
				</div>

				<div className='text-sm font-mono text-gray-700 leading-relaxed'>
					<p className='mb-4'>
						<span className='font-bold text-black'>[CRITICAL]</span> Exposed
						credentials detected.
					</p>
					<ReactMarkdown
						components={{
							h1: (props) => (
								<h1
									className='text-lg font-bold text-black mt-4 mb-2'
									{...props}
								/>
							),
							h2: (props) => (
								<h2
									className='text-base font-bold text-black mt-3 mb-2'
									{...props}
								/>
							),
							h3: (props) => (
								<h3
									className='text-sm font-bold text-black mt-2 mb-1'
									{...props}
								/>
							),
							p: (props) => (
								<p
									className='text-sm text-gray-700 mb-2 wrap-break-word'
									{...props}
								/>
							),
							ul: (props) => (
								<ul
									className='list-disc list-inside text-sm text-gray-700 mb-2 pl-0 wrap-break-word'
									{...props}
								/>
							),
							ol: (props) => (
								<ol
									className='list-decimal list-inside text-sm text-gray-700 mb-2 pl-0 wrap-break-word'
									{...props}
								/>
							),
							li: (props) => (
								<li
									className='text-sm text-gray-700 ml-2 pl-0 wrap-break-word'
									{...props}
								/>
							),
							pre: (props) => (
								<pre
									className='bg-gray-300 border border-gray-300 p-4 rounded-md text-xs text-black mb-4 font-mono whitespace-pre-wrap wrap-break-word'
									{...props}
								/>
							),
							code: ({ inline, className, children, ...props }: any) => (
								<code
									className='bg-gray-300 font-mono whitespace-pre-wrap wrap-break-word'
									{...props}>
									{children}
								</code>
							),
							blockquote: (props) => (
								<blockquote
									className='border-l-4 border-gray-400 pl-4 mt-12 italic text-gray-600 mb-2 bg-transparent'
									{...props}
								/>
							),
						}}>
						{aiReport}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
};
export default AIReport;
