import sequelize, { connectDB } from "../config/sequelize.js";
import planServices from "../services/plan.js";
import workspaceServices from "../services/workspace.js";
import taskServices from "../services/task.js";
import task from "../models/task.js";

// Connect to the database
beforeAll(async () => {
    await connectDB();
});

// Clear the entire database before each test case
beforeEach(async () => {
    await sequelize.sync({ force: true, logging: false });
});

describe.skip("the task creation error cases", () => {
    it("Should throw an error because task have an attribute that isn't recognized", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");

        let errCode = "";

        try {
            await taskServices.create({
                planId: plan.dataValues.id,
                title: "task one",
                description: "This is a description",
                metadata: {
                    "start date": new Date(),
                    "end date": new Date(),
                    status: "done",
                    priority: "low",
                    t: "1",
                },
            });
        } catch (err) {
            errCode = err.code;
        }
        expect(errCode).toBe("UNRECOGNIZED_ATTRIBUTE");
    });

    it("Should throw an error because task type doesn't match the plan schema (normal type)", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");

        let errCode = "";
        try {
            await taskServices.create({
                planId: plan.dataValues.id,
                title: "task one",
                description: "This is a description",
                metadata: {
                    "start date": new Date(),
                    "end date": "sdf",
                    status: "done",
                    priority: "low",
                },
            });
        } catch (err) {
            errCode = err.code;
        }

        expect(errCode).toBe("VALUE_NOT_MATCH_TYPE");
    });

    it("Should throw an error because task type doesn't match the plan schema (check type)", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");

        let errCode = "";
        try {
            await taskServices.create({
                planId: plan.dataValues.id,
                title: "task one",
                description: "This is a description",
                metadata: {
                    "start date": new Date(),
                    "end date": new Date(),
                    status: "done",
                    priority: "l",
                },
            });
        } catch (err) {
            errCode = err.code;
        }

        expect(errCode).toBe("VALUE_NOT_MATCH_TYPE");
    });
});

