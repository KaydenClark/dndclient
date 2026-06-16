import '@testing-library/jest-dom/vitest';

if (!globalThis.localStorage) {
    let store = {};

    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: {
            clear() {
                store = {};
            },
            getItem(key) {
                return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
            },
            key(index) {
                return Object.keys(store)[index] || null;
            },
            removeItem(key) {
                delete store[key];
            },
            setItem(key, value) {
                store[key] = String(value);
            },
            get length() {
                return Object.keys(store).length;
            }
        }
    });
}
