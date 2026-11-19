export default function FlashMessage({ message }: { message?: string | null }) {
    if (!message) return null;

    return (
        <div
            role="status"
            className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
        >
            {message}
        </div>
    );
}