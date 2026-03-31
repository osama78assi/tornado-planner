> ## New tables

the table tasks no longer hold metadata attributes, instead we will store an attributes table the following

| id  | key        | type   |
| --- | ---------- | ------ |
| 1   | start date | string |
| 2   | end date   | date   |

then there is another table to hold the value

| id  | attribute_id | value      | task_id |
| --- | ------------ | ---------- | ------- |
| 1   | 1            | 10/10/2001 | 1       |
| 2   | 2            | 11/10/2002 | 1       |

then there is a new relation with the plans table it will link the attribute with the plan to know each plan the expected schema

| attribute_id | plan_id |
| ------------ | ------- |
| 1            | 1       |
| 2            | 1       |
| 3            | 1       |

> ## Pipelines

- when create the plan  
  sanitize metadata -> add/replace default schemas -> validate the metadata -> insert the new attributes (unique by attribute key and type on conflict do nothing) -> link the attributes to the plan via junction table -> create the plan

- when update the plan  
  check if the old attribute isn't used anymore -> update that attribute or add another one -> eprepare the differntiation object -> parse the object to prepare the final queries to update the relation between tasks and attributes that are linked to the plan

- when create the task
  Validate valid plan attributes -> validate the global values attribute based on types -> create the task

- when update the task
  Validate valid plan attributes -> validate the global values attribute based on types -> create the task
