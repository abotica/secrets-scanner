import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import { APP_CONFIG } from '../../config';

interface GitFormProps {
    handleScan: (e: React.SubmitEvent) => void;
    loading: boolean;
    repoUrl: string;
    setRepoUrl: (url: string) => void;
    token: string;
    setToken: (token: string) => void;
}

function GitForm({ handleScan, loading, repoUrl, setRepoUrl, token, setToken }: GitFormProps) {
	return (
		<form
			onSubmit={handleScan}
			className='w-full h-full flex flex-col justify-start items-center gap-4 p-4 lg:justify-center'>
			<TextInput
				name={APP_CONFIG.ui.form.repoName}
				placeholder={APP_CONFIG.ui.form.repoPlaceholder}
				legend={APP_CONFIG.ui.form.repoLegend}
				onChange={(e) => setRepoUrl(e.target.value)}
				value={repoUrl}
			/>
			<TextInput
				optional
				name={APP_CONFIG.ui.form.tokenName}
				placeholder={APP_CONFIG.ui.form.tokenPlaceholder}
				legend={APP_CONFIG.ui.form.tokenLegend}
				onChange={(e) => setToken(e.target.value)}
				value={token}
				type='password'
			/>
			<Button disabled={loading}>
				{loading ? (
					<>
						<span className='loading loading-spinner loading-xs' />
						<span>{APP_CONFIG.ui.form.scanningText}</span>
					</>
				) : (
					<span>{APP_CONFIG.ui.form.submitButton}</span>
				)}
			</Button>
		</form>
	);
}

export default GitForm;
