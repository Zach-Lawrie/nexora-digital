// Declarations of project-detail-store.ts: what this file exports, their arguments and what they return.
// import type { GalleryItem, ProjectDetail } from "./portfolio-types.js";
// export interface ProjectDetailStoreOptions {
//     initialProject?: ProjectDetail;
//     initialItems?: GalleryItem[];
// }
// export interface ProjectDetailState {
//     project: ProjectDetail | null;
//     notFound: boolean;
//     items: GalleryItem[] | null;
//     error: string | null;
// }
// export interface ProjectDetailStore {
//     getState(): ProjectDetailState;
//     subscribe(listener: (state: ProjectDetailState) => void): () => void;
//     start(): void;
//     stop(): void;
// }
// export declare function createProjectDetailStore(slug: string, { initialProject, initialItems }?: ProjectDetailStoreOptions): ProjectDetailStore;
// Project detail + media gallery, by slug, as a framework-free store — the logic behind
// useProjectDetail, usable from React (the hook wraps it), from a static page's project view,
// from Vue/Svelte, or as the specification for a port.
//
// SSR-friendly: pass BOTH `initialProject` and `initialItems` and nothing is fetched. With only
// the project seeded, `start()` fetches its gallery; with nothing seeded it resolves the slug
// first. `notFound` is the real not-found signal (project stays null while loading). One store
// per (slug, mount): createProjectDetailStore(slug, options), not a singleton.
import { fetchProjectBySlug, fetchProjectGallery } from "./portfolio.js";
export function createProjectDetailStore(slug, { initialProject, initialItems } = {}) {
    let project = initialProject ?? null;
    let notFound = false;
    let items = initialItems ?? null;
    let error = null;
    let started = false;
    const listeners = new Set();
    let snapshot = null;
    const emit = () => { snapshot = null; for (const fn of listeners)
        fn(); };
    function getState() {
        return (snapshot ??= { project, notFound, items, error });
    }
    return {
        getState,
        subscribe(fn) {
            const listener = () => { try {
                fn(getState());
            }
            catch (e) {
                console.error("project-detail-store listener failed", e);
            } };
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        start() {
            if (started)
                return;
            started = true;
            if (initialProject && initialItems)
                return;
            (async () => {
                try {
                    const proj = initialProject ?? (await fetchProjectBySlug(slug));
                    if (!started)
                        return;
                    if (!proj) {
                        notFound = true;
                        items = [];
                        emit();
                        return;
                    }
                    project = proj;
                    emit();
                    const gallery = await fetchProjectGallery(proj.id);
                    if (started) {
                        items = gallery;
                        emit();
                    }
                }
                catch (e) {
                    if (!started)
                        return;
                    items = [];
                    error = e instanceof Error ? e.message : String(e);
                    emit();
                }
            })();
        },
        stop() { started = false; },
    };
}
