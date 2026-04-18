// __mocks__/electron.js
const app = {
    getPath: (key) => `/mock/path/${key}`,
    isPackaged: false,
};

export { app };
