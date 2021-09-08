import React from 'react';
import './ManagementView.css';

import cloneDeep from 'lodash/cloneDeep';

import TeamManagementRow from './TeamManagementRow/TeamManagementRow.js';
import LeaveCard from './LeaveCard/LeaveCard.js';
import HolidayCard from './HolidayCard/HolidayCard.js';
import { SketchPicker } from 'react-color';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import TextField from '@material-ui/core/TextField';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const styles = theme => ({
  input: {
    color: "#616161",
    fontSize: '1.5em'
  },
  formLabel: {
    '&.Mui-focused': {
      color: '#616161'
    }
  },
  radio: {
    '&$checked': {
      color: '#4B8DF8'
    }
  },
  select: {
        '&:after': {
            borderColor: '#616161'
        }
    },
  root: {
      '& label.Mui-focused': {
        color: 'gray',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: 'purple',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'white',
        },
        '&:hover fieldset': {
          borderColor: 'white',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'white',
        }
      },
    },
});


class ManagementView extends React.Component
{
  constructor(props)
  {
    super(props);

    const hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
               ,(m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1).match(/.{2}/g)
      .map(x => parseInt(x, 16));

    var projectsArray = [];
    var projectsColorArray = [];
    var storiesCountArray = [];
    for (var [key, value] of Object.entries(this.props.projects))
    {
      var project = key;
      var projectColor = hexToRgb(value.color);
      projectColor = {r:projectColor[0], g:projectColor[1], b:projectColor[2], a:1};

      var storiesCount = 0;
      if (value.stories !== undefined) storiesCount = value.stories.length;
      projectsArray.push(project);
      projectsColorArray.push(projectColor);
      storiesCountArray.push(storiesCount)
    }

    var teamMembersArray = [];
    var teamMembersColorArray = [];
    for (var [key, value] of Object.entries(this.props.teamMembers))
    {
      var teamMember = key;
      var teamMemberColor = hexToRgb(value.color);
      teamMemberColor = {r:teamMemberColor[0], g:teamMemberColor[1], b:teamMemberColor[2], a:1};

      teamMembersArray.push(teamMember);
      teamMembersColorArray.push(teamMemberColor);
    }

    var leaves = cloneDeep(this.props.leaves);
    var holidays = cloneDeep(this.props.holidays);

    this.defaultColor = {r: '241', g: '112', b: '19', a: '1'};
    this.defaultHexColor = '#f17013';
    this.state = {teams:[],
                  clickedRowType:null,
                  clickedRowIndex:null,
                  teamMembersArray:teamMembersArray,
                  teamMembersColorArray:teamMembersColorArray,
                  projectsArray:projectsArray,
                  projectsColorArray:projectsColorArray,
                  lastPickedHexColor:null,
                  lastPickedRGBColor:null,
                  teamName:'',
                  teamPasskey:'',
                  showBackdrop: false,
                  clickedEntity:null,
                  newLeaveDetails:{startDate:new Date(),
                                   endDate:new Date(),
                                   days:1,
                                   teamMember:null,
                                   leaveType:'Casual'},
                 newHolidayDetails:{startDate:new Date(),
                                    endDate:new Date(),
                                    days:1,
                                    holiday:''},
                  newTeamMember:'',
                  newProject:'',
                  teamMemberToBeRemoved:null,
                  projectToBeRemoved:null,
                  oldName:'',
                  newName:'',
                  oldProjectName:'',
                  newProjectName:'',
                  leaves:leaves,
                  holidays:holidays,
                  showErrorSnackbar:false,
                  errorMessage:''};

    this.editTeamMemberName = this.editTeamMemberName.bind(this);
    this.removeTeamMember = this.removeTeamMember.bind(this);
    this.editProjectName = this.editProjectName.bind(this);
    this.removeProject = this.removeProject.bind(this);
    this.showHideRowColorPicker = this.showHideRowColorPicker.bind(this);
    this.deleteLeave = this.deleteLeave.bind(this);
    this.deleteHoliday = this.deleteHoliday.bind(this);
    this.changeTeamMemberName = this.changeTeamMemberName.bind(this);
  }

  onColorPick = (color) =>
  {
    if (this.state.clickedRowType === 'Team Member')
    {
      var teamMembersColorArray = this.state.teamMembersColorArray;
      teamMembersColorArray[this.state.clickedRowIndex] = color.rgb;
      this.setState({ teamMembersColorArray: teamMembersColorArray, lastPickedHexColor:color.hex, lastPickedRGBColor:color.rgb });
    }
    else
    {
      var projectsColorArray = this.state.projectsColorArray;
      projectsColorArray[this.state.clickedRowIndex] = color.rgb;
      this.setState({ projectsColorArray: projectsColorArray, lastPickedHexColor:color.hex, lastPickedRGBColor:color.rgb  });
    }
  };

  dismissColorPicker = (event) =>
  {
    if (this.state.clickedRowType === 'Team Member')
    {
      var teamMembers = cloneDeep(this.props.teamMembers);
      var teamMember = this.state.teamMembersArray[this.state.clickedRowIndex];
      if (teamMembers[teamMember].color !== this.state.lastPickedHexColor)
      {
        teamMembers[teamMember].color = this.state.lastPickedHexColor;
        var projects = cloneDeep(this.props.projects)
        for (var [key, value] of Object.entries(projects))
        {
          if (value.stories !== undefined)
          {
            for (var story of value.stories)
            {
              for (var task of story.tasks)
              {
                if (task.assignee === teamMember && task.taskColorSwitch) task.taskColor = this.state.lastPickedRGBColor;
              }
            }
          }
        }

        this.props.editTeamHandler(teamMembers);
        this.props.editProjectsHandler(projects);
      }
    }
    else
    {
      var projects = cloneDeep(this.props.projects);
      var project = this.state.projectsArray[this.state.clickedRowIndex];
      if (projects[project].color !== this.state.lastPickedHexColor)
      {
        projects[project].color = this.state.lastPickedHexColor;
        this.props.editProjectsHandler(projects);
      }
    }
    this.setState({showBackdrop:false, clickedEntity:null});
  }

  addLeave = event =>
  {
    this.setState({showBackdrop:true, clickedEntity:'Add Leave'});
  };

  hideBackdrop = event =>
  {
    this.setState({showBackdrop:false, clickedEntity:null});
  };

