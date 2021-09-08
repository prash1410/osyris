import React from 'react';

import './StoryMaker.css';
import '../../css/all.css';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import TrackRow from './TrackRow/TrackRow.js';
import TaskCreator from './TaskCreator/TaskCreator.js';

const styles = theme => ({
  input: {
    color: "#EEEDE7",
    fontSize: '0.8em',
    width:'100%'
  },
  root: {
      '& label.Mui-focused': {
        color: '#E7D2CC',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#E7D2CC',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#E7D2CC',
        },
        '&:hover fieldset': {
          borderColor: '#E7D2CC',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#E7D2CC',
        }
      },
    },
});

class StoryMaker extends React.Component
{
  constructor(props)
  {
    super(props);
    if (typeof this.props.payload.storyID !== 'undefined')
    {
      this.state = cloneDeep(this.props.payload.storyMakerPayload);
      this.state.lastState = cloneDeep(this.props.payload.storyMakerPayload);
    }
    else
    {
      this.state = {storyName: 'New Story',
                    project:this.props.payload.project,
                    storyID:undefined,
                    startDate:null,
                    endDate:null,
                    tracks:['Track #1'],
                    showTaskCreator:false,
                    taskCreatorPayload:null,
                    tasks:[]};
    }

    this.taskCellClickhandler = this.taskCellClickhandler.bind(this);
    this.addTaskHandler = this.addTaskHandler.bind(this);
    this.closeTaskCreatorHandler = this.closeTaskCreatorHandler.bind(this);
    this.trackNameChangehandler = this.trackNameChangehandler.bind(this);
    this.editTaskHandler = this.editTaskHandler.bind(this);
    this.deleteTaskHandler = this.deleteTaskHandler.bind(this);
    this.deleteTrackHandler = this.deleteTrackHandler.bind(this);
  }

  taskCellClickhandler(argument)
  {
    var startEndDates = [];
    for (var task of this.state.tasks)
    {
      if (argument.taskCreatorPayload.taskID === task.taskID) argument.taskCreatorPayload['taskDetails'] = task;
      else if (argument.taskCreatorPayload.trackIndex === task.trackIndex) startEndDates.push({startDate:task.startDate, endDate:task.endDate});
    }
    argument.taskCreatorPayload['otherTasksStartEndDates'] = startEndDates;
    this.setState(argument);
  };

  deleteTrackHandler(trackIndex)
  {
    if (trackIndex < -14)
    {
      var tasks = cloneDeep(this.state.tasks);
      var newTasks = [];
      for (var i = 0; i < tasks.length; i++)
      {
        if (tasks[i].trackIndex !== trackIndex) newTasks.push(tasks[i]);
      }

      var tracks = cloneDeep(this.state.tracks);
      var newTracks = [];

      for (var i = 0; i < tracks.length; i++)
      {
        if (i !== trackIndex) newTracks.push(tracks[i]);
      }

      this.setState({tasks:newTasks, tracks:newTracks});
    }
  };

  getStoryStartEndDates(tasks)
  {
    var taskStartDatesList = [];
    var taskEndDatesList = [];
    for (var task of tasks)
    {
      taskStartDatesList.push(new Date(task['startDate']));
      taskEndDatesList.push(new Date(task['endDate']));
    }
    var startDate = new Date(Math.min.apply(null,taskStartDatesList));
    var endDate = new Date(Math.max.apply(null,taskEndDatesList));
    var days = (endDate - startDate)/(1000 * 60 * 60 * 24) + 5;

    return {startDate:startDate, endDate:endDate};
  }

  addTaskHandler(argument)
  {
    var tasks = this.state.tasks;
    tasks.push(argument);
    var storyStartEndDates = this.getStoryStartEndDates(tasks);
    this.setState({tasks:tasks, startDate:storyStartEndDates.startDate, endDate:storyStartEndDates.endDate});
  }

