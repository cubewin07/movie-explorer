// components/ui/loader.jsx
export function Loader() {
    return (
        <div className="w-full h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 dark:border-blue-400"></div>
        </div>
    );
}
