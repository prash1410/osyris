# Osyris

A Project Management App built on React and a tiny Python Flask Backend meant to address the following use cases:
1. Manage multiple projects with multiple team members at task level
2. Central place for documenting all project timelines
3. Preserve what happened in the past, how much time it took to achieve it so that future timelines can be better formulated
4. Get an overall perspective of what is happening now, what is next to come and how far into the future we have visibility
5. Better manage utilization of team members at task level, to decide with ease, which team member(s) can take up upcoming tasks

The app has following views:

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
  
- Also provides a brief glimpse of the look-ahead period by highlighting upcoming stories and leaves to be taken by the team members
