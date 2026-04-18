# In Hand
- the table of tasks in the frontend lucks the filter
- the table of tasks in the frontend lucks the sort
- the tasks must be editable nativly
- for the tasks with value number the input must only accept numbers
- for the tasks with check values must render dropdown menu
- the plan table can be exported as CSV, excel with one sheet on it
- all tables must allow get all data in one go, no limit
- the table should be fixed width for each column for now till we have resize, the content get wrapp all
- the table should never get narrow instead it will make the page scrollable
- the table should implement some components not directly inject content

# In Queue
- the table of tasks in the frontend lucks the resize
- the table of tasks in the frontend lucks the change columns order
- the application is missing a white theme
- the application is missing multi language (use i18next)

- the plan should have a page to show insights, it will be accessible from the sidebar, it will have some elements in the top (refere to next image elements.png) such as tasks completed in total, tasks remainging, average tasks finished in the same day, charts such as following:
    - a pie chart showing the active tasks spearated by the status
    - a line chart showing the active tasks during time of completion, and can show a line for each task prioirity

# Done
## 8/4/2026
- [ ✅ ] should check the operations on the tasks (delete / update the one that in the end of the test file)
- [ ✅ ]Should check when a delete happen on a plan and there is another plan uses the same attribute. Check the affect on tasks when get created 
- [ ✅ ] the folder luck a relation to workspace
on the remaing plan
- [ ✅ ] the folder luck a self relation to the parent folder

---

## 9/4/2026
- [ ✅ ] Remove the attribute metadata from tasks and anything related to it
- [ ✅ ] there is no global notes everything will be attached in the workspace
- [ ✅ ] There will no be home anymore. the home page will be workspaces
- [ ✅ ] All applications are accessible via plans
- [ ✅ ] New global state added which is navigator that tell which page is and controle sidebar
- [ ✅ ] Search moved now only for workspaces page and it's same functionailty
- [ ✅ ] App header is separated now and got more space
- [ ✅ ] Sidebar has been reduced in space and got the animation and new collapse style


## 12/4/2026
- [ ✅ ] The settings page is missing
- [ 🔃 ] The settings page should allow the user to change the theme
- [ 🔃 ] The settings page should allow the user to change the main color
- [ 🔃 ] The settings page should allow the user to change the language
- [ 🔃 ] The settings page should allow the import by accepting a database file
- [ ✅ ] The settings page should allow the backup by downloading the database file
- [ ✅ ] The service support queries without limit


## 13/4/2026
- [ ✅ ] Remove the lazy loading entirly
- [ ✅ ] Adding workspace dropdown selector
- [ ✅ ] Adding search ability to the dropdown
- [ ✅ ] Remove lazy loading from the application


# Main changes in the UI. Start with backend tasks then this
1. [ ✅ ] There will no be home anymore. the home page will be workspaces

2. [ ✅ ] the sidebar will be toggled with icons only and the sidebar is static now across all pages so we can remove the daynmic content component and dynamic sidebar component and stick with applayout. when the sidebar get toggled it will render the icon for the mini app along with the name and integator to the active minit app (sidebar done)

3. [ 🔃 ] the global state will have workspaces, selected workspace, save mode that will be used for notes so when user click on another workspace to remind him to save, the search will happen in the backend and the workpsaces will be layze loaded, selected mini application

4. [ ✅ ] there will be a global dropdown menu that will be rendered in the top to quickly toggle the workspace with ability to search too, this is linked to the global state too

5. [ ✅ ] the header will be danymic and listent to mini application changes and render components based on the current mini application, if the mini application is null which is the new home then it will render a main search bar in the middle that show the same model we have now and same functionility, the left will have the settings icon that navigate to settings page

6. [ 🔃 ] the content in the main page will render wedgets each one represnt a mini app in the header and toggler which is collapse component, the body will contain the recent opened things in the mini app like plans, notes and if there is no recent render icon and something says that. and when the user go to the mini application then the application slightly expand with smooth animation and show the names next to icons and make them interactive so he can move between mini applicaitons

7. the remaining is the same lists all plans, for the notes it will start with folders pretty much like hosting systems and when user click on a note then render the note

8. nested sidebar idea is still under study

# IMPORTANT:
- Notes mini application is suspended now

- if you can find a way to replace the async state with state tell me please or remove the dynamic header and go for each page
render its own header so no race condition happen (see syncronizing global selected workspace with the header)