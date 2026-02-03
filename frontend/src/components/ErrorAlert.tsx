import { motion, AnimatePresence } from 'framer-motion';

function ErrorAlert({error}: {error: string | null}) {
    return (
        <AnimatePresence>
				{error && (
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 50 }}
						transition={{ duration: 0.3 }}
						className='fixed bottom-4 right-4 z-50'
					>
						<div className='alert alert-error shadow-lg'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6 shrink-0 stroke-current'
								fill='none'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
							<span>{error}</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
    );
}

export default ErrorAlert;