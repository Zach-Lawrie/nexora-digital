// Declarations of collections-store.ts: what this file exports, their arguments and what they return.
// import type { CollectionSummary } from "./portfolio-types.js";
// export interface CollectionsStoreOptions {
//     initialCollections?: CollectionSummary[];
// }
// export interface CollectionsState {
//     collections: CollectionSummary[] | null;
//     error: string | null;
// }
// export interface CollectionsStore {
//     getState(): CollectionsState;
//     subscribe(listener: (state: CollectionsState) => void): () => void;
//     start(): void;
//     stop(): void;
// }
// export declare function createCollectionsStore({ initialCollections }?: CollectionsStoreOptions): CollectionsStore;
// The collections gallery as a framework-free store — the logic behind useCollections, usable
// from React (useCollections wraps it with useSyncExternalStore), from a static page or
// Vue/Svelte (subscribe and render), or as the specification for a port. State, subscribe/getState,
// start()/stop(), emit after every change.
//
// SSR-friendly: seed with `initialCollections` and nothing is fetched; without a seed `start()`
// fetches once. One store per mounted gallery: createCollectionsStore(), not a singleton.
import { fetchCollections } from "./portfolio.js";
export function createCollectionsStore({ initialCollections } = {}) {
    let collections = initialCollections ?? null;
    let error = null;
    let started = false;
    const listeners = new Set();
    let snapshot = null;
    const emit = () => { snapshot = null; for (const fn of listeners)
        fn(); };
    function getState() {
        return (snapshot ??= { collections, error });
    }
    return {
        getState,
        subscribe(fn) {
            const listener = () => { try {
                fn(getState());
            }
            catch (e) {
                console.error("collections-store listener failed", e);
            } };
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        start() {
            if (started)
                return;
            started = true;
            if (initialCollections)
                return;
            fetchCollections()
                .then((c) => { if (started) {
                collections = c;
                emit();
            } })
                .catch((e) => {
                if (!started)
                    return;
                collections = [];
                error = e instanceof Error ? e.message : String(e);
                emit();
            });
        },
        stop() { started = false; },
    };
}