  deleteTaskHandler(argument)
  {
    var tasks = this.state.tasks;
    for (var i = 0; i < tasks.length; i++)
    {
      if (argument === tasks[i].taskID)
      {
        tasks.splice(i, 1);
        break;
      }
    }
    var storyStartEndDates = this.getStoryStartEndDates(tasks);
    this.setState({tasks:tasks, startDate:storyStartEndDates.startDate, endDate:storyStartEndDates.endDate});
  }

  editTaskHandler(argument)
  {
    var tasks = this.state.tasks;
    for (var i = 0; i < tasks.length; i++)
    {
      if (argument.taskID === tasks[i].taskID)
      {
        tasks[i] = argument;
        break;
      }
    }
    var storyStartEndDates = this.getStoryStartEndDates(tasks);
    this.setState({tasks:tasks, startDate:storyStartEndDates.startDate, endDate:storyStartEndDates.endDate});
  }

  closeTaskCreatorHandler(argument)
  {
    this.setState({showTaskCreator:false});
  }

  trackNameChangehandler(argument)
  {
    var tasks = this.state.tasks;
    for (var i = 0; i < tasks.length; i++)
    {
      tasks[i].track = argument.tracks[tasks[i].trackIndex];
    }
    this.setState({tracks:argument.tracks, tasks:tasks});
  }

  checkIfSame()
  {
    var state = cloneDeep(this.state);
    delete state.lastState;
    delete state.taskCreatorPayload;

    return isEqual(state, this.state.lastState);
  }

  onClose = event =>
  {
    console.log( this.checkIfSame() );
    this.props.handler({showStoryMaker:false});
  };

  addTrack = event =>
  {
    var tracks = this.state.tracks;
    tracks.push('Track #' + (tracks.length + 1).toString());
    this.setState({tracks:tracks});
  };

  saveStory = event =>
  {
    var state = cloneDeep(this.state);
    delete state.taskCreatorPayload;
    if (typeof state.storyID === 'undefined')
    {
      state['storyID'] = new Date().getTime();
      this.props.addStoryHandler(state);
    }
    else if ( !this.checkIfSame() ) this.props.editStoryHandler(state);

    this.props.handler({showStoryMaker:false});
  };


  deleteStory = event =>
  {
    this.props.deleteStoryHandler({project:this.state.project, storyID:this.state.storyID});
    this.props.handler({showStoryMaker:false});
  };

  onStoryNameChange = event =>
  {
    var tasks = this.state.tasks;

    for (var i = 0; i < tasks.length; i++)
    {
      tasks[i].story = event.target.value;
    }

    this.setState({storyName:event.target.value, tasks:tasks});
  };

