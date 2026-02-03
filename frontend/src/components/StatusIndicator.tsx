interface StatusIndicatorProps {
  label: string;
  status: "online" | "offline" | "loading";
}

function StatusIndicator({ label, status }: StatusIndicatorProps) {
  let colorClass = "bg-gray-300";
  
  if (status === "online") colorClass = "bg-green-700";
  if (status === "offline") colorClass = "bg-red-700";

  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-gray-100 bg-gray-50 md:justify-center md:bg-transparent md:border-0">
      <div className="relative flex h-2 w-2 leading-none">
        {(status === "online" || status === "loading") && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colorClass}`}></span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-none">
        {label}
      </span>
    </div>
  );
}

export default StatusIndicator;