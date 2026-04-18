import { useCallback, useRef, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import Modal from "../ui/Modal";
import Tag from "../ui/Tag";
import SearchResults from "./SearchResults";
import { searchNotes } from "../../api/note";
import NoteResult from "../note/NoteResult";
import { searchTasks } from "../../api/task";
import TaskResult from "../task/TaskResult";
import Input from "../ui/Input";

function Search() {
    const pageInputRef = useRef();
    const modalInputRef = useRef();

    const [isOpen, setIsOpen] = useState(false);

    // handle search
    const [searchQ, setSearchQ] = useState("");

    // Memo
    const notesRenderer = useCallback((note) => {
        return (
            <NoteResult key={`note-${note.id}`} note={note} query={searchQ} />
        );
    });

    const tasksRenderer = useCallback((task) => {
        return (
            <TaskResult task={task} key={`task-${task.id}`} query={searchQ} />
        );
    });

    return (
        <div className="py-2">
            <Input.InputIcon
                icon={<IoMdSearch className="text-2xl" />}
                parentProps={{
                    className: "rounded-full",
                    onClick: () => {
                        setTimeout(() => {
                            if (modalInputRef.current) {
                                // Focus there
                                modalInputRef.current.focus();
                            }
                        }, 0);

                        setIsOpen(true);
                    },
                }}
                inputProps={{
                    ref: pageInputRef,
                    // Don't foucs here
                    onMouseDown: (e) => e.preventDefault(),
                }}
            />

            <Modal
                isOpen={isOpen}
                handleClose={() => {
                    setIsOpen(false);
                    // Clear the search
                    setSearchQ("");
                }}
                className="bg-(--main-color)! sm:w-180!"
            >
                <div className="bg-(--main-color) h-[65dvh] overflow-auto w-full px-3 pt-3">
                    <Input.InputIcon
                        icon={<IoMdSearch className="text-2xl" />}
                        parentProps={{
                            className: "rounded-full",
                            onClick: () => {
                                if (modalInputRef.current) {
                                    // Focus there
                                    modalInputRef.current.focus();
                                }
                            },
                        }}
                        inputProps={{
                            value: searchQ,
                            onChange: (e) => setSearchQ(e.target.value),
                            ref: modalInputRef,
                        }}
                    />

                    {!searchQ && (
                        <div className="w-[95%] mx-auto main-tag p-3 my-4 rounded-2xl flex justify-center items-center">
                            <p className="text-lg">
                                Start search for notes and tasks
                            </p>
                        </div>
                    )}

                    {/* Render the resulsts */}
                    <SearchResults
                        icon={"CgNotes"}
                        searchFor={"Notes"}
                        fetchFunction={searchNotes}
                        query={searchQ}
                        renderer={notesRenderer}
                    />

                    <SearchResults
                        icon={"FaTasks"}
                        searchFor={"Tasks"}
                        fetchFunction={searchTasks}
                        query={searchQ}
                        renderer={tasksRenderer}
                    />
                </div>
            </Modal>
        </div>
    );
}

export default Search;
