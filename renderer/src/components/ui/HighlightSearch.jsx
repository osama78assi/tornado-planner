import { Fragment, useEffect, useRef } from "react";

function HighlightSearch({
    str,
    query,
    span = 50, // Length of the word to render it
    renderOnNotMatch = false,
}) {
    if (!query) return str;

    const regex = new RegExp(`(${query})`, "gi");
    const blocks = str?.split(regex) || [];

    const found = useRef(false);

    function renderTruncatedBlocks(block, index, blocks) {
        // If found then just skip
        if (found.current) return null;

        // When we found a match
        if (regex.test(block)) {
            // We found a result
            found.current = true;

            // Prepare the items
            let prev = []; // React render recursivly
            let middle;
            let next = [];

            // The block length is larger take it with ...
            if (block.length >= span) {
                middle = (
                    <Fragment>
                        <span className="bg-(--main-interactive-color-v1)">
                            {block.slice(0, span)}
                        </span>
                        {block.length > span ? "..." : null}
                    </Fragment>
                );
            } else {
                middle = (
                    <Fragment>
                        <span className="bg-(--main-interactive-color-v1)">
                            {block.slice(0, span)}
                        </span>
                    </Fragment>
                );
            }

            // First we need to know how much will left after taking the matched result
            let leftToTake = span - block.length;
            let additionalSpan = Math.ceil(
                (leftToTake > 0 ? leftToTake : 0) / 2,
            ); // Don't make it negative

            // Keep truck of those to let the alogrithm knows where to add truncation mark or not
            let lastBlock;
            let lastIndex;

            // run a while to take from the text till the remaing become zero or less. Or the last block
            let addIndex = 1;
            // If there is characters left to take
            while (
                leftToTake > 0 && // We can take in general
                additionalSpan > 0 && // Still space in the span
                index + addIndex < blocks.length // To not overflow
            ) {
                // Update last block and index
                lastBlock = blocks[index + addIndex].slice(0, additionalSpan);
                lastIndex = index + addIndex;

                next.push(
                    <Fragment key={`${Math.random()}-${Math.random()}`}>
                        {regex.test(blocks[index + addIndex]) ? (
                            <span className="bg-(--main-interactive-color-v1)">
                                {lastBlock}
                            </span>
                        ) : (
                            lastBlock
                        )}
                    </Fragment>,
                );

                // To know how many characters we took
                let taken = Math.min(
                    additionalSpan,
                    blocks[index + addIndex].length,
                );

                // Reduce the right span by the samllest in case we could cover the span and more. or there is still space in the span
                additionalSpan -= taken;
                // Take the next one
                addIndex++;
                // Reduce the left to take if there is still characters
                leftToTake -= taken;
            }

            // Check if there is left characters in the last block that not added
            // Or if there is sill blocks
            if (
                blocks[lastIndex]?.length !== lastBlock?.length ||
                lastIndex < blocks.length - 1
            ) {
                next.push(
                    <Fragment key={`${Math.random()}-${Math.random()}`}>
                        ...
                    </Fragment>,
                );
            }

            // ------------------------------------- Previous -------------------------------------

            // Take from the left. 100% it's not a match
            // Reset all
            addIndex = 1;
            lastBlock = null;
            lastIndex = null;
            additionalSpan = leftToTake;
            while (
                leftToTake > 0 &&
                additionalSpan > 0 &&
                index - addIndex >= 0
            ) {
                // Update
                lastBlock = blocks[index - addIndex].slice(-additionalSpan);
                lastIndex = index - addIndex;

                prev.unshift(
                    <Fragment key={`${Math.random()}-${Math.random()}`}>
                        {lastBlock}
                    </Fragment>,
                );

                let taken = Math.min(
                    additionalSpan,
                    blocks[index - addIndex].length,
                );
                // Decrase the span. By the samllest
                additionalSpan -= taken;

                // Take the previous one
                addIndex++;

                // Decrease the left to take
                leftToTake -= taken;
            }

            if (
                blocks[lastIndex]?.length !== lastBlock?.length || // The last block got trimmed
                (lastIndex > 0 && leftToTake === 0) // There is a pervious block but there is no more text to take
            ) {
                prev.unshift(
                    <Fragment key={`${Math.random()}-${Math.random()}`}>
                        ...
                    </Fragment>,
                );
            }

            // Combine and return
            return (
                <Fragment key={`${Math.random()}-${Math.random()}`}>
                    {prev}
                    {middle}
                    {next}
                </Fragment>
            );
        }
    }

    useEffect(() => {
        // Each re-render reset the ref.
        // No need for state because its update is asynchronos and that isn't applicable here
        found.current = false;
    });

    return (
        <>
            {renderOnNotMatch && blocks.length === 1
                ? blocks[0].slice(0, span)
                : blocks.map(renderTruncatedBlocks)}
        </>
    );
}

export default HighlightSearch;
