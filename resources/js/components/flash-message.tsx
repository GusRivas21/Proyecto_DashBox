
import { useEffect, useState } from 'react';

interface FlashMessageProps {
    message?: string | null;
    type?: 'success' | 'error';
}

export default function FlashMessage({
    message,
    type = 'success',
}: FlashMessageProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) {
            setVisible(false);
            return;
        }

        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [message]);

    if (!message || !visible) return null;

    const styles = type === 'success'
        ? 'bg-green-100 text-green-800 border-green-300'
        : 'bg-red-100 text-red-800 border-red-300';

    return (
        <div
            className={`mb-4 rounded-md border p-4 ${styles}`}
            role="alert"
        >
            {message}
        </div>
    );
}
