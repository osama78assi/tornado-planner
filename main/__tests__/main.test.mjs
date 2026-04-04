import sequelize, { connectDB } from "../config/sequelize.js";
import planServices from "../services/plan.js";
import workspaceServices from "../services/workspace.js";
import taskServices from "../services/task.js";
import task from "../models/task.js";
import { checkApplicationSettings } from "../config/main.js";
import Attribute from "../models/attribute.js";
import Value from "../models/value.js";
import { Op, QueryTypes } from "sequelize";

// Connect to the database
beforeAll(async () => {
    await connectDB();
    await checkApplicationSettings();
});

// Clear the entire database before each test case
beforeEach(async () => {
    await sequelize.sync({ force: true, logging: false });
});

//////////////////////////////////////////// Plans
describe.skip("The plan creation process", () => {
    it.skip("Should create a plan with correct metadata with attribute records", async () => {
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

        // Check if there are attributes created with the given column names
        const keys = new Set([
            "start date",
            "end date",
            "status",
            "priority",
            "expected days to finish",
        ]);
        const attributes = await Attribute.findAll();
        expect(
            attributes.every((attribute) => keys.has(attribute.key)),
        ).toBeTruthy();
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
    it.skip("Should create the attribute and value records and link them correctly", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { "expected days": { type: "number" } },
            workspaceId: workspace.dataValues.id,
        });

        // Create the task
        const task = await taskServices.create({
            planId: plan.dataValues.id,
            title: "Task 1",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                "expected days": 1,
            },
        });

        expect(Object.keys(task.columns)).toEqual(
            expect.arrayContaining([
                "start date",
                "end date",
                "status",
                "expected days",
            ]),
        );

        const values = await Value.findAll({ where: { taskId: task.id } });

        expect(values).toHaveLength(4);
    });
    it.skip("Shouldn't create more than 4 attributes", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Create the first plan
        const plan1 = await planServices.create({
            name: "test plan1",
            metadata: { "expected days": { type: "number" } },
            workspaceId: workspace.dataValues.id,
        });

        // Create the second plan
        const plan2 = await planServices.create({
            name: "test plan2",
            metadata: { "expected days": { type: "number" } },
            workspaceId: workspace.dataValues.id,
        });

        // Get all attributes
        const attributes = await Attribute.findAll();

        expect(attributes).toHaveLength(5);
    });
});

describe("The plan update/delete process", () => {
    it.skip("Should delete only 'expected days' attribute. in another word delete the attrbiute that is never been used anymore", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Create the first plan
        const plan1 = await planServices.create({
            name: "test plan1",
            metadata: { "expected days": { type: "number" } },
            workspaceId: workspace.dataValues.id,
        });

        // Create the second plan
        const plan2 = await planServices.create({
            name: "test plan2",
            workspaceId: workspace.dataValues.id,
        });

        // Delete the first plan
        await planServices.destory(plan1.id);

        // Get the attributes
        const attributes = await Attribute.findAll();

        expect(attributes).toHaveLength(4);
    });
    it.skip("Should not delete any attribute because it's used in another plan", async () => {});

    it.skip("Should update the attribute type", async () => {
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

        await planServices.update(plan.id, {
            metadata: {
                "expected days": {
                    type: "number",
                },
            },
        });

        // Check the type now
        const newAttribute = await Attribute.findOne({
            where: { key: "expected days" },
        });

        expect(newAttribute.dataValues.type).toBe("number");
    });
    it.skip("Should change the plan attribute name", async () => {
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

        /// Get the old id
        const oldAttributeId = (
            await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            })
        )?.id;

        await planServices.update(
            plan.dataValues.id,
            {
                metadata: { expDays: { type: "string" } },
            },
            { expDays: "expected days" },
        );

        // Get the same value id
        const newAttributeId = (
            await Attribute.findOne({
                where: {
                    key: "expDays",
                },
            })
        )?.id;

        expect(oldAttributeId).toBe(newAttributeId);
    });
    it("Should create another attribute instead of changing the existing one", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Valiadte if the workspace has created or not
        expect(typeof workspace.dataValues.id).toBe("number");

        // Create the plan
        const plan1 = await planServices.create({
            name: "test plan1",
            metadata: { "expected days": { type: "string" } },
            workspaceId: workspace.dataValues.id,
        });

        const plan2 = await planServices.create({
            name: "test plan2",
            metadata: { "expected days": { type: "string" } },
            workspaceId: workspace.dataValues.id,
        });

        expect(typeof plan1.dataValues.id).toBe("number");
        expect(typeof plan2.dataValues.id).toBe("number");

        /// Get the old key
        const oldAttributeKey = (
            await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            })
        )?.key;

        await planServices.update(
            plan1.dataValues.id,
            {
                metadata: { expDays: { type: "string" } },
            },
            { expDays: "expected days" },
        );

        // Check if the key is existed now
        const newAttributeKey = (
            await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            })
        )?.key;

        expect(oldAttributeKey).toBe(newAttributeKey);

        // There should be a new attribute
        const newAttribute = await Attribute.findOne({
            where: {
                key: "expDays",
            },
        });

        expect(newAttribute).not.toBeNull();
    });
});

//////////////////////////////////////////// Tasks
describe.skip("The task creation process", () => {
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

describe.skip("The task update/delete process", () => {
    it.skip("Should delete the value records from the table", async () => {
        // Create a workspace
        const workspace = await workspaceServices.create({
            name: "test workspace",
            description: "This workspace is mainly used to test plan creation",
        });

        // Create the plan
        const plan = await planServices.create({
            name: "test plan",
            metadata: { "expected days": { type: "number" } },
            workspaceId: workspace.dataValues.id,
        });

        // Create the task
        const task = await taskServices.create({
            planId: plan.dataValues.id,
            title: "Task 1",
            metadata: {
                "start date": new Date(),
                "end date": new Date(),
                status: "done",
                "expected days": 1,
            },
        });

        const valueIds = (
            await Value.findAll({
                attributes: ["id"],
                where: { taskId: task.id },
            })
        ).map((val) => val.id);

        await taskServices.delete(task.id);

        const newValues = await Value.findAll({
            where: { id: { [Op.in]: valueIds } },
        });

        expect(newValues).toHaveLength(0);
    });
    it.skip("it should delete the value in the tasks when the attribute get deleted in the plan ", async () => {
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

        const tasks = await taskServices.get(1, 100);
        tasks.data.map((task) => console.log(task.columns));
        tasks.data.forEach((task) => {
            expect(task.dataValues.columns).not.toHaveProperty("expected days");
        });

        // The internal value is deleted too
        // Get the value id
        const values = await sequelize.query(
            `
            SELECT
                "values".id
            FROM "values"
            JOIN "attributes" ON "attributes".id = "values"."attributeId"
            WHERE "attributes".key = 'expected days'
        `,
            {
                type: QueryTypes.SELECT,
                raw: true,
            },
        );

        expect(values).toHaveLength(0);
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
