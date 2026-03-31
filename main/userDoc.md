# Tornado Planner

this is a simple application to manage all my plans on it, With Tornado planner you can manage many workspaces and plans at the same time. Note that this application isn't meant to work with team, it's peronsal planner and notes keeper at the same time. With this let's list what the application can do

# Features

There is two types of features that Tornado Planer provides. First one is called the basics features while the others are core features. Let's go over them

## Basics

**1. Workspaces**

You can create many workspaces, Each workspace represent a massive scope. For example you can create a workspace called Being a Fullstack developer. And at the same time you want to be a good reader so you will create another workspace called Being a Reader and so on, while you can create many notes in the workspace or in the general area and folders are supported everywhere and folders inside workspaces will not appear in the general area to make the application organization better

**2. Plans**

Each workspace contains many plans, For example to be a fullstack developer you need to go over many tracks and you want to manage each one individually. So you will create a plan called Frontend, another plan is Database and the final (at least basics) Backend. and so on

**3. Task**

Now the core of tracking which is the tasks and that's everybody knows what it is. Like watch 5 videos in frontend, watch 2 videos in backend and so on

## Advanced

**1. Schema**

Not all tasks match the same what I call it **schema**. For example to be a good reader you want to read some pages every day, let's say 5 pages, but you could read only 4. Then the **schema** you want isn't the standered one because many things like how would you track your progress with this ? it's hard to stick with this one. What if you want to know how many unique book you have done in the last month ? and many things that you can use today the help of AI to analyze it. Tornado Planner support **export as CSV** that will help you to give something readable to AI. But to make more easier to understand more even without the AI like take a quick look at the table and you can detect that. Let's see the **standered schema** would look like

|              Title              |     Description      | Priority |   Status    | Start Date |  End Date  |
| :-----------------------------: | :------------------: | :------: | :---------: | :--------: | :--------: |
| Read 5 pages from Atomic Habits | This is only 5 pages |   high   | in progress | 10/20/2020 |            |
| Read 5 pages from Atomic Habits | This is only 5 pages |   high   |    Done     | 11/21/2020 | 11/21/2020 |

But what if it can be something like this ?

|     Title     | Description |     Book      | Page read | Priority | Status | Start Date |  End Date  |
| :-----------: | :---------: | :-----------: | :-------: | :------: | :----: | :--------: | :--------: |
| Read 5 pages  |      -      | Atomic Habits |     5     |  Medium  |  Done  | 11/20/2020 | 11/20/2020 |
| Read 5 pages  |      -      | Atomic Habits |     2     |  Medium  |  Done  | 11/21/2020 | 11/21/2020 |
| Read 15 pages |      -      |  Art of War   |     9     |   High   |  Done  | 11/22/2020 | 11/22/2020 |

**Yes** you can achive that with Tornado Planner. By defining the **Schema** you want for each plan you want and that **tasks** will follow that plan out of the box. And that is done by adding a new **Attribute** like _Page read_ then specify the type of the field. That will help more in data entry. Currently we support those types (the most use for tracking and planning)

|            Types             |
| :--------------------------: |
| Text (refered as string too) |
|            Number            |
|             Date             |
|            Check             |

# Application settings
Tornado planner provide a `setting` page to be helpful as much as possible, so I will list the available settings in the application and its purpose
1. Mode, whether it's dark or light, maybe we will have more in the future
2. Main color, currently orange and blue is supported
3. Default date format, that is for quick creation