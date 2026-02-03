function Button({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
    return (
        <button disabled={disabled} className="btn btn-wide p-6 font-medium bg-black text-white rounded-none tracking-wider uppercase md:mt-6 md:max-w-1/3">
            {children}
        </button>
    );
}

export default Button;