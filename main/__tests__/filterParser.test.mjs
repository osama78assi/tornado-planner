import { and, Op } from "sequelize";
import { mapFilters } from "../util/global.js";

describe("Filter mapper test cases", () => {
    it("Should map the filters correctly. Two fields are provided, 'and' block with one condition", () => {
        const filters = {
            title: {
                and$: [{ iLike$: "read" }],
            },
            priority: {
                and$: [{ eq$: "low" }],
            },
        };

        expect(mapFilters(filters)).toEqual({
            title: {
                [Op.and]: [{ [Op.iLike]: "read" }],
            },
            priority: {
                [Op.and]: [{ [Op.eq]: "low" }],
            },
        });
    });

    it.skip("Should map the filters correctly. Two fields are provied, 'and' block with two condition", () => {
        const filters = {
            process: {
                and$: [{ lt$: 1 }, { gt$: -10 }],
            },
            age: {
                and$: [{ gte$: 18 }, { lte$: 60 }],
            },
        };

        expect(mapFilters(filters)).toEqual({
            process: {
                [Op.and]: [{ [Op.lt]: 1 }, { [Op.gt]: -10 }],
            },
            age: {
                [Op.and]: [{ [Op.gte]: 18 }, { [Op.lte]: 60 }],
            },
        });
    });

    it.skip("Should map the filters correctly. Two fields are provied, 'and' block with two condition. Same with 'or'", () => {
        const filters = {
            process: {
                and$: [{ lt$: 1 }, { gt$: -10 }],
                or$: [{ lt$: 1 }, { gt$: -10 }],
            },
            age: {
                and$: [{ gte$: 18 }, { lte$: 60 }],
                or$: [{ gte$: 18 }, { lte$: 60 }],
            },
        };

        expect(mapFilters(filters)).toEqual({
            process: {
                [Op.and]: [{ [Op.lt]: 1 }, { [Op.gt]: -10 }],
                [Op.or]: [{ [Op.lt]: 1 }, { [Op.gt]: -10 }],
            },
            age: {
                [Op.and]: [{ [Op.gte]: 18 }, { [Op.lte]: 60 }],
                [Op.or]: [{ [Op.gte]: 18 }, { [Op.lte]: 60 }],
            },
        });
    });
    it.skip("Should return empty object", () => {
        expect(mapFilters({})).toEqual({});
    });
});

describe("Advanced filter mapper test cases", () => {
    it.skip("Should map the trivial test case", () => {
        // Normal
        let filters = {
            taskTitle: {
                startsWith$: "test",
                endsWith$: "1",
            },
        };

        let mappedFilters = mapFilters(filters);

        expect(mappedFilters).toMatchObject({
            taskTitle: {
                [Op.startsWith]: "test",
                [Op.endsWith]: "1",
            },
        });
    });

    it("Should map a array inside an array case", () => {
        // Or/And Complex
        let filters = {
            or$: [{ and$: [{ age: { eq$: 3 } }] }],
            id: 2,
            name: {
                or$: [{ iLike$: "%test" }],
            },
        };

        let mappedFilters = mapFilters(filters);

        expect(mappedFilters).toMatchObject({
            [Op.or]: [{ [Op.and]: [{ age: { [Op.eq]: 3 } }] }],
            id: 2,
            name: {
                [Op.or]: [
                    {
                        [Op.iLike]: "%test",
                    },
                ],
            },
        });
    });
});
