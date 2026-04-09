import sequelize, { connectDB } from "../config/sequelize.js";
import planServices from "../services/plan.js";
import workspaceServices from "../services/workspace.js";
import taskServices from "../services/task.js";
import task from "../models/task.js";
import { checkApplicationSettings } from "../config/main.js";
import Attribute from "../models/attribute.js";
import Value from "../models/value.js";
import { Op, QueryTypes } from "sequelize";
import PlanAttribute from "../models/planAttributes.js";
import Plan from "../models/plan.js";

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

describe.skip("The plan delete process", () => {
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
    it.skip("Should not delete any attribute because it's used in another plan", async () => {
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

        // Delete the first plan
        await planServices.destory(plan1.id);

        // Get the attribute
        const attribute = await Attribute.findOne({
            where: {
                key: "expected days",
            },
        });

        // It must still existed
        expect(attribute).not.toBeNull();
    });
});

describe.skip("plan delete service function reflection on plans and tasks", () => {
    describe("delete service function relfection on the plans", () => {
        it.skip("Should delete the attribute because there is no plan uses it anymore (delete onOneMatch case)", async () => {
            // Create a workspace
            const workspace = await workspaceServices.create({
                name: "test workspace",
                description:
                    "This workspace is mainly used to test plan creation",
            });

            // Valiadte if the workspace has created or not
            expect(typeof workspace.dataValues.id).toBe("number");

            // Create the plan
            const plan1 = await planServices.create({
                name: "test plan",
                metadata: { "expected days": { type: "string" } },
                workspaceId: workspace.dataValues.id,
            });
            const plan2 = await planServices.create({
                name: "Another test plan",
                workspaceId: workspace.dataValues.id,
            });

            expect(typeof plan1.dataValues.id).toBe("number");

            // Get the attribute
            const oldAttribute = await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            });

            // Check if it's existed or not
            expect(oldAttribute).not.toBeNull();

            // Delete the attribute expected days
            await planServices.update(plan1.id, {
                metadata: {}, // Same as deleting the attribute expected days
            });

            // It must be deleted
            const deletedAttribute = await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            });

            expect(deletedAttribute).toBeNull();

            // All must be existed. count is easier here
            const count = await Attribute.count();

            expect(count).toBe(4);
        });
        it.skip("Should not delete the attribute because there is another plan uses it (delete onMoreThanOneMatch case)", async () => {
            // Create a workspace
            const workspace = await workspaceServices.create({
                name: "test workspace",
                description:
                    "This workspace is mainly used to test plan creation",
            });

            // Valiadte if the workspace has created or not
            expect(typeof workspace.dataValues.id).toBe("number");

            // Create the plan
            const plan1 = await planServices.create({
                name: "test plan",
                metadata: { "expected days": { type: "string" } },
                workspaceId: workspace.dataValues.id,
            });
            const plan2 = await planServices.create({
                name: "Another test plan",
                metadata: { "expected days": { type: "string" } },
                workspaceId: workspace.dataValues.id,
            });

            expect(typeof plan1.dataValues.id).toBe("number");

            // Get the attribute
            const oldAttribute = await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            });

            // Check if it's existed or not
            expect(oldAttribute).not.toBeNull();

            // Delete the attribute expected days
            await planServices.update(plan1.id, {
                metadata: {}, // Same as deleting the attribute expected days
            });

            // It must be deleted
            const sameAttribute = await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            });

            expect(sameAttribute).not.toBeNull();

            // Thier ids must be the same
            expect(oldAttribute.id).toBe(sameAttribute.id);

            // All must be existed. count is easier here
            const count = await Attribute.count();

            expect(count).toBe(5);
        });
    });

    describe("delete service function reflection on the tasks", () => {
        it.skip("Should use the same attribute for the shared attribute where the first plan delete that attribute task value must exist (delete onMoreThanOneMatch case)", async () => {
            // Create a workspace
            const workspace = await workspaceServices.create({
                name: "test workspace",
                description:
                    "This workspace is mainly used to test plan creation",
            });

            // Valiadte if the workspace has created or not
            expect(typeof workspace.dataValues.id).toBe("number");

            // Create the plan
            const plan1 = await planServices.create({
                name: "test plan",
                metadata: { "expected days": { type: "string" } },
                workspaceId: workspace.dataValues.id,
            });
            const plan2 = await planServices.create({
                name: "Another test plan",
                metadata: { "expected days": { type: "string" } },
                workspaceId: workspace.dataValues.id,
            });

            expect(typeof plan1.dataValues.id).toBe("number");

            // Get the attribute
            const oldAttribute = await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            });

            // Check if it's existed or not
            expect(oldAttribute).not.toBeNull();

            // Delete the plan that share the attribute expected days
            await planServices.update(plan1.id, {
                metadata: {}, // Same as deleting the attribute expected days
            });

            // It must not be deleted
            const sameAttribute = await Attribute.findOne({
                where: {
                    key: "expected days",
                },
            });

            expect(sameAttribute).not.toBeNull();

            // Create a task on the remaining plan (plan2) with the shared attribute
            const task = await taskServices.create({
                planId: plan2.id,
                title: "Task in plan 2",
                metadata: {
                    "expected days": "10 days",
                },
            });

            // Find the value based on task id and the shared attribute id
            const taskValue = await Value.findOne({
                where: {
                    taskId: task.id,
                    attributeId: oldAttribute.id,
                },
            });

            // The value must not be null
            expect(taskValue).not.toBeNull();
        });
    });
});

