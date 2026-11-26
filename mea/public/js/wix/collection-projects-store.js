// Declarations of collection-projects-store.ts: what this file exports, their arguments and what they return.
// import type { CollectionSummary, ProjectSummary } from "./portfolio-types.js";
// export interface CollectionProjectsStoreOptions {
//     initialCollection?: CollectionSummary;
//     initialProjects?: ProjectSummary[];
// }
// export interface CollectionProjectsState {
//     collection: CollectionSummary | null;
//     notFound: boolean;
//     projects: ProjectSummary[] | null;
//     error: string | null;
// }
// export interface CollectionProjectsStore {
//     getState(): CollectionProjectsState;
//     subscribe(listener: (state: CollectionProjectsState) => void): () => void;
//     start(): void;
//     stop(): void;
// }
// export declare function createCollectionProjectsStore(slug: string, { initialCollection, initialProjects }?: CollectionProjectsStoreOptions): CollectionProjectsStore;
// One collection's header + its projects, by slug, as a framework-free store — the logic behind
// useCollectionProjects, usable from React (the hook wraps it), from a static page's collection
// view, from Vue/Svelte, or as the specification for a port.
//
// SSR-friendly: pass BOTH `initialCollection` and `initialProjects` and nothing is fetched. With
// only the collection seeded, `start()` fetches its projects; with nothing seeded it resolves the
// slug first. `notFound` is the real not-found signal (collection stays null while loading too) —
// route a 404 off it, never off a transient null. One store per (slug, mount):
// createCollectionProjectsStore(slug, options), not a singleton.
import { fetchCollectionBySlug, fetchProjects } from "./portfolio.js";
export function createCollectionProjectsStore(slug, { initialCollection, initialProjects } = {}) {
    let collection = initialCollection ?? null;
    let notFound = false;
    let projects = initialProjects ?? null;
    let error = null;
    let started = false;
    const listeners = new Set();
    let snapshot = null;
    const emit = () => { snapshot = null; for (const fn of listeners)
        fn(); };
    function getState() {
        return (snapshot ??= { collection, notFound, projects, error });
    }
    return {
        getState,
        subscribe(fn) {
            const listener = () => { try {
                fn(getState());
            }
            catch (e) {
                console.error("collection-projects-store listener failed", e);
            } };
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        start() {
            if (started)
                return;
            started = true;
            if (initialCollection && initialProjects)
                return;
            (async () => {
                try {
                    const col = initialCollection ?? (await fetchCollectionBySlug(slug));
                    if (!started)
                        return;
                    if (!col) {
                        notFound = true;
                        projects = [];
                        emit();
                        return;
                    }
                    collection = col;
                    emit();
                    const list = await fetchProjects({ collectionId: col.id });
                    if (started) {
                        projects = list;
                        emit();
                    }
                }
                catch (e) {
                    if (!started)
                        return;
                    projects = [];
                    error = e instanceof Error ? e.message : String(e);
                    emit();
                }
            })();
        },
        stop() { started = false; },
    };
}
