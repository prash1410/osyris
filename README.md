# Osyris

A Project Management App built on React and a tiny Python Flask Backend meant to address the following use cases:
1. Manage multiple projects with multiple team members at task level
2. Central place for documenting all project timelines
3. Preserve what happened in the past, how much time it took to achieve it so that future timelines can be better formulated
4. Get an overall perspective of what is happening now, what is next to come and how far into the future we have visibility
5. Better manage utilization of team members at task level, to decide with ease, which team member(s) can take up upcoming tasks

Building on ideas inspired by project management tool like JIRA, the task hierarchy used in this app is as follows:
- Each team can have multiple projects and team members
- Each project can have mutiple stories
- Each story is a combination of tracks which are parallel to each other
- Each track is made up of discrete sequential tasks which cannot overlap each other
- Each task can be assigned to only one team member

Let's take a look at the views built within the app:

**1. Landing Page**
![Landing Page](https://user-images.githubusercontent.com/33143837/132480055-80c0895c-08d2-42c6-8c43-0de3f050fcb7.png)
- Provides options for selecting an already existing team or for creating a new team

*Let's take a look at an already created team as an example*


**2. Delivery Summary View**
![Delivery Summary](https://user-images.githubusercontent.com/33143837/132480655-306ec5f2-6512-4540-85e0-a24721df8405.png)
- This view is populated based on the tasks and stories created in **3. Roadmap View**, which is depicted in the next section
- Provides delivery summary of the look-back period around the following points:
  - Number of active projects, tasks completed, delays and errors
  - Ongoing stories and progress vs time elapsed for each of them
  - Aggregated and individual utilization of the team members
  
- Also provides a glimpse into the look-ahead period by highlighting upcoming stories and leaves to be taken by the team members



**3. Roadmap View**
![Roadmap View](https://user-images.githubusercontent.com/33143837/132488934-eed8de9b-e44c-4c91-8bd8-2a50c20b45ff.png)
- This view is the most dynamic and interactive of all the views which displays timelines of all stories at week, month, quarter or year level
- It offers functionality to view, create, edit and delete stories corresponding to any project


**4. Edit/Create Story View**

Let's take a look at an already created story *Half-yearly Forecast Refresh* in *Sales Forecasting* project 
![Edit-Create Story View](https://user-images.githubusercontent.com/33143837/132489181-f2c3198a-f5bd-4df4-8aa0-9960008bc214.png)
- The story currently has two parallel tracks; Forecasting and Results Dashboard, indicating that these threads/tracks can be worked on parallely
- User always has functionality to add or delete tracks from the story, rename them or even add or delete tasks from these tracks


**5. Edit/Create Task View**

Clicking on any empty cell on a corresponding track allows user to create a task in that track while clicking on an already existing task allows user to see more details about that task or edit or delete the task
![Edit-Create Task View](https://user-images.githubusercontent.com/33143837/132490293-8ad53862-0c15-454d-b8e8-2e3899d2a7a5.png)
- Edit/Create Task View provides multiple options to add details to tasks which eventually are used to populate summary view
