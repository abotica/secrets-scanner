import Button from '../ui/Button';
import { APP_CONFIG } from '../../config';
import UploadInput from '../ui/UploadInput';

interface UploadFormProps {
	handleFileUpload: (e: React.SubmitEvent) => void;
	loading: boolean;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function UploadForm({
	handleFileUpload,
	loading,
	fileInputRef,
}: UploadFormProps) {
	return (
		<form
			onSubmit={handleFileUpload}
			className='w-full h-full flex flex-col justify-start items-center gap-4 p-4 lg:mb-32'>
			<UploadInput fileInputRef={fileInputRef} />
			<Button disabled={loading}>
				{loading ? (
					<>
						<span className='loading loading-spinner loading-xs uppercase' />
						<span>{APP_CONFIG.ui.form.scanningText}</span>
					</>
				) : (
					<span className='uppercase'>{APP_CONFIG.ui.form.submitButton}</span>
				)}
			</Button>
		</form>
	);
}

export default UploadForm;