  editTeamMemberName(argument)
  {
    var teamMembersArray = this.state.teamMembersArray;
    teamMembersArray[argument.index] = argument.value;
    this.setState({teamMembersArray:teamMembersArray});
  }

  showHideRowColorPicker(argument)
  {
    this.setState({showBackdrop:!this.state.showBackdrop, clickedRowType:argument.type, clickedRowIndex:argument.index, clickedEntity:'Color Picker'});
  }

  removeTeamMember(argument)
  {
    this.setState({showBackdrop:!this.state.showBackdrop, clickedEntity:'Remove Team Member', teamMemberToBeRemoved:this.state.teamMembersArray[argument]});
  };

  confirmRemoveTeamMember = event =>
  {
    var teamMembers = cloneDeep(this.props.teamMembers);
    delete teamMembers[this.state.teamMemberToBeRemoved];

    var teamMembersArray = this.state.teamMembersArray;
    var teamMemberIndex = teamMembersArray.indexOf(this.state.teamMemberToBeRemoved);
    teamMembersArray.splice(teamMemberIndex, 1);
    var teamMembersColorArray = this.state.teamMembersColorArray;
    teamMembersColorArray.splice(teamMemberIndex, 1);

    this.props.editTeamHandler(teamMembers);
    this.setState({teamMembersArray:teamMembersArray, teamMembersColorArray: teamMembersColorArray, showBackdrop:false, clickedEntity:null, teamMemberToBeRemoved:null});
  };

  cancelRemoveTeamMember = event =>
  {
    this.setState({showBackdrop:false, clickedEntity:null, teamMemberToBeRemoved:null});
  };

  changeTeamMemberName(argument)
  {
    this.setState({showBackdrop:!this.state.showBackdrop, clickedEntity:'Change Team Member', oldName:argument.oldName});
  };

  cancelChangeTeamMemberName = event =>
  {
    this.setState({showBackdrop:!this.state.showBackdrop, clickedEntity:null, oldName:'', newName:''});
  };

  confirmRenameTeamMember = event =>
  {
    var newTeamMemberName = this.state.newName;
    var validName = true;
    var errorMessage = ''
    if (!/^[a-zA-Z ]{3,30}$/.test(newTeamMemberName.toUpperCase().trim()))
    {
      errorMessage = 'Team member name length cannot be lesser than 3 or greater than 30 characters or contain any special characters';
      validName = false;
    }
    else
    {
      for (var teamMember of this.state.teamMembersArray)
      {
        if (newTeamMemberName.toUpperCase().trim() === teamMember.toUpperCase().trim())
        {
          errorMessage = 'Team members cannot have duplicate names';
          validName = false;
        }
      }
    }

    if (validName)
    {
      var teamMembersArray = this.state.teamMembersArray;
      var teamMemberIndex = teamMembersArray.indexOf(this.state.oldName);
      teamMembersArray[teamMemberIndex] = this.state.newName;

      var teamMembers = cloneDeep(this.props.teamMembers);
      delete Object.assign(teamMembers, {[this.state.newName]: teamMembers[this.state.oldName] })[this.state.oldName];

      var projects = cloneDeep(this.props.projects)
      for (var [key, value] of Object.entries(projects))
      {
        if (value.stories !== undefined)
        {
          for (var story of value.stories)
          {
            for (var task of story.tasks)
            {
              if (task.assignee === this.state.oldName) task.assignee = this.state.newName;
            }
          }
        }
      }

      this.setState({teamMembersArray:teamMembersArray, showBackdrop:false, clickedEntity:null, oldName:'', newName:''});
      this.props.editTeamHandler(teamMembers);
      this.props.editProjectsHandler(projects);
    }
    else
    {
      this.setState({showErrorSnackbar:true, errorMessage:errorMessage});
    }
  };

  onNewNameChanged = event =>
  {
    this.setState({newName:event.target.value});
  }

  addTeamMember = event =>
  {
    this.setState({showBackdrop:true, clickedEntity:'Add Team Member'});
  };

  cancelAddTeamMember = event =>
  {
    this.setState({showBackdrop:false, clickedEntity:null, newTeamMember:''});
  };

  saveNewTeamMember = event =>
  {
    var newTeamMemberName = this.state.newTeamMember;
    var validName = true;
    var errorMessage = ''
    if (!/^[a-zA-Z ]{3,30}$/.test(newTeamMemberName.toUpperCase().trim()))
    {
      errorMessage = 'Team member name length cannot be lesser than 3 or greater than 30 characters or contain any special characters';
      validName = false;
    }
    else
    {
      for (var teamMember of this.state.teamMembersArray)
      {
        if (newTeamMemberName.toUpperCase().trim() === teamMember.toUpperCase().trim())
        {
          errorMessage = 'Team members cannot have duplicate names';
          validName = false;
        }
      }
    }

    if (validName)
    {
      var teamMembersArray = this.state.teamMembersArray;
      teamMembersArray.push(newTeamMemberName);
      var teamMembersColorArray = this.state.teamMembersColorArray;
      teamMembersColorArray.push(this.defaultColor);

      var teamMembers = cloneDeep(this.props.teamMembers);
      teamMembers[newTeamMemberName] = {color:this.defaultHexColor};

      this.setState({teamMembersArray:teamMembersArray, teamMembersColorArray: teamMembersColorArray, showBackdrop:false, clickedEntity:null, newTeamMember:''});
      this.props.editTeamHandler(teamMembers);
    }
    else
    {
      this.setState({showErrorSnackbar:true, errorMessage:errorMessage});
    }
  };

  onNewTeamMemberChanged = event =>
  {
    this.setState({newTeamMember:event.target.value});
  }

  addProject = event =>
  {
    this.setState({showBackdrop:true, clickedEntity:'Add Project'});
  };

  cancelAddProject = event =>
  {
    this.setState({showBackdrop:false, clickedEntity:null, newProject:''});
  };

  onNewProjectChanged = event =>
  {
    this.setState({newProject:event.target.value});
  };

