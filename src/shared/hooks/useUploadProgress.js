import {useCallback, useState} from 'react';

// A ready-made axios `onUploadProgress` handler plus the 0-100 state it
// drives - pass `onUploadProgress` straight into a mutation's variables (every
// upload function in services/*/api.js forwards it to axios) and `progress`
// into a FileDropCard. `reset` clears it back to null once the request settles
// (success or error), since a stale 100% would otherwise linger on the card.
export function useUploadProgress() {
    const [progress, setProgress] = useState(null);

    const onUploadProgress = useCallback((event) => {
        if (!event.total) return;
        setProgress(Math.round((event.loaded / event.total) * 100));
    }, []);

    const reset = useCallback(() => setProgress(null), []);

    return {progress, onUploadProgress, reset};
}
