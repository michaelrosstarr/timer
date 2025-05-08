// Type declarations for the Wake Lock API
// Based on: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API

interface WakeLockSentinel extends EventTarget {
    released: boolean;
    type: 'screen';
    release(): Promise<void>;
    onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null;
}

interface WakeLock {
    request(type: 'screen'): Promise<WakeLockSentinel>;
}

declare global {
    interface Navigator {
        wakeLock: WakeLock;
    }
}

export { };
