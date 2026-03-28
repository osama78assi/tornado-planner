import folderS from "../services/folder.js";
import note from "../services/note.js";
import plan from "../services/plan.js";
import task from "../services/task.js";
import workspace from "../services/workspace.js";

export async function testDate() {
    try {
        console.log("Creating 3 workspaces...");
        const wrokspace1 = await workspace.create({
            name: "Workspace 1",
            description: "This is a test1 workspace common",
            icon: "MdContentPasteSearch",
        });
        const wrokspace2 = await workspace.create({
            name: "Workspace 2",
            description: "This is a test2 workspace",
            icon: "LuPackageSearch",
        });
        await workspace.create({
            name: "Masetering payment gateway and learn it",
            description:
                "In this workspace I will go through many courses and many exampels to learn and master the payment gateway, it's not simple so please makue sure to refere to each plan's documents where I added the directory for each codebase, and you will fine them in github too so don't panic",
            icon: "LuPackageSearch",
        });
        console.log("3 workspaces created successfully...");

        console.log("-------------------------------");

        console.log("Creating 5 plans");
        const workspace1Plan1 = await plan.create({
            name: "Workspace1 Plan test 1",
            description: "This is workspace1 test1 plan",
            icon: "MdLocationSearching",
            workspaceId: wrokspace1.dataValues.id,
        });
        const workspace2Plan2 = await plan.create({
            name: "Workspace2 Plan test 4",
            description: "This is workspace2 test4 plan",
            icon: "RiChatSearchFill",
            workspaceId: wrokspace2.dataValues.id,
        });
        await plan.create({
            name: "Is this a plan ?",
            description: "Yeah reall it's is",
            icon: "RiChatSearchFill",
            workspaceId: wrokspace2.dataValues.id,
        });
        await plan.create({
            name: "Just do it bro",
            description: "I will in shaa Allah bro",
            icon: "RiChatSearchFill",
            workspaceId: wrokspace2.dataValues.id,
        });
        await plan.create({
            name: "This have a long description",
            description:
                "lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem loremlorem lorem lorem lorem lorem lorem lorem loremlorem lorem lorem lorem lorem lorem lorem loremlorem lorem lorem lorem lorem lorem lorem loremlorem lorem lorem lorem lorem lorem lorem loremlorem lorem lorem lorem lorem lorem lorem loremlorem lorem lorem lorem lorem lorem lorem loremlorem lorem lorem lorem lorem lorem lorem lorem",
            icon: "RiChatSearchFill",
            workspaceId: wrokspace2.dataValues.id,
        });

        console.log("5 plans created successfully...");
        console.log("-------------------------------");
        console.log("Creating 3 tasks in two plans");
        await task.create({
            title: "Watch the eyes",
            description:
                "Read the eyes, see and learn why it's the mirror of the soul",
            completed: false,
            metadata: {
                "start date": new Date(),
                status: "in progress",
                priority: "high",
            },
            planId: workspace2Plan2.dataValues.id,
        });
        await task.create({
            title: "Stair in the eyes",
            description: "Just wonder, why I can't reach those eyes",
            completed: true,
            metadata: {
                "start date": "9-9-2019",
                "end date": "9-9-2019",
                status: "done",
                priority: "high",
            },
            planId: workspace2Plan2.dataValues.id,
        });

        await task.create({
            title: "Play genshin impact",
            description: "it's for the first time",
            completed: true,
            metadata: {
                "start date": "9-9-2021",
                "end date": "9-9-2021",
                status: "done",
                priority: "low",
            },
            planId: workspace1Plan1.dataValues.id,
        });

        console.log("3 tasks created successfully...");
        console.log("-------------------------------");

        console.log("Creating a note in each workspace...");

        const notePlan1 = await note.create({
            title: "How To Play",
            content: "it's hard to say that, But it's common and easy",
            workspaceId: wrokspace1.dataValues.id,
        });
        const notePlan2 = await note.create({
            title: "What is love",
            content: "her eyes...",
            workspaceId: wrokspace2.dataValues.id,
        });

        console.log("2 notes created successfully...");

        console.log("-------------------------------");

        console.log("Ceating 2 folders...");
        const folder1 = await folderS.create({
            name: "folder 1",
            icon: "FiFolder",
        });
        const folder2 = await folderS.create({
            name: "folder 2",
            icon: "LuFolderHeart",
        });

        console.log("2 folders created succssfully...");

        console.log("-------------------------------");

        console.log("Creating a note in each folder...");

        const note1 = await note.create({
            title: "Play Hard",
            content: "it's nice btw",
            folderId: folder1.dataValues.id,
        });
        const note2 = await note.create({
            title: "Do Eyes Matter ?",
            content: "You might ask, Do anything matters except eyes ?",
            folderId: folder2.dataValues.id,
        });
        console.log("2 notes created succssfully...");

        console.log(
            "\n#############\n",
            "You may search now... I hope you a safe and a nice testing journy...",
            "\n#############\n",
        );
    } catch (err) {
        throw err;
    }
}