describe.skip("The plan update service function reflection on the plan & tasks", () => {
    describe("changes contain typeChangedNormal", () => {
        describe("typeChangedNormal changes reflection on plans", () => {
            it.skip("Should update the attribute type (typeChangedNormal onOneMatch case)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
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

                // Get the attribute before
                const oldAttributeId = (
                    await Attribute.findOne({
                        where: {
                            key: "expected days",
                        },
                    })
                ).id;

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

                // It must be the same id
                expect(oldAttributeId).toBe(newAttribute.id);
            });
            it.skip("Should create another attribute with the new type and the old must stay the same (typeChangedNormal onMoreThanOneMatch case)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plans
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

                // Get the old attribute
                const oldAttribute = await Attribute.findOne({
                    where: { key: "expected days" },
                });

                await planServices.update(plan1.id, {
                    metadata: {
                        "expected days": {
                            type: "number",
                        },
                    },
                });

                // The old is still exists
                expect(
                    await Attribute.findOne({
                        where: { key: "expected days" },
                    }),
                ).not.toBeNull();

                const newAttribute = await Attribute.findOne({
                    where: {
                        key: "expected days",
                        type: "number",
                    },
                });

                // The new one is existed and with the new type
                expect(newAttribute).not.toBeNull();

                // It must be linked to the plan
                const planAttributeNew = await PlanAttribute.findOne({
                    where: {
                        planId: plan1.id,
                        attributeId: newAttribute.id,
                    },
                });

                expect(planAttributeNew).not.toBeNull();

                // The old one is still remaining
                const planAttributeOld = await PlanAttribute.findOne({
                    where: {
                        planId: plan2.id,
                        attributeId: oldAttribute.id,
                    },
                });

                expect(planAttributeOld).not.toBeNull();
            });
        });

        describe("typeChangedNormal changes reflection on tasks", () => {
            it.skip("Should update the associated tasks and set the conflict fields to null updating X attribute in the plan (normal to normal)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
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

                const tasks = await taskServices.getAll();
                tasks.data.forEach((task) => {
                    switch (task.dataValues.id) {
                        case 1:
                            expect(
                                task.dataValues.columns["expected days"],
                            ).toBe("1");
                            break;
                        case 2:
                            expect(
                                task.dataValues.columns["expected days"],
                            ).toBeNull();
                            break;
                        case 3:
                            expect(
                                task.dataValues.columns["expected days"],
                            ).toBe("3");
                            break;
                    }
                });
            });
            it.skip("Should link the values to the new attribute because there is another plan linekd to the same attribute while old keep the old reference", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plans
                const plan1 = await planServices.create({
                    id: 1,
                    name: "test plan",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });
                const plan2 = await planServices.create({
                    id: 2,
                    name: "test plan2",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                expect(typeof plan1.dataValues.id).toBe("number");
                expect(typeof plan2.dataValues.id).toBe("number");

                // Create the tasks
                const updatedTask = await taskServices.create({
                    id: 1,
                    planId: plan1.dataValues.id,
                    title: "Task 1 in the plan 1",
                    metadata: {
                        "start date": new Date(),
                        "end date": new Date(),
                        status: "done",
                        "related plan": "plan A",
                    },
                });

                // Create and save this task
                const otherTask = await taskServices.create({
                    id: 2,
                    planId: plan2.dataValues.id,
                    title: "Task 1 in the plan 2",
                    metadata: {
                        "start date": new Date(),
                        "end date": new Date(),
                        status: "done",
                        "related plan": "plan B",
                    },
                });

                // Update the first plan
                await planServices.update(plan1.id, {
                    metadata: {
                        "related plan": {
                            type: "number",
                        },
                    },
                });

                // Check the new attribute
                const newAttribute = await Attribute.findOne({
                    where: {
                        key: "related plan",
                        type: "number",
                    },
                });

                // The new one is existed and with the new type
                expect(newAttribute).not.toBeNull();

                // Now the task should be linked to it
                const taskValue = await Value.findOne({
                    where: {
                        taskId: updatedTask.id,
                        attributeId: newAttribute.id,
                    },
                });

                // It must exist and with the null value
                expect(taskValue).not.toBeNull();
                expect(taskValue.value).toBeNull();

                // The other plan's column must still refere to that record
                const oldAttribute = await Attribute.findOne({
                    where: {
                        key: "related plan",
                        type: "string",
                    },
                });

                expect(oldAttribute).not.toBeNull();

                const otherTaskValue = await Value.findOne({
                    where: {
                        taskId: otherTask.id,
                        attributeId: oldAttribute.id,
                    },
                });

                expect(otherTaskValue).not.toBeNull();
                expect(otherTaskValue.value).toBe("plan B");
            });
        });
    });

    describe("changes contain typeChangedCheck", () => {
        describe("typeChangedCheck changes relfection on plans", () => {
            it.skip("Should update the attribute type (typeChangedCheck onMoreThanOneMatch case)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plan
                const plan = await planServices.create({
                    name: "test plan",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                expect(typeof plan.dataValues.id).toBe("number");

                // Get the attribute id before the update
                const oldAttributeId = (
                    await Attribute.findOne({
                        where: { key: "related plan" },
                    })
                ).id;

                await planServices.update(plan.id, {
                    metadata: {
                        "related plan": {
                            type: "check",
                            values: ["plan A", "plan B", "plan C"],
                        },
                    },
                });

                // Check the type now
                const newAttribute = await Attribute.findOne({
                    where: { key: "related plan" },
                });

                expect(newAttribute.dataValues.type).toBe("check");

                // It must be the same id
                expect(oldAttributeId).toBe(newAttribute.id);
            });
            it.skip("Should keep the old one and create a new one (typeChangedCheck onMoreThanOneMatch case)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plans
                const plan1 = await planServices.create({
                    name: "test plan",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });
                const plan2 = await planServices.create({
                    name: "test plan2",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                expect(typeof plan1.dataValues.id).toBe("number");
                expect(typeof plan2.dataValues.id).toBe("number");

                // Get the old attribute
                const oldAttribute = await Attribute.findOne({
                    where: { key: "related plan" },
                });

                await planServices.update(plan1.id, {
                    metadata: {
                        "related plan": {
                            type: "check",
                            values: ["plan A", "plan B", "plan C"],
                        },
                    },
                });

                // The old is still exists
                expect(
                    await Attribute.findOne({
                        where: { key: "related plan", type: "string" },
                    }),
                ).not.toBeNull();

                const newAttribute = await Attribute.findOne({
                    where: {
                        key: "related plan",
                        type: "check",
                    },
                });

                // The new one is existed and with the new type
                expect(newAttribute).not.toBeNull();

                // It must be linked to the plan
                const planAttributeNew = await PlanAttribute.findOne({
                    where: {
                        planId: plan1.id,
                        attributeId: newAttribute.id,
                    },
                });

                expect(planAttributeNew).not.toBeNull();

                // The old one is still remaining
                const planAttributeOld = await PlanAttribute.findOne({
                    where: {
                        planId: plan2.id,
                        attributeId: oldAttribute.id,
                    },
                });

                expect(planAttributeOld).not.toBeNull();
            });
        });

        describe("typeChangedCheck changes relfection on tasks", () => {
            it.skip("Should update the associated tasks and delete the conflict fields after updating X attribute in the plan (check type to normal type)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plan
                const plan = await planServices.create({
                    name: "test plan",
                    metadata: {
                        flag: { type: "check", values: [1, "red", "blue"] },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                expect(typeof plan.dataValues.id).toBe("number");

                const planF = await Plan.findByPk(plan.id);

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

                const tasks = await taskServices.getAll();
                tasks.data.forEach((task) => {
                    switch (task.dataValues.id) {
                        case 1:
                            expect(task.dataValues.columns["flag"]).toBe("1");
                            break;
                        case 2:
                            // Got deleted in another word
                            expect(task.dataValues.columns["flag"]).toBeNull();
                            break;
                        case 3:
                            expect(task.dataValues.columns["flag"]).toBeNull();
                            break;
                    }
                });
            });
            it.skip("Should update the associated tasks and delete the conflict fields after updating X attribute in the plan (normal type to check type)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
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

                const tasks = await taskServices.getAll();

                tasks.data.forEach((task) => {
                    switch (task.dataValues.id) {
                        case 1:
                            expect(task.dataValues.columns["flag"]).toBeNull();
                            break;
                        case 2:
                            // Got deleted in another word
                            expect(task.dataValues.columns["flag"]).toBe("red");
                            break;
                        case 3:
                            expect(task.dataValues.columns["flag"]).toBe(
                                "blue",
                            );
                            break;
                    }
                });
            });
            it.skip("Should update the associated tasks and delete the conflict fields after updating X attribute in the plan (check type to check type)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
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
                            expect(task.dataValues.metadata["flag"]).toBe(
                                undefined,
                            );
                            break;
                        case 3:
                            expect(task.dataValues.metadata["flag"]).toBe(
                                undefined,
                            );
                            break;
                    }
                });
            });
            it.skip("Should link the values to the new attribute because there is another plan linekd to the same attribute while old keep the old reference", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plans
                const plan1 = await planServices.create({
                    name: "test plan",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });
                const plan2 = await planServices.create({
                    name: "test plan2",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                expect(typeof plan1.dataValues.id).toBe("number");
                expect(typeof plan2.dataValues.id).toBe("number");

                // Create the tasks
                const updatedTask = await taskServices.create({
                    id: 1,
                    planId: plan1.dataValues.id,
                    title: "Task 1 in the plan 1",
                    metadata: {
                        "start date": new Date(),
                        "end date": new Date(),
                        status: "done",
                        "related plan": "plan A",
                    },
                });

                // Create and save this task
                const otherTask = await taskServices.create({
                    id: 2,
                    planId: plan2.dataValues.id,
                    title: "Task 1 in the plan 2",
                    metadata: {
                        "start date": new Date(),
                        "end date": new Date(),
                        status: "done",
                        "related plan": "plan B",
                    },
                });

                // Update the first plan
                await planServices.update(plan1.id, {
                    metadata: {
                        "related plan": {
                            type: "check",
                            values: ["plan A", "plan C"],
                        },
                    },
                });

                // Check the new attribute
                const newAttribute = await Attribute.findOne({
                    where: {
                        key: "related plan",
                        type: "check",
                    },
                });

                // The new one is existed and with the new type
                expect(newAttribute).not.toBeNull();

                // Now the task should be linked to it
                const taskValue = await Value.findOne({
                    where: {
                        taskId: updatedTask.id,
                        attributeId: newAttribute.id,
                    },
                });

                // It must exist and with the null value
                expect(taskValue).not.toBeNull();
                expect(taskValue.value).toBeNull();

                // The other plan's column must still refere to that record
                const oldAttribute = await Attribute.findOne({
                    where: {
                        key: "related plan",
                        type: "string",
                    },
                });

                expect(oldAttribute).not.toBeNull();

                const otherTaskValue = await Value.findOne({
                    where: {
                        taskId: otherTask.id,
                        attributeId: oldAttribute.id,
                    },
                });

                expect(otherTaskValue).not.toBeNull();
                expect(otherTaskValue.value).toBe("plan B");
            });
        });
    });

    describe("changes contain new attribute", () => {
        describe("new attribute effect on plans", () => {
            it.skip("Should create the new attribute and link it correctly (new onNoMatch case)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plan
                const plan = await planServices.create({
                    name: "test plan",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                expect(typeof plan.dataValues.id).toBe("number");

                // Update the plan
                await planServices.update(plan.id, {
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                        "expected days": {
                            type: "number",
                        },
                    },
                });

                // Check the new attribute
                const newAttribute = await Attribute.findOne({
                    where: {
                        key: "expected days",
                    },
                });

                expect(newAttribute).not.toBeNull();

                // Check if it's linked
                const attributePlan = await PlanAttribute.findOne({
                    where: {
                        planId: plan.id,
                        attributeId: newAttribute.id,
                    },
                });

                expect(attributePlan).not.toBeNull();
            });
            it.skip("Should not create the new attribute because there is another plan uses it. Instead it must just link them (new onMatch case)", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plan
                const plan = await planServices.create({
                    name: "test plan",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                const anotherPlan = await planServices.create({
                    name: "another plan",
                    metadata: {
                        "expected days": {
                            type: "number",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                expect(typeof plan.dataValues.id).toBe("number");
                expect(typeof anotherPlan.dataValues.id).toBe("number");

                // Get the expcted days attribute
                const oldAttribute = await Attribute.findOne({
                    where: {
                        key: "expected days",
                    },
                });

                expect(oldAttribute).not.toBeNull();

                // Update the plan
                await planServices.update(plan.id, {
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                        "expected days": {
                            type: "number",
                        },
                    },
                });

                // Check that the attribute is only existed once
                const newAttribute = await Attribute.findAll({
                    where: {
                        key: "expected days",
                    },
                });

                // Only one element
                expect(newAttribute).toHaveLength(1);

                // They must be the same
                expect(newAttribute[0].id).toBe(oldAttribute.id);

                // It must be linked
                const attributePlan = await PlanAttribute.findOne({
                    where: {
                        planId: plan.id,
                        attributeId: oldAttribute.id,
                    },
                });

                expect(attributePlan).not.toBeNull();
            });
        });

        describe("new attribute effect on tasks", () => {
            it.skip("The new values should be linked to the old attribute", async () => {
                // Create a workspace
                const workspace = await workspaceServices.create({
                    name: "test workspace",
                    description:
                        "This workspace is mainly used to test plan creation",
                });

                // Valiadte if the workspace has created or not
                expect(typeof workspace.dataValues.id).toBe("number");

                // Create the plan
                const plan = await planServices.create({
                    name: "test plan",
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                const anotherPlan = await planServices.create({
                    name: "another plan",
                    metadata: {
                        "expected days": {
                            type: "number",
                        },
                    },
                    workspaceId: workspace.dataValues.id,
                });

                // Add a task here
                const otherTask = await taskServices.create({
                    planId: anotherPlan.id,
                    title: "This is a task",
                    metadata: {
                        "start date": new Date(),
                        "end date": new Date(),
                        status: "done",
                        "expected days": 1,
                    },
                });

                // Get the attribute
                const attribute = await Attribute.findOne({
                    where: {
                        key: "expected days",
                    },
                });

                // Get that specific value
                const val = await Value.findOne({
                    where: {
                        taskId: otherTask.id,
                        attributeId: attribute.id,
                    },
                });

                expect(typeof plan.dataValues.id).toBe("number");
                expect(typeof anotherPlan.dataValues.id).toBe("number");

                // Update the plan
                await planServices.update(plan.id, {
                    metadata: {
                        "related plan": {
                            type: "string",
                        },
                        "expected days": {
                            type: "number",
                        },
                    },
                });

                // Create a task in the other plan
                const task = await taskServices.create({
                    planId: plan.id,
                    title: "This is a new updated task",
                    metadata: {
                        "start date": new Date(),
                        "end date": new Date(),
                        status: "done",
                        "expected days": 2,
                    },
                });

                // Get the new value with the old attribute reference
                const newValue = await Value.findOne({
                    where: {
                        taskId: task.id,
                        attributeId: attribute.id,
                    },
                });

                expect(newValue).not.toBeNull();
            });
        });
    });

    describe("changes contain nameChanged", () => {
        it.skip("Should create another attribute instead of changing the existing one (nameChanged onMoreThanOneMatch case)", async () => {
            // Create a workspace
            const workspace = await workspaceServices.create({
                name: "test workspace",
                description:
                    "This workspace is mainly used to test plan creation",
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
        it.skip("Should change the plan attribute name (nameChanged onOneMatch case)", async () => {
            // Create a workspace
            const workspace = await workspaceServices.create({
                name: "test workspace",
                description:
                    "This workspace is mainly used to test plan creation",
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

        const tasks = await taskServices.getAll(1, 100);

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
