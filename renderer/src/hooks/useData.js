import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function useData({ fetchFunction, filters }) {
    // State for data, loading, and error
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize filters to prevent unnecessary re-renders
    const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);

    useEffect(() => {
        async function fetchData() {
            try {
                // Set loading to true
                setLoading(true);
                setError(null);

                // Fetch all data by passing loadAll: true
                const res = await fetchFunction?.({
                    loadAll: true,
                    filters: memoizedFilters,
                });

                // Set the data
                if (res) {
                    setData(res.data);
                }
            } catch (err) {
                // Set error state
                setError(err);

                // Show error toast
                if (err.message) {
                    toast.error(err.message);
                }
                console.log(err);
            } finally {
                // Set loading to false
                setLoading(false);
            }
        }

        fetchData();
    }, [memoizedFilters, fetchFunction]);

    return { data, setData, loading, error };
}
