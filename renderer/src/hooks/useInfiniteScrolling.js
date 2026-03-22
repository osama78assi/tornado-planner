import { useEffect, useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function useInfiniteScrolling({
    fetchFunction,
    page = 1,
    limit = 10,
    filters,
    observerOptions = {
        root: null, // Check intersection with viewport
        threshold: 0, // As soon as possible
    },
}) {
    // Fetch logic
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: page,
        count: 0,
        pages: 1,
    });
    const [shouldFetch, setShouldFetch] = useState(false);

    // Fon infinite scrolling
    const ref = useRef(null);
    // In case multiple call happened and the first one hasn't finished running
    const infiniteScrollingApi = useRef({
        loading: true,
        shouldStop: false,
    });

    useEffect(() => {
        // Skip initial render
        if (!shouldFetch || infiniteScrollingApi.current.shouldStop) {
            return;
        }

        async function fetchData() {
            try {
                // Set loading to true
                infiniteScrollingApi.current.loading = true;
                setLoading(true);

                const res = await fetchFunction?.({
                    page: pagination.page,
                    limit,
                    filters,
                });

                if (res) {
                    setData((d) => [...d, ...res.data]);
                    setPagination((prev) => ({
                        ...prev,
                        pages: res.pagination.pages,
                        count: res.pagination.count,
                    }));

                    // Check if we have to fetch more
                    if (pagination.page === res.pagination.pages) {
                        infiniteScrollingApi.current.shouldStop = true;
                    }
                }
            } catch (err) {
                if (err.message) {
                    toast.error(err.message);
                }
                console.log(err);
            } finally {
                infiniteScrollingApi.current.loading = false;
                setLoading(false);
            }
        }

        fetchData();
    }, [pagination.page, shouldFetch]);

    useEffect(() => {
        // Avoid Ref stale state
        const element = ref.current;
        if (!element) return;

        async function observerCallback(entries, observer) {
            for (const entry of entries) {
                // Initial render fetch directly
                // If you haven't start yet then start
                if (!shouldFetch) {
                    setShouldFetch(true);
                }

                // Fetch when there is an intersection
                if (
                    entry.isIntersecting &&
                    !infiniteScrollingApi.current.loading &&
                    !infiniteScrollingApi.current.shouldStop
                ) {
                    setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                    }));
                }

                // In case you want to stop observing
                if (infiniteScrollingApi.current.shouldStop) {
                    observer.unobserve(entry.target);
                }
            }
        }

        const observer = new IntersectionObserver(
            observerCallback,
            observerOptions,
        );
        observer.observe(element); // Observe the element

        return () => {
            observer.unobserve(element);
            observer.disconnect();
        };
    }, []);

    // Optional: this may never happen but it will be needed
    useEffect(() => {
        // Check the ref
        const element = ref.current;
        if (!element) return;

        const parent = ref.current.parentElement;
        // If the scrollable element doesn't have scroll or all data got fetched
        if (
            parent.scrollHeight === parent.clientHeight &&
            pagination.page < pagination.pages
        ) {
            // Auto paginate
            setPagination((prev) => ({
                ...prev,
                page: prev.page + 1,
            }));
        }
    }, [data]);

    return { elementRef: ref, data, loading, pagination, setData };
}