describe.skip("The creation flow of a plan with the update flow", () => {
    it.skip("Should create a plan with correct metadata", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { "expected days to finish": { type: "number" } },
            workspaceId: workspace.dataValues.id,
        });

        // Check if the plan has the default + non default metadata
        expect(plan.dataValues.metadata).toMatchObject({
            "start date": {
                type: "date",
            },
            "end date": {
                type: "date",
            },
            status: {
                type: "check",
                values: ["done", "in progress", "not started", "discarded"],
            },
            priority: {
                type: "check",
                values: ["low", "medium", "high"],
            },
        });

        // Check if the user defined proprety is existed
        expect(plan.dataValues.metadata).toMatchObject({
            "expected days to finish": { type: "number" },
        });
    });
    it.skip("Should throw an error because type isn't check and there is values attribute", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        let errCode = "";

        try {
            // Create the plan
            const plan = await planServices.create({
                name: "test plan",
                metadata: {
                    flag: { type: "string", values: [1, "red", "blue"] },
                },
                workspaceId: workspace.dataValues.id,
            });
        } catch (err) {
            errCode = err.code;
        }

        expect(errCode).toEqual("INVALID_SCHEMA_VALUES_USAGE");
    });

    it.skip("Update the associated tasks and delete the deleted attribute in the plan ", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { "expected days": { type: "number" } },
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");

        // Create the tasks
        await taskServices.create({
            planId: plan.dataValues.id,
            title: "Task 1",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                "expected days": 1,
            },
        });
        await taskServices.create({
            planId: plan.dataValues.id,
            title: "Task 2",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                "expected days": 2,
            },
        });
        await taskServices.create({
            planId: plan.dataValues.id,
            title: "Task 3",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                "expected days": 3,
            },
        });

        await planServices.update(plan.id, {
            metadata: {},
        });

        const tasks = await task.findAll();
        tasks.forEach((task) => {
            expect(task.dataValues.metadata).not.toHaveProperty(
                "expected days",
            );
        });
    });
    it.skip("Should update the associated tasks and delete the conflict fields after updating X attribute in the plan (normal type to normal type)", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { "expected days": { type: "string" } },
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");

        // Create the tasks
        await taskServices.create({
            id: 1,
            planId: plan.dataValues.id,
            title: "Task 1",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                "expected days": 1,
            },
        });
        await taskServices.create({
            id: 2,
            planId: plan.dataValues.id,
            title: "Task 2",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                "expected days": "2 days",
            },
        });
        await taskServices.create({
            id: 3,
            planId: plan.dataValues.id,
            title: "Task 3",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                "expected days": 3,
            },
        });

        await planServices.update(plan.id, {
            metadata: {
                "expected days": {
                    type: "number",
                },
            },
        });

        const tasks = await task.findAll();
        tasks.forEach((task) => {
            switch (task.dataValues.id) {
                case 1:
                    expect(task.dataValues.metadata["expected days"]).toBe(1);
                    break;
                case 2:
                    expect(task.dataValues.metadata["expected days"]).toBe(
                        undefined,
                    );
                    break;
                case 3:
                    expect(task.dataValues.metadata["expected days"]).toBe(3);
                    break;
            }
        });
    });
    it.skip("Should update the associated tasks and delete the conflict fields after updating X attribute in the plan (check type to normal type)", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { flag: { type: "check", values: [1, "red", "blue"] } },
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");

        // Create the tasks
        await taskServices.create({
            id: 1,
            planId: plan.dataValues.id,
            title: "Task 1",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: 1,
            },
        });
        await taskServices.create({
            id: 2,
            planId: plan.dataValues.id,
            title: "Task 2",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: "red",
            },
        });
        await taskServices.create({
            id: 3,
            planId: plan.dataValues.id,
            title: "Task 3",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: "blue",
            },
        });

        await planServices.update(plan.id, {
            metadata: {
                flag: {
                    type: "number",
                },
            },
        });

        const tasks = await task.findAll();
        tasks.forEach((task) => {
            switch (task.dataValues.id) {
                case 1:
                    expect(task.dataValues.metadata["flag"]).toBe(1);
                    break;
                case 2:
                    // Got deleted in another word
                    expect(task.dataValues.metadata["flag"]).toBe(undefined);
                    break;
                case 3:
                    expect(task.dataValues.metadata["flag"]).toBe(undefined);
                    break;
            }
        });
    });
    it.skip("Should update the associated tasks and delete the conflict fields after updating X attribute in the plan (normal type to check type)", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { flag: { type: "string" } },
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");

        // Create the tasks
        await taskServices.create({
            id: 1,
            planId: plan.dataValues.id,
            title: "Task 1",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: 1,
            },
        });
        await taskServices.create({
            id: 2,
            planId: plan.dataValues.id,
            title: "Task 2",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: "red",
            },
        });
        await taskServices.create({
            id: 3,
            planId: plan.dataValues.id,
            title: "Task 3",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: "blue",
            },
        });

        await planServices.update(plan.id, {
            metadata: {
                flag: {
                    type: "check",
                    values: ["blue", "red"],
                },
            },
        });

        const tasks = await task.findAll();

        tasks.forEach((task) => {
            switch (task.dataValues.id) {
                case 1:
                    expect(task.dataValues.metadata["flag"]).toBe(undefined);
                    break;
                case 2:
                    // Got deleted in another word
                    expect(task.dataValues.metadata["flag"]).toBe("red");
                    break;
                case 3:
                    expect(task.dataValues.metadata["flag"]).toBe("blue");
                    break;
            }
        });
    });
    it.skip("Should update the associated tasks and delete the conflict fields after updating X attribute in the plan (check type to check type)", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { flag: { type: "check", values: [1, 2, 3] } },
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");

        // Create the tasks
        await taskServices.create({
            id: 1,
            planId: plan.dataValues.id,
            title: "Task 1",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: 1,
            },
        });
        await taskServices.create({
            id: 2,
            planId: plan.dataValues.id,
            title: "Task 2",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: 2,
            },
        });
        await taskServices.create({
            id: 3,
            planId: plan.dataValues.id,
            title: "Task 3",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                flag: 3,
            },
        });

        await planServices.update(plan.id, {
            metadata: {
                flag: {
                    type: "check",
                    values: [1, "red"],
                },
            },
        });

        const tasks = await task.findAll();

        tasks.forEach((task) => {
            switch (task.dataValues.id) {
                case 1:
                    expect(task.dataValues.metadata["flag"]).toBe(1);
                    break;
                case 2:
                    // Got deleted in another word
                    expect(task.dataValues.metadata["flag"]).toBe(undefined);
                    break;
                case 3:
                    expect(task.dataValues.metadata["flag"]).toBe(undefined);
                    break;
            }
        });
    });
    it.skip("Should pass all the tpyes of update and act accordingly without any error in a single update", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { flag: { type: "check", values: [1, 2, 3] } },
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan.dataValues.id).toBe("number");
    });
});
