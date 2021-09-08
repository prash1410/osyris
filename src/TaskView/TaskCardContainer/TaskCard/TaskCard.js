import React from 'react';
import './TaskCard.css';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Button } from "@material-ui/core";
import Ripples from 'react-ripples'
import cloneDeep from 'lodash/cloneDeep';


class TaskCard extends React.Component
{
  constructor(props)
  {
    var progressColors = ['#00b74a', '#71bb3f', '#a3bd41', '#ccbe50', '#ecc068', '#f3a552', '#f88547', '#fb6149', '#f93154', '#f93154'];
    progressColors.reverse();
    super(props);
    this.state = {daysLeftColors:['#ffa600', '#d2b000', '#a1b600', '#6bb823', '#00b74a'],
                  progressColors:progressColors,
                  menuAnchorElement:null,
                  showMenu:false};


    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.taskInProgress = this.taskInProgress.bind(this);
    this.taskNotStarted = this.taskNotStarted.bind(this);
    this.taskCompleted = this.taskCompleted.bind(this);
    this.onTaskClick = this.onTaskClick.bind(this);
    this.taskDeleted = this.taskDeleted.bind(this);
  }

  showMenu(event)
  {
    this.setState({menuAnchorElement: event.currentTarget,
                   showMenu: !this.state.showMenu});
  }

  closeMenu(event)
  {
    this.setState({menuAnchorElement: null,
                   showMenu: !this.state.showMenu});
  }

  taskInProgress(event)
  {
    var task = cloneDeep(this.props.task.taskData);

    var assignedColorArray = task.taskStatusColorsAssigned;
    assignedColorArray[task.taskStatus] = '';
    assignedColorArray['In Progress'] = task.taskStatusColors['In Progress'];

    task.taskStatusColorsAssigned = assignedColorArray;
    task.progressColor = task.taskStatusColors['In Progress'];
    task.progressSliderDisabled = '';

    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (task.taskStatus === 'Not Started')
    {
      task.taskProgress = 10;
      task.actualStartDate = today;
    }
    else task.taskProgress = 90;
    task.taskStatus = 'In Progress';

    task.actualEndDate = null;

    var payload = {};
    payload['taskState'] = cloneDeep(task);
    payload['project'] = this.props.task.taskMetadata.project;

    this.props.editTaskHandler(payload);
  }

  taskCompleted(event)
  {
    var task = cloneDeep(this.props.task.taskData);

    var assignedColorArray = task.taskStatusColorsAssigned;
    assignedColorArray[task.taskStatus] = '';
    assignedColorArray['Completed'] = task.taskStatusColors['Completed'];

    task.taskStatusColorsAssigned = assignedColorArray;
    task.progressColor = task.taskStatusColors['Completed'];
    task.progressSliderDisabled = '';

    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (task.taskStatus === 'Not Started') task.actualStartDate = today;
    task.taskProgress = 100;
    task.taskStatus = 'Completed';
    task.actualEndDate = today;

    var payload = {};
    payload['taskState'] = cloneDeep(task);
    payload['project'] = this.props.task.taskMetadata.project;

    this.props.editTaskHandler(payload);
  }

  taskNotStarted(event)
  {
    var task = cloneDeep(this.props.task.taskData);

    var assignedColorArray = task.taskStatusColorsAssigned;
    assignedColorArray[task.taskStatus] = '';
    assignedColorArray['Not Started'] = task.taskStatusColors['Not Started'];

    task.taskStatusColorsAssigned = assignedColorArray;
    task.progressColor = task.taskStatusColors['Not Started'];
    task.progressSliderDisabled = 'disabled';

    task.taskProgress = 0;
    task.taskStatus = 'Not Started';
    task.actualEndDate = null;
    task.actualStartDate = null;

    var payload = {};
    payload['taskState'] = cloneDeep(task);
    payload['project'] = this.props.task.taskMetadata.project;

    this.props.editTaskHandler(payload);
  }

  taskDeleted(event)
  {
    var payload = {};
    payload['taskID'] = this.props.task.taskData.taskID;
    payload['project'] = this.props.task.taskMetadata.project;

    this.props.deleteTaskHandler(payload);
  }

  onTaskClick(event)
  {
    if (this.state.showMenu)
    {
      this.setState({menuAnchorElement: null,
                     showMenu: !this.state.showMenu});
    }
    else
    {
      this.props.taskClickHandler(this.props.task);
    }
  }

