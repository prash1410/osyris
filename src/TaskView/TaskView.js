import React from 'react';
import './TaskView.css';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import cloneDeep from 'lodash/cloneDeep';

import TaskCardContainer from './TaskCardContainer/TaskCardContainer.js';
import TaskViewer from './TaskViewer/TaskViewer.js';

const styles = theme => ({
  input: {
    color: "#EEEDE7",
    fontSize: '1.5em'
  },
  formLabel: {
    '&.Mui-focused': {
      color: 'gray'
    }
  },
  select: {
        '&:after': {
            borderColor: '#EEEDE7'
        }
    },
  root: {
      '& label.Mui-focused': {
        color: 'gray',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#EEEDE7',
      },
    },
});

class TaskView extends React.Component
{
  constructor(props)
  {
    super(props);
    var teamMembers = [];
    for (var [key, value] of Object.entries(this.props.teamMembers))
    {
      teamMembers.push(key);
    }
    teamMembers = teamMembers.sort();
    this.state = {team:teamMembers,
                  assignee:teamMembers[0],
                  projects:cloneDeep(this.props.projects),
                  showTaskViewer:false,
                  taskViewerPayload:null};

    this.taskClickHandler = this.taskClickHandler.bind(this);
    this.closeTaskViewer = this.closeTaskViewer.bind(this);
    this.editTaskHandler = this.editTaskHandler.bind(this);
    this.deleteTaskHandler = this.deleteTaskHandler.bind(this);
  }

  taskClickHandler(argument)
  {
    this.setState({showTaskViewer: true, taskViewerPayload:argument});
  }

  closeTaskViewer(argument)
  {
    this.setState({showTaskViewer: false});
  }

  editTaskHandler(argument)
  {
    var projects = cloneDeep(this.props.projects);
    for (var story of projects[argument.project].stories)
    {
      for (var i = 0; i < story.tasks.length; i++)
      {
        if (story.tasks[i].taskID === argument.taskState.taskID)
        {
          story.tasks[i] = cloneDeep(argument.taskState);
          console.log('updated');
          break;
        }
      }
    }
    this.props.taskViewerEditDeleteTask(projects);
    this.setState({showTaskViewer: false, projects:projects});
  }

  deleteTaskHandler(argument)
  {
    var projects = cloneDeep(this.props.projects);
    for (var story of projects[argument.project].stories)
    {
      for (var i = 0; i < story.tasks.length; i++)
      {
        if (story.tasks[i].taskID === argument.taskID)
        {
          story.tasks.splice(i, 1);
          console.log('deleted');
          break;
        }
      }
    }
    this.props.taskViewerEditDeleteTask(projects);
    this.setState({showTaskViewer: false, projects:projects});
  }

  onAssigneeSelect = event =>
  {
    this.setState({assignee:event.target.value});
  };

  render()
  {
    const { classes } = this.props;
    var teamSelectArray = [];
    for (var member of this.state.team)
    {
      teamSelectArray.push(<MenuItem value={member}>{member}</MenuItem>)
    }

    function sortAscending( a, b )
    {
      if ( new Date(a.taskData.startDate) < new Date(b.taskData.startDate) )
      {
        return -1;
      }
      if ( new Date(a.taskData.startDate) > new Date(b.taskData.startDate) )
      {
        return 1;
      }
      return 0;
    }

    function sortDecending( a, b )
    {
      if ( new Date(a.taskData.startDate) > new Date(b.taskData.startDate) )
      {
        return -1;
      }
      if ( new Date(a.taskData.startDate) < new Date(b.taskData.startDate) )
      {
        return 1;
      }
      return 0;
    }

    function sortCompletedTasks( a, b )
    {
      if ( new Date(a.taskData.actualEndDate) > new Date(b.taskData.actualEndDate) )
      {
        return -1;
      }
      if ( new Date(a.taskData.actualEndDate) < new Date(b.taskData.actualEndDate) )
      {
        return 1;
      }
      return 0;
    }

    var completedTasks = [];
    var inProgressTasks = [];
    var notStartedTasks = [];

    for (var [key, value] of Object.entries(this.state.projects))
    {
      if (value.stories !== undefined)
      {
        for (var story of value.stories)
        {
          for (var task of story.tasks)
          {
            var taskMetadata = {};
            taskMetadata['project'] = story.project;
            taskMetadata['projectColor'] = value.color;
            if (task.assignee === this.state.assignee)
            {
              if (task.taskStatus === 'Not Started') notStartedTasks.push({taskMetadata:taskMetadata,taskData:task});
              if (task.taskStatus === 'In Progress') inProgressTasks.push({taskMetadata:taskMetadata,taskData:task});
              if (task.taskStatus === 'Completed') completedTasks.push({taskMetadata:taskMetadata,taskData:task});
            }
          }
        }
      }
    }

    notStartedTasks.sort(sortAscending);
    inProgressTasks.sort(sortAscending);
    completedTasks.sort(sortCompletedTasks);

    var taskViewer = null;
    if (this.state.showTaskViewer) taskViewer = <TaskViewer teamMembers={this.props.teamMembers} editTaskHandler={this.editTaskHandler} deleteTaskHandler={this.deleteTaskHandler} closeTaskViewer={this.closeTaskViewer} payload={this.state.taskViewerPayload}/>

    return (
      <>
      <div className='task-view-layout'>
        <div className='tasks-container'>
          <div className='task-view-header-container'>
            Team Member:
              &nbsp;&nbsp;&nbsp;
              <Select className={classes.select} value={this.state.assignee} style={{width:'8em', color:'#EEEDE7', fontSize:'1em'}} onChange={this.onAssigneeSelect}>
                {teamSelectArray}
              </Select>
          </div>
          <div className='task-cards-container-layout'>
            <TaskCardContainer cardType='Not Started' editTaskHandler={this.editTaskHandler} deleteTaskHandler={this.deleteTaskHandler} taskClickHandler={this.taskClickHandler}  taskArray={notStartedTasks}/>
            <TaskCardContainer cardType='In Progress' editTaskHandler={this.editTaskHandler} deleteTaskHandler={this.deleteTaskHandler} taskClickHandler={this.taskClickHandler} taskArray={inProgressTasks}/>
            <TaskCardContainer cardType='Completed' editTaskHandler={this.editTaskHandler} deleteTaskHandler={this.deleteTaskHandler} taskClickHandler={this.taskClickHandler} taskArray={completedTasks}/>
          </div>
        </div>
      </div>
      {taskViewer}
      </>
    );
  }

}

export default withStyles(styles)(TaskView);
