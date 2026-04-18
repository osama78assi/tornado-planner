---
description: Application specific
---

This application is built with JavaScript. Please make sure to know the tech stack first so you know what you need to code

# Tech Stack

1. Node js
2. Electron js
3. Sequelize
4. SQLite
5. React js
6. Tailwind CSS

Please follow those rules while coding in js

1. Never use arrow function except in callbacks or when I tell you explicitly. So in callbacks like useEffect, map, filter and all of those things user arrow fuction, in code level never store the functions in variables that's it
2. Don't store functions in variables in react components except when using useCallback hook
3. Backend build with ES modules so make sure to not import moduels with require
4. Use tailwind CSS for styling
5. Always add some comments explain your code before each line (not all but some of them something like explaining the algorithm)

# Some notes about the application

- The application render a lot of things based on the current page and to know that check `renderer/src/util/main.js` a function called `getPageFromPath` so we are detecting the page based in routes so in case I asked you to add a page and render something based on it make sure to sync this function with the routes
- When some utility component needed such as input, dropdown menu, checkbox, modal and others check `renderer/src/components/ui`
- Some stlying with rare cases I use my class and apply tailwind please refere to this file you will find it `renderer/src/index.css` so you can update them or find them as a reference
