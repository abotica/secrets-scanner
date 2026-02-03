import { useState } from 'react';
import { APP_CONFIG } from '../../config';

interface UploadFormProps {
	fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function UploadInput({ fileInputRef }: UploadFormProps) {
	const [fileSelected, setFileSelected] = useState(false);

	const handleFileChange = () => {
		const files = fileInputRef.current?.files;
		setFileSelected(!!(files && files.length > 0));
	};

	return (
		<fieldset className='fieldset w-full md:w-1/3 '>
			<div className='flex justify-between items-center'>
				<label className='block text-xs font-bold text-neutral-800 py-2 tracking-wider md:text-sm'>
					{APP_CONFIG.ui.form.uploadLabel}
				</label>
				<label className='label text-gray-500 md:text-sm'>
					{APP_CONFIG.ui.form.uploadLimitLabel}
				</label>
			</div>

			<input
				type='file'
				ref={fileInputRef}
				onChange={handleFileChange}
				className={`file-input file-input-neutral w-full bg-white border-gray-300 rounded-none outline-none md:text-sm ${
					fileSelected ? 'text-neutral-800' : 'text-gray-500'
				}`}
			/>
		</fieldset>
	);
}

export default UploadInput;
