interface TextInputProps {
	placeholder: string;
	legend: string;
	name: string;
	optional?: boolean;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	type?: string;
}

function TextInput({
	placeholder,
	legend,
	name,
	optional = false,
	value,
	onChange,
	type = 'text',
}: TextInputProps) {
	return (
		<fieldset className='fieldset w-full md:w-1/3'>
			<div className='flex justify-between items-center'>
				<legend className='fieldset-legend text-neutral-800 md:text-sm'>
					{legend}
				</legend>
				<p
					hidden={!optional}
					className='label text-xs text-gray-500 md:text-sm'>
					Optional
				</p>
			</div>
			<input
				name={name}
				type={type}
				className='input px-4 py-3.5 text-sm w-full bg-white placeholder:text-gray-400 text-neutral-800 border-gray-300 rounded-none  focus:border-black focus:ring-1 focus:ring-black focus:outline-none md:text-sm md:py-6'
				placeholder={placeholder}
				value={value}
				onChange={onChange}
			/>
		</fieldset>
	);
}

export default TextInput;