  render()
  {
    var card = null;
    if (this.props.task.taskData.taskStatus === 'Not Started')
    {
      var startDate = new Date(this.props.task.taskData.startDate);
      var endDate = new Date(this.props.task.taskData.endDate);

      var dueDateText = '';
      var dueDateTextColor = '#F93154';
      var today = new Date();
      today = new Date(today.toDateString());
      var dueDays = Math.round((startDate - today)/ (1000 * 60 * 60 * 24));

      if (dueDays > 1) dueDateText = 'Task starts in ' + dueDays.toString() + ' days';
      else if (dueDays === 1) dueDateText = 'Task starts tomorrow';
      else if (dueDays === 0) dueDateText = 'Task starts today';
      else if (dueDays === -1) dueDateText = 'Task overdue by 1 day' ;
      else if (dueDays < -1) dueDateText = 'Task overdue by ' + Math.abs(dueDays).toString() + ' days';

      if (dueDays >= 0)
      {
        if (dueDays > 4) dueDateTextColor = this.state.daysLeftColors[4];
        else dueDateTextColor = this.state.daysLeftColors[dueDays];
      }


      var formattedStartDate = startDate.getDate() + '-' + (startDate.toLocaleString('en-us', {month:'short'})) + '-' + startDate.getFullYear().toString().substr(-2);
      var formattedEndDate = endDate.getDate() + '-' + (endDate.toLocaleString('en-us', {month:'short'})) + '-' + endDate.getFullYear().toString().substr(-2);

      card = (
              <div onClick={this.onTaskClick} className='task-card'>
                <div className='task-contents-container'>
                  <div style={{background:this.props.task.taskMetadata.projectColor}} className='project-story-name-container'>
                    <div className='project-story-name'>
                      &nbsp;&nbsp;<strong>{this.props.task.taskMetadata.project}</strong>&nbsp;:&nbsp;{this.props.task.taskData.story}&nbsp;-&nbsp;{this.props.task.taskData.track}
                    </div>
                      <Ripples color="rgba(256,256,256,0.3)" during={1800}>
                        <div className='task-menu-button' onClick={this.showMenu}>
                          <i className="fas fa-ellipsis-v"></i>
                        </div>
                      </Ripples>
                  </div>

                  <Menu id="fade-menu" anchorEl={this.state.menuAnchorElement} open={this.state.showMenu} onClose={this.closeMenu} keepMounted>
                      <MenuItem onClick={this.taskInProgress}><span className='in-progress-menu-item'><i className="far fa-clock"></i>&nbsp;&nbsp;In Progress</span></MenuItem>
                      <MenuItem onClick={this.taskCompleted}><span className='completed-menu-item'><i className="far fa-check-circle"></i>&nbsp;&nbsp;Completed</span></MenuItem>
                      <MenuItem onClick={this.taskDeleted}><span className='delete-menu-item'><i className="fas fa-trash-alt"></i>&nbsp;&nbsp;Delete Task</span></MenuItem>
                  </Menu>

                  <div className='task-name-container'>
                    {this.props.task.taskData.taskName}
                  </div>
                  <div className='task-dates-container'>
                    <div className='task-dates'>
                      <span style={{marginBottom:'0.4em'}}>&nbsp;&nbsp;&nbsp;<i className="far fa-calendar-plus"></i>&nbsp;&nbsp;&nbsp;Start Date: &nbsp;{formattedStartDate}</span>
                      <span>&nbsp;&nbsp;&nbsp;<i className="far fa-calendar-check"></i>&nbsp;&nbsp;&nbsp;End Date: &nbsp;{formattedEndDate}</span>
                    </div>
                    <div className='task-dates-metadata'>
                      <span style={{marginBottom:'0.6em', color:dueDateTextColor}}>{dueDateText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <span>Task duration: {this.props.task.taskData.days} days&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    </div>
                  </div>
                </div>
              </div>
            )
    }
    else if (this.props.task.taskData.taskStatus === 'In Progress')
    {
      var startDate = new Date(this.props.task.taskData.startDate);
      var endDate = new Date(this.props.task.taskData.endDate);

      var progressColors = cloneDeep(this.state.progressColors);

      var progressText = 'Task progress: ' + this.props.task.taskData.taskProgress.toString() + '%';
      var progressIndex = parseInt(Math.floor(this.props.task.taskData.taskProgress/10));
      var progressTextColor = progressColors[progressIndex];
      //progressTextColor = 'black';

      var daysElapsed = 0;
      var today = new Date();
      today = new Date(today.toDateString());

      if (today.valueOf() <= startDate.valueOf())
      {
        //console.log('today less than equal to start date');
        daysElapsed = 0;
      }
      else if ( today.valueOf() > endDate.valueOf() )
      {
        //console.log('today greater than end date');
        daysElapsed = this.props.task.taskData.days;
      }
      else if (today.valueOf() > startDate.valueOf() && today.valueOf() <= endDate.valueOf())
      {
        var iterativeDate = new Date(startDate.toDateString());
        //console.log('today greater than start date and lesser than end date');

        while (iterativeDate.valueOf() < endDate.valueOf() && iterativeDate.valueOf() < today.valueOf())
        {
          if (!this.props.task.taskData.weekendsAsWorkdays)
          {
            if(iterativeDate.getDay() !== 0 && iterativeDate.getDay() !== 6) daysElapsed += 1;
          }
          else daysElapsed += 1;
          //console.log(iterativeDate);
          iterativeDate.setDate(iterativeDate.getDate() + 1);
        }
      }

      /*
      console.log('Start date', startDate);
      console.log('End date', endDate);
      console.log('Today', today);
      console.log('iterativeDate', iterativeDate);
      console.log('------------------------------');
      */

      var daysElapsedText = 'Days elapsed: ' + daysElapsed.toString() + '/' + this.props.task.taskData.days.toString() + ' days';
      var daysElapsedTextColorIndex = Math.floor((daysElapsed/parseInt(this.props.task.taskData.days))*10);
      if (daysElapsedTextColorIndex === 10) daysElapsedTextColorIndex = 9;

      progressColors.reverse();
      var daysElapsedTextColor = progressColors[daysElapsedTextColorIndex];

      var formattedStartDate = startDate.getDate() + '-' + (startDate.toLocaleString('en-us', {month:'short'})) + '-' + startDate.getFullYear().toString().substr(-2);
      var formattedEndDate = endDate.getDate() + '-' + (endDate.toLocaleString('en-us', {month:'short'})) + '-' + endDate.getFullYear().toString().substr(-2);

      card = (<div onClick={this.onTaskClick} className='task-card'>
                <div className='task-contents-container'>
                  <div style={{background:this.props.task.taskMetadata.projectColor}} className='project-story-name-container'>
                    <div className='project-story-name'>
                      &nbsp;&nbsp;<strong>{this.props.task.taskMetadata.project}</strong>&nbsp;:&nbsp;{this.props.task.taskData.story}&nbsp;-&nbsp;{this.props.task.taskData.track}
                    </div>
                    <Ripples color="rgba(256,256,256,0.3)" during={1800}>
                      <div className='task-menu-button' onClick={this.showMenu}>
                        <i className="fas fa-ellipsis-v"></i>
                      </div>
                    </Ripples>
                  </div>
                  <Menu id="fade-menu" anchorEl={this.state.menuAnchorElement} open={this.state.showMenu} onClose={this.closeMenu} keepMounted>
                      <MenuItem onClick={this.taskCompleted}><span className='completed-menu-item'><i className="far fa-check-circle"></i>&nbsp;&nbsp;Completed</span></MenuItem>
                      <MenuItem onClick={this.taskNotStarted}><span className='not-started-menu-item'><i className="far fa-times-circle"></i>&nbsp;&nbsp;Not Started</span></MenuItem>
                      <MenuItem onClick={this.taskDeleted}><span className='delete-menu-item'><i className="fas fa-trash-alt"></i>&nbsp;&nbsp;Delete Task</span></MenuItem>
                  </Menu>
                  <div className='task-name-container'>
                    {this.props.task.taskData.taskName}
                  </div>
                  <div className='task-dates-container'>
                    <div className='task-dates'>
                      <span style={{marginBottom:'0.4em'}}>&nbsp;&nbsp;&nbsp;<i className="far fa-calendar-plus"></i>&nbsp;&nbsp;&nbsp;Start Date: &nbsp;{formattedStartDate}</span>
                      <span>&nbsp;&nbsp;&nbsp;<i className="far fa-calendar-check"></i>&nbsp;&nbsp;&nbsp;End Date: &nbsp;{formattedEndDate}</span>
                    </div>
                    <div className='task-dates-metadata'>
                      <span style={{marginBottom:'0.6em', color:progressTextColor}}>{progressText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <span style={{color:daysElapsedTextColor}}>{daysElapsedText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    </div>
                  </div>
                </div>
              </div>)
    }
    if (this.props.task.taskData.taskStatus === 'Completed')
    {
      var startDate = new Date(this.props.task.taskData.startDate);
      var endDate = new Date(this.props.task.taskData.endDate);
      var completedDate = new Date(this.props.task.taskData.actualEndDate);
      completedDate = new Date(completedDate.toString());

      var completedTextColor = '#f93154';
      var completedDateText = 'Task completed on: ' + completedDate.getDate() + '-' + (completedDate.toLocaleString('en-us', {month:'short'})) + '-' + completedDate.getFullYear().toString().substr(-2);
      var completedText = '';
      if (completedDate.valueOf() < startDate.valueOf())
      {
        completedTextColor = '#00b74a';
        completedText = 'Completed before expected start date!'
      }
      else if (completedDate.valueOf() === startDate.valueOf())
      {
        completedTextColor = '#00b74a';
        completedText = 'Completed on expected start date!'
      }
      else if (completedDate.valueOf() > startDate.valueOf())
      {
        var daysToCompletion = 0;
        var iterativeDate = new Date(startDate.toDateString());
        while (iterativeDate.valueOf() <= completedDate.valueOf())
        {
          if (!this.props.task.taskData.weekendsAsWorkdays)
          {
            if(iterativeDate.getDay() !== 0 && iterativeDate.getDay() !== 6) daysToCompletion += 1;
          }
          else daysToCompletion += 1;
          iterativeDate.setDate(iterativeDate.getDate() + 1);
        }
        if (daysToCompletion <= parseInt(this.props.task.taskData.days)) completedTextColor = '#00b74a';
        completedText = 'Completed in ' + daysToCompletion.toString() + '/' + this.props.task.taskData.days.toString() + ' days';
      }


      var formattedStartDate = startDate.getDate() + '-' + (startDate.toLocaleString('en-us', {month:'short'})) + '-' + startDate.getFullYear().toString().substr(-2);
      var formattedEndDate = endDate.getDate() + '-' + (endDate.toLocaleString('en-us', {month:'short'})) + '-' + endDate.getFullYear().toString().substr(-2);

      card = (<div onClick={this.onTaskClick} className='task-card'>
                <div className='task-contents-container'>
                  <div style={{background:this.props.task.taskMetadata.projectColor}} className='project-story-name-container'>
                    <div className='project-story-name'>
                      &nbsp;&nbsp;<strong>{this.props.task.taskMetadata.project}</strong>&nbsp;:&nbsp;{this.props.task.taskData.story}&nbsp;-&nbsp;{this.props.task.taskData.track}
                    </div>
                    <Ripples color="rgba(256,256,256,0.3)" during={1800}>
                      <div className='task-menu-button' onClick={this.showMenu}>
                        <i className="fas fa-ellipsis-v"></i>
                      </div>
                    </Ripples>
                  </div>
                  <Menu id="fade-menu" anchorEl={this.state.menuAnchorElement} open={this.state.showMenu} onClose={this.closeMenu} keepMounted>
                      <MenuItem onClick={this.taskInProgress}><span className='in-progress-menu-item'><i className="far fa-clock"></i>&nbsp;&nbsp;In Progress</span></MenuItem>
                      <MenuItem onClick={this.taskNotStarted}><span className='not-started-menu-item'><i className="far fa-times-circle"></i>&nbsp;&nbsp;Not Started</span></MenuItem>
                      <MenuItem onClick={this.taskDeleted}><span className='delete-menu-item'><i className="fas fa-trash-alt"></i>&nbsp;&nbsp;Delete Task</span></MenuItem>
                  </Menu>
                  <div className='task-name-container'>
                    {this.props.task.taskData.taskName}
                  </div>
                  <div className='task-dates-container'>
                    <div className='task-dates'>
                      <span style={{marginBottom:'0.4em'}}>&nbsp;&nbsp;&nbsp;<i className="far fa-calendar-plus"></i>&nbsp;&nbsp;&nbsp;Start Date: &nbsp;{formattedStartDate}</span>
                      <span>&nbsp;&nbsp;&nbsp;<i className="far fa-calendar-check"></i>&nbsp;&nbsp;&nbsp;End Date: &nbsp;{formattedEndDate}</span>
                    </div>

                    <div style={{color:completedTextColor}} className='task-dates-metadata'>
                      <span style={{marginBottom:'0.6em'}}>{completedDateText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <span>{completedText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    </div>
                  </div>
                </div>
              </div>)
    }


    return (
      <>{card}</>
    );
  }

}

export default TaskCard;
