function ScanResults({results}: {results: any}) {
    return (
    <div className="my-12 space-y-6">
      <div className="flex items-baseline justify-between border-b border-black pb-2">
        <h3 className="text-lg font-bold text-black uppercase tracking-wide">
          Scan Results
        </h3>
        <span className="text-sm font-medium text-black">
          {results?.findings.length} ISSUES FOUND
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="text-black font-bold uppercase text-xs tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 pl-0">File Path</th>
              <th className="px-4 py-3">Secret Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.findings.map((f: any, index: number) => {
              const failedDetectors = Object.entries(f.detectors || {})
                .filter(([, detector]: any) => detector?.passed === false)
                .map(([name]) => name);

              return (
              <tr 
                key={index} 
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="px-4 py-4 pl-0 font-mono text-gray-600 text-xs break-all">
                  {f.filename}
                </td>
                <td className="px-4 py-4">
                  {failedDetectors.length === 0 ? (
                    <span className="text-gray-400 text-xs">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {failedDetectors.map((detector: string) => (
                        <span
                          key={detector}
                          className="inline-flex items-center px-2 py-1 border border-red-700 text-[10px] font-bold text-red-700 uppercase tracking-wider"
                        >
                          {detector}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    );
}

export default ScanResults;