  saveNewProject = event =>
  {
    var newProject = this.state.newProject;
    var validProject = true;
    var errorMessage = ''
    if (!/^[a-zA-Z ]{3,30}$/.test(newProject.toUpperCase().trim()))
    {
      errorMessage = 'Project name length cannot be lesser than 3 or greater than 30 characters or contain any special characters';
      validProject = false;
    }
    else
    {
      for (var project of this.state.projectsArray)
      {
        if (newProject.toUpperCase().trim() === project.toUpperCase().trim())
        {
          errorMessage = 'Projects cannot have duplicate names';
          validProject = false;
        }
      }
    }

    if (validProject)
    {
      var projectsArray = this.state.projectsArray;
      projectsArray.push(newProject);
      var projectsColorArray = this.state.projectsColorArray;
      projectsColorArray.push(this.defaultColor);

      var projects = cloneDeep(this.props.projects);
      projects[newProject] = {color:this.defaultHexColor};

      this.setState({projectsArray:projectsArray, projectsColorArray: projectsColorArray, showBackdrop:false, clickedEntity:null, newProject:''});
      this.props.editProjectsHandler(projects);
    }
    else
    {
      this.setState({showErrorSnackbar:true, errorMessage:errorMessage});
    }
  };

  removeProject(argument)
  {
    this.setState({showBackdrop:!this.state.showBackdrop, clickedEntity:'Remove Project', projectToBeRemoved:this.state.projectsArray[argument]});
  };

  confirmRemoveProject = event =>
  {
    var projects = cloneDeep(this.props.projects);
    delete projects[this.state.projectToBeRemoved];

    var projectsArray = this.state.projectsArray;
    var projectIndex = projectsArray.indexOf(this.state.projectToBeRemoved);
    projectsArray.splice(projectIndex, 1);
    var projectsColorArray = this.state.projectsColorArray;
    projectsColorArray.splice(projectIndex, 1);

    this.props.editProjectsHandler(projects);
    this.setState({projectsArray:projectsArray, projectsColorArray: projectsColorArray, showBackdrop:false, clickedEntity:null, projectToBeRemoved:null});
  };

  cancelRemoveProject = event =>
  {
    this.setState({showBackdrop:false, clickedEntity:null, projectToBeRemoved:null});
  };

  editProjectName(argument)
  {
    this.setState({showBackdrop:!this.state.showBackdrop, clickedEntity:'Change Project', oldProjectName:argument.oldName});
  };

  cancelChangeProjectName = event =>
  {
    this.setState({showBackdrop:!this.state.showBackdrop, clickedEntity:null, oldProjectName:'', newProjectName:''});
  };

  confirmRenameProject = event =>
  {
    var newProjectName = this.state.newProjectName;
    var validName = true;
    var errorMessage = ''
    if (!/^[a-zA-Z ]{3,30}$/.test(newProjectName.toUpperCase().trim()))
    {
      errorMessage = 'Project name length cannot be lesser than 3 or greater than 30 characters or contain any special characters';
      validName = false;
    }
    else
    {
      for (var project of this.state.projectsArray)
      {
        if (newProjectName.toUpperCase().trim() === project.toUpperCase().trim())
        {
          errorMessage = 'Projects cannot have duplicate names';
          validName = false;
        }
      }
    }

    if (validName)
    {
      var projectsArray = this.state.projectsArray;
      var projectIndex = projectsArray.indexOf(this.state.oldProjectName);
      projectsArray[projectIndex] = this.state.newProjectName;

      var projects = cloneDeep(this.props.projects);
      delete Object.assign(projects, {[this.state.newProjectName]: projects[this.state.oldProjectName] })[this.state.oldProjectName];

      for (var [key, value] of Object.entries(projects))
      {
        if (value.stories !== undefined)
        {
          for (var story of value.stories)
          {
            if (story.project === this.state.oldProjectName) story.project = this.state.newProjectName;
          }
        }
      }

      this.setState({projectsArray:projectsArray, showBackdrop:false, clickedEntity:null, oldProjectName:'', newProjectName:''});
      this.props.editProjectsHandler(projects);
    }
    else
    {
      this.setState({showErrorSnackbar:true, errorMessage:errorMessage});
    }
  };

  onNewProjectNameChanged = event =>
  {
    this.setState({newProjectName:event.target.value});
  }



  onTeamNameChanged = event =>
  {
    this.setState({teamName:event.target.value});
  };

  onLeaveTeamMemberChanged = event =>
  {
    var newLeaveDetails = cloneDeep(this.state.newLeaveDetails);
    newLeaveDetails.teamMember = event.target.value;
    this.setState({newLeaveDetails:newLeaveDetails});
  };

  onLeaveTypeChanged = event =>
  {
    var newLeaveDetails = cloneDeep(this.state.newLeaveDetails);
    newLeaveDetails.leaveType = event.target.value;
    this.setState({newLeaveDetails:newLeaveDetails});
  };

  onLeaveStartDateChanged = selectedDate =>
  {
    var newLeaveDetails = cloneDeep(this.state.newLeaveDetails);
    var selectedDay = selectedDate.getDay();
    if (selectedDay === 0)
    {
      var startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() + 1);
      var endDate = new Date(startDate);

      newLeaveDetails.startDate = startDate;
      newLeaveDetails.endDate = endDate;
      newLeaveDetails.days = 1;
    }
    else if (selectedDay === 6)
    {
      var startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 1);
      var endDate = new Date(startDate);