  render()
  {
    const { classes } = this.props;

    const getOrdinal = (number) => {
      let selector;

      if (number <= 0) {
        selector = 4;
      } else if ((number > 3 && number < 21) || number % 10 > 3) {
        selector = 0;
      } else {
        selector = number % 10;
      }

      return number + ['th', 'st', 'nd', 'rd', ''][selector];
    };

    function getMonday(d)
    {
      d = new Date(d);
      var day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
      var firstDay = new Date(d.setDate(diff));
      // return firstDay.getDate() + '-' + (firstDay.getMonth()+1) + '-' + firstDay.getFullYear();
      return firstDay;
    }

    var startDate = new Date(parseInt(this.props.payload.startDate.split('-')[2]), parseInt(this.props.payload.startDate.split('-')[1])-1, parseInt(this.props.payload.startDate.split('-')[0]));
    var days = 14;
    if (this.state.tasks.length > 0)
    {
      startDate = getMonday(this.state.startDate);
      days = (new Date(this.state.endDate) - startDate)/(1000 * 60 * 60 * 24) + 5;
    }

    var formattedStartDate = startDate.toLocaleString('en-us', {weekday:'short'}) + ', ' + getOrdinal(startDate.getDate()) + ' ' + startDate.toLocaleString('en-us', {month:'short'});



    var dateArray = ['', startDate.getDate() + '-' + (startDate.getMonth()+1) + '-' + startDate.getFullYear()];
    var formattedDateArray = ['Tracks', formattedStartDate];
    for (var dayCounter = 1; dayCounter <= days; dayCounter++)
    {
      var currentDay = new Date(parseInt(dateArray[dayCounter].split('-')[2]),parseInt(dateArray[dayCounter].split('-')[1])-1,parseInt(dateArray[dayCounter].split('-')[0]));
      var nextDay = new Date(currentDay);
      nextDay.setDate(currentDay.getDate() + 1);
      dateArray.push(nextDay.getDate() + '-' + (nextDay.getMonth()+1) + '-' + nextDay.getFullYear());
      formattedDateArray.push(nextDay.toLocaleString('en-us', {weekday:'short'}) + ', ' + getOrdinal(nextDay.getDate()) + ' ' + nextDay.toLocaleString('en-us', {month:'short'}));
    }

    var taskCellDetails = [];

    for (var task of this.state.tasks)
    {
      var taskStart = new Date(task['startDate']);
      var taskStart = taskStart.getDate() + '-' + (taskStart.getMonth()+1) + '-' + taskStart.getFullYear();
      var taskStart = dateArray.indexOf(taskStart);

      var taskEnd = new Date(task['endDate']);
      var taskEnd = taskEnd.getDate() + '-' + (taskEnd.getMonth()+1) + '-' + taskEnd.getFullYear();
      var taskEnd = dateArray.indexOf(taskEnd);

      taskCellDetails.push({taskStart:taskStart,
                            taskEnd:taskEnd,
                            taskID:task['taskID'],
                            taskName:task['taskName'],
                            days:task['days'],
                            trackIndex:task['trackIndex'],
                            taskColor:task['taskColor']});
    }


    var defaultTaskCellStyle = {background: '#444444',
                                width: '12em',
                                color: '#EEEDE7',
                                clickable:true};

    var defaultTaskCellData = {text:'', cellType:'task-cell', tracks:this.state.tracks, trackIndex:'', date:''};
    var taskGrid = [];

    for (var rowCounter = 0; rowCounter <= this.state.tracks.length; rowCounter++)
    {
      var dataArray = [];
      var styleArray = [];

      for (var columnCounter = 0; columnCounter < dateArray.length; columnCounter++)
      {
        var customTaskCellStyle = cloneDeep(defaultTaskCellStyle);
        var customTaskCellData = cloneDeep(defaultTaskCellData);

        if (columnCounter === 0)
        {
          customTaskCellStyle['clickable'] = false;
          customTaskCellStyle['width'] = '20em';
          customTaskCellStyle['background'] = '#167D7F';
          customTaskCellData['cellType'] = 'track-cell';
          customTaskCellData['text'] = this.state.tracks[rowCounter-1];
        }

        if (rowCounter === 0)
        {
          customTaskCellData['text'] = formattedDateArray[columnCounter];
          customTaskCellStyle['clickable'] = false;
          customTaskCellData['cellType'] = 'date-cell';
          if (formattedDateArray[columnCounter].includes('Sat') || formattedDateArray[columnCounter].includes('Sun')) customTaskCellStyle['background'] = '#757575';
        }

        if (rowCounter === 0 && columnCounter === 0)
        {
          customTaskCellData['text'] = 'Tracks';
          customTaskCellData['cellType'] = '';
        }

        if (columnCounter > 0)
        {
          customTaskCellData['date'] = dateArray[columnCounter];
        }

        customTaskCellData['trackIndex'] = rowCounter-1;

        for (var task of taskCellDetails)
        {
          if (rowCounter - 1 === task['trackIndex'] && columnCounter === task['taskStart'])
          {
            customTaskCellData['text'] = task['taskName'];
            customTaskCellData['cellType'] = 'filled-cell';
            customTaskCellData['taskID'] = task['taskID'];
            var newWidth = 12 * ((task['taskEnd'] - task['taskStart']) + 1);
            customTaskCellStyle['width'] = newWidth.toString() + 'em';
            customTaskCellStyle['background'] = `rgba(${ task.taskColor.r }, ${ task.taskColor.g }, ${ task.taskColor.b }, ${ task.taskColor.a })`;
          }
        }

        styleArray.push(customTaskCellStyle);
        dataArray.push(customTaskCellData);
      }

      var dropIndices = [];
      for (var task of taskCellDetails)
      {
        if (rowCounter - 1 === task['trackIndex'])
        {
          for (var i = task['taskStart'] + 1; i <= task['taskEnd']; i++)
          {
            dropIndices.push(i);
          }
        }
      }

      dataArray = dataArray.filter(function(value, index)
      {
        return dropIndices.indexOf(index) == -1;
      });

      styleArray = styleArray.filter(function(value, index)
      {
        return dropIndices.indexOf(index) == -1;
      });

      taskGrid.push(<TrackRow deleteTrackHandler={this.deleteTrackHandler} data={dataArray} style={styleArray} handler={this.taskCellClickhandler} trackNameChangehandler={this.trackNameChangehandler}/>)
    }

    var taskCreator = null;

    if (this.state.showTaskCreator)
    {
      taskCreator = <TaskCreator project={this.props.payload.project} storyName={this.state.storyName} payload={this.state.taskCreatorPayload} handler={this.closeTaskCreatorHandler} deleteTaskHandler={this.deleteTaskHandler} editTaskHandler={this.editTaskHandler} addTaskHandler={this.addTaskHandler} tracks={this.state.tracks} teamMembers={this.props.teamMembers}/>;
    }


    var headerText = 'Create a Story in ' + this.props.payload.project + ':';
    var deleteStoryButton = null;
    var saveButtonText = 'Save Story'
    if (typeof this.state.storyID !== 'undefined')
    {
      headerText = 'Edit Story:';
      deleteStoryButton = (<Button onClick={this.deleteStory} variant="contained" color="secondary"style={{borderRadius: '0.7em', color:'#EEEDE7', backgroundColor: "#D32F2F", padding: "0.8em 1.2em"}}><i className="fas fa-trash-alt fa-lg"></i>&nbsp;&nbsp;&nbsp;Delete Story</Button>);
      saveButtonText = 'Save Changes';
    }

    var saveButton = null;
    if (this.state.tasks.length > 0)
    {
      saveButton = (<Button onClick={this.saveStory} variant="contained" color="secondary"style={{borderRadius: '0.7em', color:'#EEEDE7', backgroundColor: "#167D7F", padding: "0.8em 1.2em"}}><i className="fas fa-save fa-lg"></i>&nbsp;&nbsp;&nbsp;{saveButtonText}</Button>);
    }


    return (
      <>
        <div className='story-maker-layout'>
          <div className='story-container'>
            <div className='header-element'>
              <div className='header-text-container'>
                {headerText}
                &nbsp;&nbsp;&nbsp;<TextField InputProps={{className: classes.input}} onChange={this.onStoryNameChange} defaultValue={this.state.storyName} className={classes.root} label="Story Name"/>
                &nbsp;&nbsp;&nbsp;<Button onClick={this.addTrack} variant="contained" color="secondary"style={{borderRadius: '0.7em', color:'#EEEDE7', backgroundColor: "#167D7F", padding: "0.8em 1.2em"}}><i className="fas fa-plus-square fa-lg"></i>&nbsp;&nbsp;&nbsp;Add New Track</Button>
                &nbsp;&nbsp;&nbsp;{saveButton}
                &nbsp;&nbsp;&nbsp;{deleteStoryButton}
              </div>
              <div className='close-button-container'>
                <i onClick={this.onClose} className="fas fa-2x fa-times close-button"></i>
              </div>
            </div>

            <div className='timeline-container'>
              {taskGrid}
            </div>
          </div>
        </div>
        {taskCreator}
      </>
    );
  }
}

export default withStyles(styles)(StoryMaker);
