import { FiFolder } from "react-icons/fi";
import Breadcrumbs from "../ui/Breadcrumbs";
import HighlightSearch from "../ui/HighlightSearch";
import { IoLayers } from "react-icons/io5";

function NoteResult({ note, query }) {
    return (
        <div className="p-2 bg-(--thirdary-color) rounded-lg">
            <div className="border-b border-b-(--main-divider-color)">
                {note?.folder && note?.workspace === null ? (
                    <Breadcrumbs
                        wrap={true}
                        items={[
                            <div className="flex items-center gap-2">
                                <FiFolder
                                    size="1.4rem"
                                    color="var(--main-interactive-color-v1)"
                                />
                                <span>{note.folder?.name}</span>
                            </div>,
                            ,
                            <HighlightSearch
                                str={note.title}
                                query={query}
                                truncate={false}
                                renderOnNotMatch={true}
                            />,
                        ]}
                    />
                ) : null}

                {note?.workspace ? (
                    <Breadcrumbs
                        wrap={true}
                        items={[
                            <div className="flex items-center gap-2">
                                <IoLayers
                                    size="1.4rem"
                                    color="var(--main-interactive-color-v1)"
                                />
                                <span>{note?.workspace?.name}</span>
                            </div>,
                            note?.workspace?.name,

                            <HighlightSearch
                                str={note?.title}
                                query={query}
                                truncate={false}
                                renderOnNotMatch={true}
                            />,
                        ]}
                    />
                ) : null}
            </div>

            <p className="p-3">
                <HighlightSearch
                    str={note?.content}
                    query={query}
                    renderOnNotMatch={true}
                />
            </p>
        </div>
    );
}

export default NoteResult;
