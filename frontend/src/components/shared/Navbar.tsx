import type { TabName } from "../../types";
import Tab from "./Tab";

interface NavbarProps {
    activeTab: TabName;
    setActiveTab: (tab: TabName) => void;
    onViewHistory: () => void;
    onTabChange: () => void;
}

function Navbar({ activeTab, setActiveTab, onViewHistory, onTabChange }: NavbarProps) {
	const handleTabChange = (tab: TabName) => {
		setActiveTab(tab);
		if (tab === 'history') {
			onViewHistory();
		} else {
			onTabChange();
		}
	};

	return (
		<nav className='tabs tabs-box rounded-none bg-white border border-black w-full p-0 gap-0'>
			<Tab activeTab={activeTab} setActiveTab={handleTabChange} name="git" ariaLabel="GitHub Repo" />
			<Tab activeTab={activeTab} setActiveTab={handleTabChange} name="upload" ariaLabel="Local File Upload" />
			<Tab activeTab={activeTab} setActiveTab={handleTabChange} name="history" ariaLabel="History" />
		</nav>
	);
}

export default Navbar;
