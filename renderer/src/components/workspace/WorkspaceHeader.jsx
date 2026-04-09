import { useCallback, useRef, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import Modal from "../ui/Modal";
import SearchResults from "./SearchResults";
import { searchNotes } from "../../api/note";
import NoteResult from "../note/NoteResult";
import { searchTasks } from "../../api/task";
import TaskResult from "../task/TaskResult";
import Input from "../ui/Input";

function WorkspaceHeader() {
    const pageInputRef = useRef();
    const modalInputRef = useRef();

    const [isOpen, setIsOpen] = useState(false);
    const [searchQ, setSearchQ] = useState("");

    const notesRenderer = useCallback(
        (note) => {
            return (
                <NoteResult
                    key={`note-${note.id}`}
                    note={note}
                    query={searchQ}
                />
            );
        },
        [searchQ],
    );

    const tasksRenderer = useCallback(
        (task) => {
            return (
                <TaskResult
                    task={task}
                    key={`task-${task.id}`}
                    query={searchQ}
                />
            );
        },
        [searchQ],
    );

    return (
        <div className="flex items-center gap-2 w-full px-4">
            <Input.InputIcon
                icon={<IoMdSearch className="text-2xl" />}
                parentProps={{
                    onClick: () => {
                        setTimeout(() => {
                            if (modalInputRef.current) {
                                modalInputRef.current.focus();
                            }
                        }, 0);

                        setIsOpen(true);
                    },
                }}
                inputProps={{
                    ref: pageInputRef,
                    onMouseDown: (e) => e.preventDefault(),
                    placeholder: "Search for notes and tasks...",
                }}
            />

            <Modal
                isOpen={isOpen}
                handleClose={() => {
                    setIsOpen(false);
                    setSearchQ("");
                }}
                className="bg-(--main-color)! sm:w-180!"
            >
                <div className="bg-(--main-color) h-[65dvh] overflow-auto w-full px-3 pt-3">
                    <Input.InputIcon
                        icon={<IoMdSearch className="text-2xl" />}
                        parentProps={{
                            onClick: () => {
                                if (modalInputRef.current) {
                                    modalInputRef.current.focus();
                                }
                            },
                        }}
                        inputProps={{
                            value: searchQ,
                            onChange: (e) => setSearchQ(e.target.value),
                            ref: modalInputRef,
                            placeholder: "Search for notes and tasks...",
                        }}
                    />

                    {!searchQ && (
                        <div className="w-[95%] mx-auto main-tag p-3 my-4 rounded-2xl flex justify-center items-center">
                            <p className="text-lg">
                                Start search for notes and tasks
                            </p>
                        </div>
                    )}

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

export default WorkspaceHeader;
