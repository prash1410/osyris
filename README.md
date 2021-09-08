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


**6. Utilization View**

Based on the utilization set for each task, this view combines it all to give a comprehensive overview of utilization of each team member, both in the look-back period and look-ahead period
![Team Utilization View](https://user-images.githubusercontent.com/33143837/132491684-5b575b5e-bf62-4854-acdc-b54081da84db.png)
- The utilization charts also show which particular task a team member is working on upon hovering
- Analyzing look-back period utilization allows to assess if any team member was over or under utilized
- Analyzing look-ahead period utilization allows to assess which team member can be assigned any upcoming tasks


**7. Task View**

This task view is meant to be used for daily scrums, to discuss daily tasks with the team members and quickly change status of the tasks as they move into *In Progress* and *Completed* stages
![Task View](https://user-images.githubusercontent.com/33143837/132492463-5cb68eb4-1720-4c86-b323-a0181fd03b59.png)


**8. Team Management View**

Lastly, we have Team Management View
![Team Management View](https://user-images.githubusercontent.com/33143837/132492705-2555a28a-1b64-49d7-bb51-536734b79a55.png)
This view allows us to do the following:
- Add, delete, rename or change color of an already existing project
- Add, delete, rename or change color of an already existing team member
- Add or delete holidays and leaves *in case you were wondering where do holidays and leaves come from in the Summary View ;)*


**9. Add a New Team**

Finally, if you've made it this far and want to create your own team and manage your projects efficiently, you can simply do so by creating a new team from Landing Page
![Create a New Team](https://user-images.githubusercontent.com/33143837/132493264-fd4a9fab-d890-441f-992d-203eaf0b9a1d.png)


*Incepted and developed by:
Prashant Sahu*
