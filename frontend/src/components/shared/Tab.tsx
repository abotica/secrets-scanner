import { Clock } from "lucide-react";
import type { TabName } from "../../types";

interface TabProps {
    activeTab: TabName;
    setActiveTab: (tab: TabName) => void;
    name: TabName;
    ariaLabel: string;
}

function Tab({activeTab, setActiveTab, name, ariaLabel}: TabProps) {
	const getLabel = (tabName: TabName) => {
		if (tabName === 'git') return 'Git';
		if (tabName === 'upload') return 'Upload';
		return 'History';
	};

	return (
		<label
			className={`tab rounded-none text-xs font-medium uppercase tracking-wider flex-1 px-0 cursor-pointer flex items-center justify-center md:text-lg md:h-12 ${
				activeTab === name
					? 'tab-active bg-black text-white border-black'
					: 'text-black'
			}`}
		>
			<input
				type='radio'
				name={name}
				className='hidden'
				aria-label={ariaLabel}
				checked={activeTab === name}
				onChange={() => setActiveTab(name)}
			/>
			<span className='md:hidden'>{getLabel(name)}</span>
			<span className='hidden md:block'>{ariaLabel}</span>
			{name === 'history' && <Clock className='hidden md:block w-5 h-5 ml-2' />}
		</label>
	);
}

export default Tab;
