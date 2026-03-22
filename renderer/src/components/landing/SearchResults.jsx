import { memo, useEffect, useState } from "react";
import Tag from "../ui/Tag";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const SearchResults = memo(function SearchResults({
    fetchFunction,
    query,
    icon,
    searchFor,
    renderer,
}) {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        count: 0,
    });
    const [loading, setLoading] = useState(false);

    // Look for pagination change
    useEffect(() => {
        async function load() {
            if (!query) return;

            try {
                setLoading(true);
                const res = await fetchFunction?.({
                    query,
                    page: pagination.page,
                    limit: 1,
                });

                // In case the res skipped to not update the state
                if (res) {
                    // Extract the data, pagination info
                    setData((prev) => [...prev, ...res.data]);
                    setPagination({
                        page: pagination.page,
                        pages: res.pagination.pages,
                        count: res.pagination.count,
                    });
                }
            } catch (err) {
                console.log(err);
                toast.error(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [query, pagination.page]);

    function showMore() {
        if (pagination.page < pagination.pages) {
            setPagination((prev) => ({
                ...prev,
                page: prev.page + 1,
            }));
        }
    }

    return (
        query && (
            <div className="flex py-6 flex-col">
                <div className="flex justify-start gap-3 items-center">
                    {icon ? (
                        <Tag
                            icon={icon}
                            text={`${
                                query
                                    ? `${pagination.count} ${searchFor} found`
                                    : searchFor
                            }`}
                            iconClasses="text-lg"
                            textClasses="text-lg"
                        />
                    ) : null}
                </div>

                <div className="py-3 space-y-3">{data.map(renderer)}</div>

                <div className="flex justify-end px-4">
                    {pagination.count ? (
                        pagination.page < pagination.pages && (
                            <Button disabled={loading} handleClick={showMore}>
                                Load more {loading ? "..." : ""}
                            </Button>
                        )
                    ) : (
                        <span className="inline-flex mx-auto">
                            No matched results...
                        </span>
                    )}
                </div>
            </div>
        )
    );
});

SearchResults.displayName = "SearchResults";

export default SearchResults;