      newLeaveDetails.startDate = startDate;
      newLeaveDetails.endDate = endDate;
      newLeaveDetails.days = 1;
    }
    else
    {
      var endDate = new Date(selectedDate);
      for (var dayCounter = 0; dayCounter < (newLeaveDetails.days - 1); dayCounter++)
      {
        endDate.setDate(endDate.getDate() + 1);
        var currentDay = endDate.getDay();
        if (currentDay === 0 || currentDay === 6) dayCounter = dayCounter - 1;
      }
      newLeaveDetails.startDate = selectedDate;
      newLeaveDetails.endDate = endDate;
    }
    this.setState({newLeaveDetails:newLeaveDetails});
  };

  onLeaveEndDateChanged = selectedDate =>
  {
    var newLeaveDetails = cloneDeep(this.state.newLeaveDetails);
    var selectedDay = selectedDate.getDay();
    if (selectedDay === 0)
    {
      var startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() + 1);
      var endDate = new Date(startDate);

      newLeaveDetails.startDate = startDate;
      newLeaveDetails.endDate = endDate;
      newLeaveDetails.days = 1;
    }
    else if (selectedDay === 6)
    {
      var startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 1);
      var endDate = new Date(startDate);

      newLeaveDetails.startDate = startDate;
      newLeaveDetails.endDate = endDate;
      newLeaveDetails.days = 1;
    }
    else
    {
      var daysDifference = (new Date(selectedDate) - new Date(newLeaveDetails.startDate))/ (1000 * 60 * 60 * 24) + 1;

      if (daysDifference < 1)
      {
        newLeaveDetails.endDate = newLeaveDetails.startDate;
        newLeaveDetails.days = 1;
      }
      else
      {
          var weekendDaysCount = 0;
          var previousDate = new Date(selectedDate);
          for (var dayCounter = 1; dayCounter < daysDifference; dayCounter++)
          {
            previousDate.setDate(previousDate.getDate() - 1);
            var previousDay = previousDate.getDay();
            if (previousDay === 0 || previousDay === 6) weekendDaysCount = weekendDaysCount + 1;
          }
          newLeaveDetails.endDate = selectedDate;
          newLeaveDetails.days = daysDifference - weekendDaysCount;
      }
    }
    this.setState({newLeaveDetails:newLeaveDetails});

  };

  onLeaveDayCountChanged = event =>
  {
    var newLeaveDetails = cloneDeep(this.state.newLeaveDetails);

    var startDate = new Date(newLeaveDetails.startDate);
    var endDate = new Date(newLeaveDetails.startDate);

    for (var dayCounter = 0; dayCounter < (event.target.value - 1); dayCounter++)
    {
      endDate.setDate(endDate.getDate() + 1);
      var currentDay = endDate.getDay();
      if (currentDay === 0 || currentDay === 6) dayCounter = dayCounter - 1;
    }

    newLeaveDetails.endDate = endDate;
    newLeaveDetails.days = event.target.value;
    this.setState({newLeaveDetails:newLeaveDetails});
  };

  cancelLeave = event =>
  {
    var newLeaveDetails = {startDate:new Date(),
                           endDate:new Date(),
                           days:1,
                           teamMember:null,
                           leaveType:'Casual'};

    this.setState({showBackdrop:false, clickedEntity:null, newLeaveDetails:newLeaveDetails});
  };

  saveLeave = event =>
  {
    var newLeaveDetails = cloneDeep(this.state.newLeaveDetails);
    newLeaveDetails.startDate = new Date(newLeaveDetails.startDate.toDateString());
    newLeaveDetails.endDate = new Date(newLeaveDetails.endDate.toDateString());

    var validLeave = true;

    for (var leave of this.state.leaves)
    {
      if (leave.teamMember === newLeaveDetails.teamMember)
      {
        var existingLeaveStartDate = new Date(leave.startDate);
        var existingLeaveEndDate = new Date(leave.endDate);
        var newLeaveStartDate = new Date(newLeaveDetails.startDate);
        var newLeaveEndDate = new Date(newLeaveDetails.endDate);
        if (newLeaveStartDate >= existingLeaveStartDate && newLeaveStartDate <= existingLeaveEndDate) validLeave = false;
        else if (newLeaveEndDate >= existingLeaveStartDate && newLeaveEndDate <= existingLeaveEndDate) validLeave = false;
        else if (newLeaveStartDate <= existingLeaveStartDate && newLeaveEndDate >= existingLeaveEndDate) validLeave = false;
      }
    }

    if (validLeave)
    {
      var leaves = cloneDeep(this.state.leaves);
      leaves.push(newLeaveDetails);

      var emptyLeaveDetails = {startDate:new Date(),
                               endDate:new Date(),
                               days:1,
                               teamMember:null,
                               leaveType:'Casual'};

      this.setState({showBackdrop:false, clickedEntity:null, newLeaveDetails:emptyLeaveDetails, leaves:leaves});
      this.props.addDeleteLeaveHandler(leaves);
    }
    else
    {
      this.setState({showErrorSnackbar:true, errorMessage:'Leave coincides with existing leave'});
    }
  };

  deleteLeave(leave)
  {
    var existingLeaves = cloneDeep(this.state.leaves);

    var deleteLeaveStartDate = new Date(leave.startDate).toDateString();
    var deleteLeaveLeaveEndDate = new Date(leave.endDate).toDateString();
    var deleteLeaveTeamMember = leave.teamMember;

    for (var i = 0; i < existingLeaves.length; i++)
    {
      var existingLeaveStartDate = new Date(existingLeaves[i].startDate).toDateString();
      var existingLeaveEndDate = new Date(existingLeaves[i].endDate).toDateString();
      var existingLeaveTeamMember =  existingLeaves[i].teamMember;

      if (deleteLeaveStartDate === existingLeaveStartDate && deleteLeaveLeaveEndDate === existingLeaveEndDate && deleteLeaveTeamMember === existingLeaveTeamMember )
      {
        existingLeaves.splice(i, 1);
        this.setState({leaves:existingLeaves});
        this.props.addDeleteLeaveHandler(existingLeaves);
        break;
      }
    }
  };

  addHoliday = event =>
  {
    this.setState({showBackdrop:true, clickedEntity:'Add Holiday'});
  };

  onHolidayChanged = event =>
  {
    var newHolidayDetails = cloneDeep(this.state.newHolidayDetails);
    newHolidayDetails.holiday = event.target.value;
    this.setState({newHolidayDetails:newHolidayDetails});
  };

  onHolidayStartDateChanged = selectedDate =>
  {
    var newLeaveDetails = cloneDeep(this.state.newHolidayDetails);
    var selectedDay = selectedDate.getDay();
    if (selectedDay === 0)
    {
      var startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() + 1);
      var endDate = new Date(startDate);

      newLeaveDetails.startDate = startDate;
      newLeaveDetails.endDate = endDate;
      newLeaveDetails.days = 1;
    }
    else if (selectedDay === 6)
    {
      var startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 1);
      var endDate = new Date(startDate);

      newLeaveDetails.startDate = startDate;
      newLeaveDetails.endDate = endDate;
      newLeaveDetails.days = 1;
    }
    else
    {
      var endDate = new Date(selectedDate);
      for (var dayCounter = 0; dayCounter < (newLeaveDetails.days - 1); dayCounter++)
      {
        endDate.setDate(endDate.getDate() + 1);
        var currentDay = endDate.getDay();
        if (currentDay === 0 || currentDay === 6) dayCounter = dayCounter - 1;
      }
      newLeaveDetails.startDate = selectedDate;
      newLeaveDetails.endDate = endDate;
    }
    this.setState({newHolidayDetails:newLeaveDetails});
  };

  onHolidayEndDateChanged = selectedDate =>
  {
    var newLeaveDetails = cloneDeep(this.state.newHolidayDetails);
    var selectedDay = selectedDate.getDay();
    if (selectedDay === 0)
    {
      var startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() + 1);
      var endDate = new Date(startDate);

      newLeaveDetails.startDate = startDate;
      newLeaveDetails.endDate = endDate;
      newLeaveDetails.days = 1;
    }
    else if (selectedDay === 6)
    {
      var startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 1);
      var endDate = new Date(startDate);

      newLeaveDetails.startDate = startDate;
      newLeaveDetails.endDate = endDate;
      newLeaveDetails.days = 1;
    }
    else
    {
      var daysDifference = (new Date(selectedDate) - new Date(newLeaveDetails.startDate))/ (1000 * 60 * 60 * 24) + 1;

      if (daysDifference < 1)
      {
        newLeaveDetails.endDate = newLeaveDetails.startDate;
        newLeaveDetails.days = 1;
      }
      else
      {
          var weekendDaysCount = 0;
          var previousDate = new Date(selectedDate);
          for (var dayCounter = 1; dayCounter < daysDifference; dayCounter++)
          {
            previousDate.setDate(previousDate.getDate() - 1);
            var previousDay = previousDate.getDay();
            if (previousDay === 0 || previousDay === 6) weekendDaysCount = weekendDaysCount + 1;
          }
          newLeaveDetails.endDate = selectedDate;
          newLeaveDetails.days = daysDifference - weekendDaysCount;
      }
    }
    this.setState({newHolidayDetails:newLeaveDetails});

  };

  onHolidayDayCountChanged = event =>
  {
    var newLeaveDetails = cloneDeep(this.state.newHolidayDetails);

    var startDate = new Date(newLeaveDetails.startDate);
    var endDate = new Date(newLeaveDetails.startDate);

    for (var dayCounter = 0; dayCounter < (event.target.value - 1); dayCounter++)
    {
      endDate.setDate(endDate.getDate() + 1);
      var currentDay = endDate.getDay();
      if (currentDay === 0 || currentDay === 6) dayCounter = dayCounter - 1;
    }

    newLeaveDetails.endDate = endDate;
    newLeaveDetails.days = event.target.value;
    this.setState({newHolidayDetails:newLeaveDetails});
  };

  saveHoliday = event =>
  {
    var newLeaveDetails = cloneDeep(this.state.newHolidayDetails);
    newLeaveDetails.startDate = new Date(newLeaveDetails.startDate.toDateString());
    newLeaveDetails.endDate = new Date(newLeaveDetails.endDate.toDateString());

    var validLeave = true;
    var errorMessage = '';
    if (newLeaveDetails.holiday.trim().length < 3)
    {
      validLeave = false;
      errorMessage = 'Holiday name must be greater or equal to 3 characters';
    }
    else
    {
      for (var leave of this.state.holidays)
      {
        if (leave.holiday.toUpperCase().trim() === newLeaveDetails.holiday.toUpperCase().trim())
        {
          validLeave = false;
          errorMessage = 'Another holiday by the same name exists';
          break;
        }
        else
        {
          var existingLeaveStartDate = new Date(leave.startDate);
          var existingLeaveEndDate = new Date(leave.endDate);
          var newLeaveStartDate = new Date(newLeaveDetails.startDate);
          var newLeaveEndDate = new Date(newLeaveDetails.endDate);
          if (newLeaveStartDate >= existingLeaveStartDate && newLeaveStartDate <= existingLeaveEndDate)
          {
            validLeave = false;
            errorMessage = 'Holiday coincides with existing holiday';
            break;
          }
          else if (newLeaveEndDate >= existingLeaveStartDate && newLeaveEndDate <= existingLeaveEndDate)
          {
            validLeave = false;
            errorMessage = 'Holiday coincides with existing holiday';
            break;
          }
          else if (newLeaveStartDate <= existingLeaveStartDate && newLeaveEndDate >= existingLeaveEndDate)
          {
            validLeave = false;
            errorMessage = 'Holiday coincides with existing holiday';
            break;
          }
        }
      }
    }


    if (validLeave)
    {
      var leaves = cloneDeep(this.state.holidays);
      leaves.push(newLeaveDetails);

      var emptyLeaveDetails = {startDate:new Date(),
                               endDate:new Date(),
                               days:1,
                               holiday:''};

      this.setState({showBackdrop:false, clickedEntity:null, newHolidayDetails:emptyLeaveDetails, holidays:leaves});
      this.props.addDeleteHolidayHandler(leaves);
    }
    else
    {
      this.setState({showErrorSnackbar:true, errorMessage:errorMessage});
    }
  };

  deleteHoliday(holiday)
  {
    var existingLeaves = cloneDeep(this.state.holidays);

    for (var i = 0; i < existingLeaves.length; i++)
    {
      if (holiday.holiday === existingLeaves[i].holiday )
      {
        existingLeaves.splice(i, 1);
        this.setState({holidays:existingLeaves});
        this.props.addDeleteHolidayHandler(existingLeaves);
        break;
      }
    }
  };

  cancelHoliday = event =>
  {
    var newHolidayDetails = {startDate:new Date(),
                           endDate:new Date(),
                           days:1,
                           holiday:null};

    this.setState({showBackdrop:false, clickedEntity:null, newHolidayDetails:newHolidayDetails});
  };

  onSnackbarClose = event =>
  {
    this.setState({showErrorSnackbar:false, errorMessage:''});
  };

  render()
  {
    const { classes } = this.props;
    function sortLeaves( a, b )
    {
      if ( new Date(a.startDate) < new Date(b.startDate) )
      {
        return -1;
      }
      if ( new Date(a.startDate) > new Date(b.startDate) )
      {
        return 1;
      }
      return 0;
    }


    var leaveData = this.state.leaves;
    leaveData.sort(sortLeaves);
    var leavesArray = [];
    for (var leave of leaveData)
    {
      var leaveStartDate = new Date(leave.startDate);
      var leaveEndDate = new Date(leave.endDate);
      var formattedLeaveStartDate = leaveStartDate.getDate() + '-' + (leaveStartDate.toLocaleString('en-us', {month:'short'})) + '-' + leaveStartDate.getFullYear().toString().substr(-2);

      var formattedLeaveEndDate = leaveEndDate.getDate() + '-' + (leaveEndDate.toLocaleString('en-us', {month:'short'})) + '-' + leaveEndDate.getFullYear().toString().substr(-2);

      leavesArray.push(<LeaveCard
                        teamMembers={this.props.teamMembers}
                        leave={leave}
                        formattedLeaveStartDate={formattedLeaveStartDate}
                        formattedLeaveEndDate={formattedLeaveEndDate}
                        deleteLeave={this.deleteLeave}/>);
    }

     var holidaysData = this.state.holidays;
     holidaysData.sort(sortLeaves);
     var holidaysArray = [];
     for (var holiday of holidaysData)
     {
       var holidayStartDate = new Date(holiday.startDate);
       var formattedHolidayStartDate = holidayStartDate.toString().split(' ')[0] + ', ' + holidayStartDate.getDate() + '-' + (holidayStartDate.toLocaleString('en-us', {month:'short'})) + '-' + holidayStartDate.getFullYear().toString().substr(-2);

         holidaysArray.push(<HolidayCard deleteHoliday={this.deleteHoliday} holiday={holiday} formattedHolidayStartDate={formattedHolidayStartDate} />);
      }

    var teamSelectArray = [];

    var teamMembersArray = [];
    for (var i = 0; i < this.state.teamMembersArray.length; i++)
    {
      teamMembersArray.push(<TeamManagementRow index={i}
                                               type='Team Member'
                                               value={this.state.teamMembersArray[i]}
                                               editTeamMemberName={this.editTeamMemberName}
                                               removeTeamMember={this.removeTeamMember}
                                               showHideRowColorPicker={this.showHideRowColorPicker}
                                               rowColor={this.state.teamMembersColorArray[i]}
                                               changeTeamMemberName={this.changeTeamMemberName}/>);

       teamSelectArray.push(<MenuItem value={this.state.teamMembersArray[i]}>{this.state.teamMembersArray[i]}</MenuItem>)
    }

    var projectsArray = [];
    for (var i = 0; i < this.state.projectsArray.length; i++)
    {
      projectsArray.push(<TeamManagementRow index={i}
                                            type='Project'
                                            value={this.state.projectsArray[i]}
                                            editProjectName={this.editProjectName}
                                            removeProject={this.removeProject}
                                            showHideRowColorPicker={this.showHideRowColorPicker}
                                            rowColor={this.state.projectsColorArray[i]}/>);
    }

    var backdropUI = null;
    if (this.state.showBackdrop && this.state.clickedEntity === 'Color Picker')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.dismissColorPicker}/>
                        <SketchPicker className='color-picker' color={ this.state.clickedRowType === 'Team Member' ? this.state.teamMembersColorArray[this.state.clickedRowIndex] : this.state.projectsColorArray[this.state.clickedRowIndex]} onChange={ this.onColorPick } />
                    </div>);
    }
    if (this.state.showBackdrop && this.state.clickedEntity === 'Add Leave')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.cancelLeave}/>
                      <div className='add-leave-ui'>
                        <div className='add-leave-ui-header'>&nbsp;&nbsp;&nbsp;&nbsp;Add Leave</div>
                        <div className='top-row-container'>
                          <FormControl style={{marginTop:'2em'}} >
                            <InputLabel className={classes.formLabel}>Team member taking leave</InputLabel>
                            <Select className={classes.select} value={this.state.newLeaveDetails.teamMember} style={{width:'12em', color:'#616161', fontSize:'1.5em'}} onChange={this.onLeaveTeamMemberChanged}>
                              {teamSelectArray}
                            </Select>
                          </FormControl>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <FormControl style={{marginTop:'2em'}} >
                            <InputLabel className={classes.formLabel}>Leave type</InputLabel>
                            <Select className={classes.select} value={this.state.newLeaveDetails.leaveType} style={{width:'12em', color:'#616161', fontSize:'1.5em'}} onChange={this.onLeaveTypeChanged}>
                              <MenuItem value='Casual'><i className="fas fa-umbrella-beach"></i>&nbsp;&nbsp;Casual Leave</MenuItem>
                              <MenuItem value='Medical'><i className="fas fa-user-md"></i>&nbsp;&nbsp;Medical Leave</MenuItem>
                            </Select>
                          </FormControl>
                        </div>

                        <div className='bottom-row-container'>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                style = {{width: '13em'}}
                                variant="inline"
                                format="dd-MM-yyyy"
                                margin="normal"
                                label="Leave start date"
                                value={this.state.newLeaveDetails.startDate}
                                InputProps={{className: classes.input}}
                                className={classes.root}
                                onChange={this.onLeaveStartDateChanged}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}/>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <KeyboardDatePicker
                                style = {{width: '13em'}}
                                variant="inline"
                                format="dd-MM-yyyy"
                                margin="normal"
                                label="Leave end Date"
                                value={this.state.newLeaveDetails.endDate}
                                InputProps={{className: classes.input}}
                                className={classes.root}
                                onChange={this.onLeaveEndDateChanged}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}/>
                          </MuiPickersUtilsProvider>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <TextField type="number" style = {{width: '8em', marginTop:'0.5em'}} value={this.state.newLeaveDetails.days} InputProps={{className: classes.input}} onChange={this.onLeaveDayCountChanged}  min={1} max={90} className={classes.root} label="No. of Days"/>
                        </div>
                        <div className='save-close-button-container'>
                          <div style={{background: this.state.newLeaveDetails.teamMember === null ? 'lightgray' : 'white',
                                       color: this.state.newLeaveDetails.teamMember === null ? 'gray' : '#00B74A',
                                       borderColor: this.state.newLeaveDetails.teamMember === null ? 'gray' : '#00B74A',
                                       pointerEvents: this.state.newLeaveDetails.teamMember === null ? 'none' : 'auto'}} onClick={this.saveLeave} className='save-leave-button'>
                            <i className="fas fa-save"></i> &nbsp;&nbsp;Save
                          </div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <div onClick={this.cancelLeave} className='cancel-leave-button'>
                            <i className="fas fa-window-close"></i> &nbsp;&nbsp;Close
                          </div>
                        </div>
                      </div>
                    </div>);
    }
    if (this.state.showBackdrop && this.state.clickedEntity === 'Add Holiday')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.cancelHoliday}/>
                      <div className='add-leave-ui'>
                        <div className='add-leave-ui-header'>&nbsp;&nbsp;&nbsp;&nbsp;Add Holiday</div>
                        <div className='top-row-container'>
                          <TextField value={this.state.newHolidayDetails.holiday} style = {{width: '24em', color:'#616161', marginTop:'2em'}} InputProps={{className: classes.input}} onChange={this.onHolidayChanged} className={classes.root} label="Holiday"/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <TextField type="number" style = {{width: '8em', marginTop:'2em'}} value={this.state.newHolidayDetails.days} InputProps={{className: classes.input}} onChange={this.onHolidayDayCountChanged}  min={1} max={90} className={classes.root} label="No. of Days"/>
                        </div>

                        <div className='bottom-row-container'>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                style = {{width: '16em'}}
                                variant="inline"
                                format="dd-MM-yyyy"
                                margin="normal"
                                label="Holiday start date"
                                value={this.state.newHolidayDetails.startDate}
                                InputProps={{className: classes.input}}
                                className={classes.root}
                                onChange={this.onHolidayStartDateChanged}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}/>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <KeyboardDatePicker
                                style = {{width: '16em'}}
                                variant="inline"
                                format="dd-MM-yyyy"
                                margin="normal"
                                label="Holiday end Date"
                                value={this.state.newHolidayDetails.endDate}
                                InputProps={{className: classes.input}}
                                className={classes.root}
                                onChange={this.onHolidayEndDateChanged}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}/>
                          </MuiPickersUtilsProvider>

                        </div>
                        <div className='save-close-button-container'>
                          <div style={{background: this.state.newHolidayDetails.holiday === '' ? 'lightgray' : 'white',
                                       color: this.state.newHolidayDetails.holiday === '' ? 'gray' : '#00B74A',
                                       borderColor: this.state.newHolidayDetails.holiday === '' ? 'gray' : '#00B74A',
                                       pointerEvents: this.state.newHolidayDetails.holiday === '' ? 'none' : 'auto'}} onClick={this.saveHoliday} className='save-leave-button'>
                            <i className="fas fa-save"></i> &nbsp;&nbsp;Save
                          </div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <div onClick={this.cancelHoliday} className='cancel-leave-button'>
                            <i className="fas fa-window-close"></i> &nbsp;&nbsp;Close
                          </div>
                        </div>
                      </div>
                    </div>);
    }
    if (this.state.showBackdrop && this.state.clickedEntity === 'Add Team Member')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.cancelAddTeamMember}/>
                      <div className='add-leave-ui'>
                        <div className='add-leave-ui-header'>&nbsp;&nbsp;&nbsp;&nbsp;Add Team Member</div>
                        <div className='top-row-container'>
                          <TextField value={this.state.newTeamMember} style = {{width: '25em', fontSize:'1.5em', color:'#616161', marginTop:'3.5em', marginBottom:'2em'}} InputProps={{className: classes.input}} onChange={this.onNewTeamMemberChanged} className={classes.root} label="Team member name"/>
                        </div>

                        <div className='save-close-button-container'>
                          <div style={{background: this.state.newTeamMember === '' ? 'lightgray' : 'white',
                                       color: this.state.newTeamMember === '' ? 'gray' : '#00B74A',
                                       borderColor: this.state.newTeamMember === '' ? 'gray' : '#00B74A',
                                       pointerEvents: this.state.newTeamMember === '' ? 'none' : 'auto'}} onClick={this.saveNewTeamMember} className='save-leave-button'>
                            <i className="fas fa-user-plus"></i> &nbsp;&nbsp;Save
                          </div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <div onClick={this.cancelAddTeamMember} className='cancel-leave-button'>
                            <i className="fas fa-window-close"></i> &nbsp;&nbsp;Close
                          </div>
                        </div>
                      </div>
                    </div>);
    }
    if (this.state.showBackdrop && this.state.clickedEntity === 'Change Team Member')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.cancelChangeTeamMemberName}/>
                      <div className='add-leave-ui'>
                        <div className='add-leave-ui-header'>&nbsp;&nbsp;&nbsp;&nbsp;Rename Team Member</div>
                        <div className='top-row-container'>
                          <TextField value={this.state.newName} style = {{width: '25em', fontSize:'1.5em', color:'#616161', marginTop:'3.5em', marginBottom:'2em'}} InputProps={{className: classes.input}} onChange={this.onNewNameChanged} className={classes.root} label={"Rename " + this.state.oldName + " to"}/>
                        </div>
                        <div className='save-close-button-container'>
                          <div style={{background: this.state.newName === '' ? 'lightgray' : 'white',
                                       color: this.state.newName === '' ? 'gray' : '#00B74A',
                                       borderColor: this.state.newName === '' ? 'gray' : '#00B74A',
                                       pointerEvents: this.state.newName === '' ? 'none' : 'auto'}} onClick={this.confirmRenameTeamMember} className='save-leave-button'>
                            <i className="fas fa-save"></i> &nbsp;&nbsp;Rename
                          </div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <div onClick={this.cancelChangeTeamMemberName} className='cancel-leave-button'>
                            <i className="fas fa-window-close"></i> &nbsp;&nbsp;Close
                          </div>
                        </div>
                      </div>
                    </div>);
    }
    if (this.state.showBackdrop && this.state.clickedEntity === 'Remove Team Member')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.cancelRemoveTeamMember}/>
                      <div className='add-leave-ui'>
                        <div className='add-leave-ui-header'>&nbsp;&nbsp;&nbsp;&nbsp;Remove Team Member</div>
                        <div className='top-row-container'>
                          <span className='remove-team-member-text'>Are you sure you wish to remove <span style={{color:'red'}}>{this.state.teamMemberToBeRemoved}</span> from the team?</span>
                        </div>
                        <div className='save-close-button-container'>
                          <div onClick={this.confirmRemoveTeamMember} className='cancel-leave-button'>
                            <i className="fas fa-user-times"></i> &nbsp;&nbsp;Remove
                          </div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <div onClick={this.cancelRemoveTeamMember} className='save-leave-button'>
                            <i className="fas fa-window-close"></i> &nbsp;&nbsp;Cancel
                          </div>
                        </div>
                      </div>
                    </div>);
    }
    if (this.state.showBackdrop && this.state.clickedEntity === 'Add Project')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.cancelAddProject}/>
                      <div className='add-leave-ui'>
                        <div className='add-leave-ui-header'>&nbsp;&nbsp;&nbsp;&nbsp;Add Project</div>
                        <div className='top-row-container'>
                          <TextField value={this.state.newProject} style = {{width: '25em', fontSize:'1.5em', color:'#616161', marginTop:'3.5em', marginBottom:'2em'}} InputProps={{className: classes.input}} onChange={this.onNewProjectChanged} className={classes.root} label="New project name"/>
                        </div>

                        <div className='save-close-button-container'>
                          <div style={{background: this.state.newProject === '' ? 'lightgray' : 'white',
                                       color: this.state.newProject === '' ? 'gray' : '#00B74A',
                                       borderColor: this.state.newProject === '' ? 'gray' : '#00B74A',
                                       pointerEvents: this.state.newProject === '' ? 'none' : 'auto'}} onClick={this.saveNewProject} className='save-leave-button'>
                            <i className="fas fa-plus-square"></i> &nbsp;&nbsp;Save
                          </div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <div onClick={this.cancelAddProject} className='cancel-leave-button'>
                            <i className="fas fa-window-close"></i> &nbsp;&nbsp;Cancel
                          </div>
                        </div>
                      </div>
                    </div>);
    }
    if (this.state.showBackdrop && this.state.clickedEntity === 'Remove Project')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.cancelRemoveProject}/>
                      <div className='add-leave-ui'>
                        <div className='add-leave-ui-header'>&nbsp;&nbsp;&nbsp;&nbsp;Remove Project</div>
                        <div className='top-row-container'>
                          <span className='remove-team-member-text'>Are you sure you wish to remove <span style={{color:'red'}}>{this.state.projectToBeRemoved}</span>? <br/><span style={{color:'red', fontSize:'0.8em'}}>All stories under this project will be removed as well</span></span>
                        </div>
                        <div className='save-close-button-container'>
                          <div onClick={this.confirmRemoveProject} className='cancel-leave-button'>
                            <i className="fas fa-trash"></i> &nbsp;&nbsp;Remove
                          </div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <div onClick={this.cancelRemoveProject} className='save-leave-button'>
                            <i className="fas fa-window-close"></i> &nbsp;&nbsp;Cancel
                          </div>
                        </div>
                      </div>
                    </div>);
    }
    if (this.state.showBackdrop && this.state.clickedEntity === 'Change Project')
    {
      backdropUI = (<div className='color-picker-cover' >
                      <div className='dismiss-color-picker' onClick={this.cancelChangeProjectName}/>
                      <div className='add-leave-ui'>
                        <div className='add-leave-ui-header'>&nbsp;&nbsp;&nbsp;&nbsp;Rename Project</div>
                        <div className='top-row-container'>
                          <TextField value={this.state.newProjectName} style = {{width: '25em', fontSize:'1.5em', color:'#616161', marginTop:'3.5em', marginBottom:'2em'}} InputProps={{className: classes.input}} onChange={this.onNewProjectNameChanged} className={classes.root} label={"Rename " + this.state.oldProjectName + " to"}/>
                        </div>
                        <div className='save-close-button-container'>
                          <div style={{background: this.state.newProjectName === '' ? 'lightgray' : 'white',
                                       color: this.state.newProjectName === '' ? 'gray' : '#00B74A',
                                       borderColor: this.state.newProjectName === '' ? 'gray' : '#00B74A',
                                       pointerEvents: this.state.newProjectName === '' ? 'none' : 'auto'}} onClick={this.confirmRenameProject} className='save-leave-button'>
                            <i className="fas fa-save"></i> &nbsp;&nbsp;Rename
                          </div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <div onClick={this.cancelChangeProjectName} className='cancel-leave-button'>
                            <i className="fas fa-window-close"></i> &nbsp;&nbsp;Close
                          </div>
                        </div>
                      </div>
                    </div>);
    }

    return (<>
      {backdropUI}
      <div className='management-view-layout'>
        <div className='projects-section'>
          <div className='management-view-sections-header'>
            <span className='management-view-sections-header-text'>&nbsp;&nbsp;&nbsp;&nbsp;Projects</span>
            <div className='add-entity-button-container'>
              <div onClick={this.addProject} className='add-entity-button'>
                <i className="fas fa-project-diagram"></i> &nbsp;&nbsp;Add Project
              </div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </div>
          <div className='management-view-scrollable-container'>
            {projectsArray}
          </div>
        </div>
        <div className='team-members-section'>
          <div className='management-view-sections-header'>
            <span className='management-view-sections-header-text'>&nbsp;&nbsp;&nbsp;&nbsp;Team Members</span>
            <div className='add-entity-button-container'>
              <div onClick={this.addTeamMember} className='add-entity-button'>
                <i className="fas fa-user-plus"></i> &nbsp;&nbsp;Add Member
              </div>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </div>
          <div className='management-view-scrollable-container'>
            {teamMembersArray}
          </div>
        </div>
        <div className='leaves-holidays-section'>
          <div className='leaves-section'>
            <div className='management-view-sections-header'>
              <span className='management-view-sections-header-text'>&nbsp;&nbsp;&nbsp;&nbsp;Leaves</span>
              <div className='add-entity-button-container'>
                <div onClick={this.addLeave} className='add-entity-button'>
                  <i className="fas fa-umbrella-beach"></i> &nbsp;&nbsp;Add Leave
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            </div>
            &nbsp;
            <div className='management-view-scrollable-container'>
              {leavesArray}
            </div>
          </div>
          <div className='holidays-section'>
            <div className='management-view-sections-header'>
              <span className='management-view-sections-header-text'>&nbsp;&nbsp;&nbsp;&nbsp;Holidays</span>
              <div className='add-entity-button-container'>
                <div onClick={this.addHoliday} className='add-entity-button'>
                  <i className="fas fa-bahai"></i> &nbsp;&nbsp;Add Holiday
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            </div>
            &nbsp;
            <div className='management-view-scrollable-container'>
              {holidaysArray}
            </div>
          </div>
        </div>
      </div>
      <Snackbar anchorOrigin={{vertical:'bottom', horizontal:'left' }} open={this.state.showErrorSnackbar} autoHideDuration={6000} onClose={this.onSnackbarClose}>
        <MuiAlert elevation={100} variant="filled" onClose={this.onSnackbarClose} severity="error">
          {this.state.errorMessage}
        </MuiAlert>
      </Snackbar>
      </>
    );
  }

}

export default withStyles(styles)(ManagementView);
