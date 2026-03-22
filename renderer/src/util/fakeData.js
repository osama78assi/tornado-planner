function waitOneSecond(fn) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result = fn?.();
            resolve(result);
        }, 1000);
    });
}

export async function getWorkspaces() {
    await waitOneSecond();

    return [
        {
            id: 1,
            name: "Workspace 1",
            description: "This is a test1 workspace common",
            icon: "MdContentPasteSearch",
            Plans: [
                {
                    id: 1,
                    name: "Workspace1 Plan test 1",
                    description: "This is workspace1 test1 plan",
                    icon: "MdLocationSearching",
                    workspaceId: 1,
                    Workspace: {
                        id: 1,
                        name: "Workspace 1",
                        description: "This is a test1 workspace common",
                        icon: "MdContentPasteSearch",
                    },
                },
            ],
        },
        {
            id: 2,
            name: "Workspace 2",
            description: "This is a test2 workspace",
            icon: "LuPackageSearch",
            Plans: [
                {
                    id: 2,
                    name: "Workspace2 Plan test 4",
                    description: "This is workspace2 test4 plan",
                    icon: "RiChatSearchFill ",
                    workspaceId: 2,
                    Workspace: {
                        id: 2,
                        name: "Workspace 2",
                        description: "This is a test2 workspace",
                        icon: "LuPackageSearch",
                    },
                },
            ],
        },
    ];
}

export async function getPlans() {
    await waitOneSecond();

    return [
        {
            id: 1,
            name: "Workspace1 Plan test 1",
            description: "This is workspace1 test1 plan",
            icon: "MdLocationSearching",
            workspaceId: 1,
            Workspace: {
                id: 1,
                name: "Workspace 1",
                description: "This is a test1 workspace common",
                icon: "MdContentPasteSearch",
            },
            Notes: [
                {
                    id: 1,
                    title: "How To Play",
                    content: "it's hard to say that, But it's common and easy",
                    planId: 1,
                },
            ],
            Tasks: [],
        },
        {
            id: 2,
            name: "Workspace2 Plan test 4",
            description: "This is workspace2 test4 plan",
            icon: "RiChatSearchFill ",
            workspaceId: 2,
            Workspace: {
                id: 2,
                name: "Workspace 2",
                description: "This is a test2 workspace",
                icon: "LuPackageSearch",
            },
            Notes: [
                {
                    id: 2,
                    title: "What is love",
                    content: "her eyes...",
                    planId: 2,
                },
            ],
            Tasks: [],
        },
    ];
}

export async function getFolders() {
    await waitOneSecond();

    return [
        {
            id: 1,
            name: "folder 1",
            icon: "FiFolder",
            Notes: [
                {
                    id: 3,
                    title: "Play Hard",
                    content: "it's nice btw",
                    folderId: 1,
                    Folder: {
                        id: 1,
                        name: "folder 1",
                        icon: "FiFolder",
                    },
                },
            ],
        },
        {
            id: 2,
            name: "folder 2",
            icon: "LuFolderHeart",
            Notes: [
                {
                    id: 4,
                    title: "Do Eyes Matter ?",
                    content: "You might ask, Do anything matters except eyes ?",
                    folderId: 2,
                    Folder: {
                        id: 2,
                        name: "folder 2",
                        icon: "LuFolderHeart",
                    },
                },
            ],
        },
    ];
}

export async function getNotes() {
    await waitOneSecond();

    return [
        {
            id: 1,
            title: "How To Play",
            content: "it's hard to say that, But it's common and easy",
            planId: 1,
            Plan: {
                id: 1,
                name: "Workspace1 Plan test 1",
                workspaceId: 1,
                Workspace: {
                    id: 1,
                    name: "Workspace 1",
                },
            },
        },
        {
            id: 2,
            title: "What is love",
            content: "her eyes...",
            planId: 2,
            Plan: {
                id: 2,
                name: "Workspace2 Plan test 4",
                workspaceId: 2,
                Workspace: {
                    id: 2,
                    name: "Workspace 2",
                },
            },
        },
        {
            id: 3,
            title: "Play Hard",
            content: "it's nice btw",
            folderId: 1,
            Folder: {
                id: 1,
                name: "folder 1",
            },
        },
        {
            id: 4,
            title: "Do Eyes Matter ?",
            content: "You might ask, Do anything matters except eyes ?",
            folderId: 2,
            Folder: {
                id: 2,
                name: "folder 2",
            },
        },
    ];
}
export async function getTasks() {
    await waitOneSecond();

    return [
        {
            id: 1,
            title: "Example Task",
            completed: false,
            planId: 1,
            Plan: {
                id: 1,
                name: "Workspace1 Plan test 1",
                Workspace: {
                    id: 1,
                    name: "Workspace 1",
                },
            },
        },
        {
            id: 2,
            title: "Example Task",
            completed: true,
            planId: 1,
            Plan: {
                id: 2,
                name: "Workspace2 Plan test 1",
                Workspace: {
                    id: 2,
                    name: "Workspace 2",
                },
            },
        },
    ];
}
