import React from 'react';

import cloneDeep from 'lodash/cloneDeep';

import TextField from '@material-ui/core/TextField';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import { convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import Button from '@material-ui/core/Button';
import reactCSS from 'reactcss';
import { SketchPicker } from 'react-color';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import './TaskCreator.css';

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

// const content = {"entityMap":{},"blocks":[{"key":"637gr","text":"Initialized from content state.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]};


class TaskCreator extends React.Component
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

    if (typeof this.props.payload.taskID === 'undefined')
    {
      var startDate = this.props.payload.startDate;
      startDate = new Date(parseInt(startDate.split('-')[2]),parseInt(startDate.split('-')[1])-1,parseInt(startDate.split('-')[0]));

      var weekendsAsWorkdays = false;
      if (startDate.getDay() === 0 || startDate.getDay() === 6) weekendsAsWorkdays = true;

      this.state = {taskName:'',
                    taskID:undefined,
                    story:this.props.storyName,
                    track:this.props.tracks[this.props.payload.trackIndex],
                    trackIndex:this.props.payload.trackIndex,
                    startDate:startDate,
                    endDate:startDate,
                    days:1,
                    weekendsAsWorkdays:weekendsAsWorkdays,
                    team:teamMembers,
                    taskTypes:['Regular', 'Additional Request', 'Other'],
                    assignee:'',
                    taskType:'Regular',
                    taskStatus:'Not Started',
                    taskStatusColors:{'Not Started':'#BDBDBD', 'In Progress':'#FF8F00', 'Completed':'#00C853', 'On Hold':'#BDBDBD'},
                    taskStatusColorsAssigned:{'Not Started':'#BDBDBD', 'In Progress':'', 'Completed':'', 'On Hold':''},
                    taskProgress:0,
                    actualStartDate:null,
                    actualEndDate:null,
                    progressSliderDisabled:'disabled',
                    progressColor:'#B9B7BD',
                    utilization:3,
                    utilizationArray:['Low', 'Medium', 'High'],
                    utilizationColorArray:{'Low':'#BACC81', 'Medium':'#FFB067', 'High':'#FF7077'},
                    utilizationColor:'#FF7077',
                    showTaskColorPicker: false,
                    taskColor: {r: '241', g: '112', b: '19', a: '1'},
                    taskColorSwitch: true,
                    taskError: false,
                    taskErrorDescription: '',
                    taskErrorImpact: '',
                    taskErrorResolution: '',
                    taskDelay: false,
                    taskDelayReason: '',
                    taskDelayMitigation: '',
                    showErrorSnackbar:false,
                    errorMessage:'',
                    contentState:''};
    }
    else
    {
      var loadedState = cloneDeep(this.props.payload.taskDetails);
      loadedState.story = this.props.storyName;
      loadedState.track = this.props.tracks[this.props.payload.trackIndex];
      loadedState.team = teamMembers;
      this.state = loadedState;
    }
  }

  onClose = event =>
  {
    this.props.handler();
  };

  onTaskChanged = event =>
  {
    this.setState({taskName:event.target.value});
  };

  onStartDateChanged = selectedDate =>
  {
    var weekendsAsWorkdays = this.state.weekendsAsWorkdays;
    var selectedDay = selectedDate.getDay();
    if (selectedDay === 0 || selectedDay === 6) weekendsAsWorkdays = true;
    var endDate = new Date(selectedDate);

    if (weekendsAsWorkdays) endDate.setDate(selectedDate.getDate() + (this.state.days - 1));
    else
    {
      for (var dayCounter = 0; dayCounter < (this.state.days - 1); dayCounter++)
      {
        endDate.setDate(endDate.getDate() + 1);
        var currentDay = endDate.getDay();
        if (currentDay === 0 || currentDay === 6) dayCounter = dayCounter - 1;
      }
    }
    this.setState({startDate:selectedDate, endDate:endDate, weekendsAsWorkdays:weekendsAsWorkdays});
  };

  onActualStartDateChanged = selectedDate =>
  {
    this.setState({actualStartDate:selectedDate});
  }

  onEndDateChanged = selectedDate =>
  {
    var weekendsAsWorkdays = this.state.weekendsAsWorkdays;
    var selectedDay = selectedDate.getDay();
    if (selectedDay === 0 || selectedDay === 6) weekendsAsWorkdays = true;
    var daysDifference = (new Date(selectedDate) - new Date(this.state.startDate))/ (1000 * 60 * 60 * 24) + 1;

    if (daysDifference < 1) this.setState({endDate:this.state.startDate, days:1});
    else
    {
      if (weekendsAsWorkdays) this.setState({endDate:selectedDate, days:daysDifference, weekendsAsWorkdays:weekendsAsWorkdays});
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
        this.setState({endDate:selectedDate, days:daysDifference - weekendDaysCount, weekendsAsWorkdays:weekendsAsWorkdays});
      }
    }
  };

  onActualEndDateChanged = selectedDate =>
  {
    this.setState({actualEndDate:selectedDate});
  }

  onDayCountChange = event =>
  {
    var weekendsAsWorkdays = this.state.weekendsAsWorkdays;
    var startDate = this.state.startDate;
    var endDate = new Date(startDate);

    if (weekendsAsWorkdays) endDate.setDate(startDate.getDate() + (event.target.value - 1));
    else
    {
      for (var dayCounter = 0; dayCounter < (event.target.value - 1); dayCounter++)
      {
        endDate.setDate(endDate.getDate() + 1);
        var currentDay = endDate.getDay();
        if (currentDay === 0 || currentDay === 6) dayCounter = dayCounter - 1;
      }
    }
    this.setState({days:event.target.value, endDate:endDate});
  };

  onWeekendSwitch = event =>
  {
    var weekendsAsWorkdays = this.state.weekendsAsWorkdays;
    var correctedStartDate = new Date(this.state.startDate);
    var startDay = correctedStartDate.getDay();
    var correctedEndDate = new Date(this.state.endDate);
    var endDay = correctedEndDate.getDay();

    if (weekendsAsWorkdays)
    {
      while (startDay === 0 || startDay === 6)
      {
        correctedStartDate.setDate(correctedStartDate.getDate() - 1);
        startDay = correctedStartDate.getDay();
      }

      while (endDay === 0 || endDay === 6)
      {
        correctedEndDate.setDate(correctedEndDate.getDate() + 1);
        endDay = correctedEndDate.getDay();
      }

      var daysDifference = (new Date(correctedEndDate) - new Date(correctedStartDate))/ (1000 * 60 * 60 * 24) + 1;
      var weekendDaysCount = 0;
      var previousDate = new Date(correctedEndDate);
      for (var dayCounter = 1; dayCounter < daysDifference; dayCounter++)
      {
        previousDate.setDate(previousDate.getDate() - 1);
        var previousDay = previousDate.getDay();
        if (previousDay === 0 || previousDay === 6) weekendDaysCount = weekendDaysCount + 1;
      }
      this.setState({startDate:correctedStartDate, endDate:correctedEndDate, days:daysDifference - weekendDaysCount, weekendsAsWorkdays:!weekendsAsWorkdays});
    }
    else
    {
      var daysDifference = (new Date(correctedEndDate) - new Date(correctedStartDate))/ (1000 * 60 * 60 * 24) + 1;
      this.setState({days:daysDifference, weekendsAsWorkdays:!weekendsAsWorkdays});
    }
  };

  onAssigneeSelect = event =>
  {
    var taskColor = {r: '241', g: '112', b: '19', a: '1'};
    const hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
               ,(m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1).match(/.{2}/g)
      .map(x => parseInt(x, 16));

    if (this.state.taskColorSwitch)
    {
      taskColor = hexToRgb(this.props.teamMembers[event.target.value].color);
      taskColor = {r:taskColor[0], g:taskColor[1], b:taskColor[2], a:1};
      this.setState({assignee:event.target.value, taskColor:taskColor});
      return;
    }

    this.setState({assignee:event.target.value});
  };

  onTaskTypeSelect = event =>
  {
    this.setState({taskType:event.target.value});
  };

  onTaskStatusChanged = event =>
  {
    var assignedColorArray = cloneDeep(this.state.taskStatusColorsAssigned);
    assignedColorArray[this.state.taskStatus] = '';
    assignedColorArray[event.target.value] = this.state.taskStatusColors[event.target.value];

    var progressSliderDisabled = '';
    var taskProgress = this.state.taskProgress;
    var actualStartDate = this.state.actualStartDate;
    var actualEndDate = this.state.actualEndDate;
    if (event.target.value === 'Not Started')
    {
      taskProgress = 0;
      progressSliderDisabled = 'disabled';
      actualStartDate = null;
      actualEndDate = null;
    }
    else if (event.target.value === 'Completed')
    {
      taskProgress = 100;
      actualEndDate = new Date();
      if (actualStartDate === null) actualStartDate = new Date();
    }
    else if (event.target.value === 'In Progress')
    {
      if (this.state.taskProgress === 100) taskProgress = 99;
      actualStartDate = new Date();
      actualEndDate = null;
    }
    else if (event.target.value === 'On Hold')
    {
      if (this.state.taskProgress === 100) taskProgress = 99;
      progressSliderDisabled = 'disabled';
      actualEndDate = null;
    }

    this.setState({taskStatus:event.target.value,
                   taskStatusColorsAssigned:assignedColorArray,
                   progressColor:this.state.taskStatusColors[event.target.value],
                   progressSliderDisabled:progressSliderDisabled,
                   taskProgress:taskProgress,
                   actualStartDate:actualStartDate,
                   actualEndDate:actualEndDate});
  };

  onTaskProgressChanged = (event, newValue) =>
  {
    var assignedColorArray = cloneDeep(this.state.taskStatusColorsAssigned);
    assignedColorArray[this.state.taskStatus] = '';
    var taskStatus = 'In Progress'
    var actualStartDate = this.state.actualStartDate;
    var actualEndDate = this.state.actualEndDate;

    if (newValue === 100)
    {
      taskStatus = 'Completed';
      actualEndDate = new Date();
    }
    else
    {
      actualEndDate = null;
    }
    assignedColorArray[taskStatus] = this.state.taskStatusColors[taskStatus];
    this.setState({taskProgress:newValue,
                   taskStatus:taskStatus,
                   taskStatusColorsAssigned:assignedColorArray,
                   progressColor:assignedColorArray[taskStatus],
                   actualEndDate:actualEndDate});
  };

  onUtilizationChanged = (event, newValue) =>
  {
    var utilization = this.state.utilizationArray[newValue-1];

    this.setState({utilization:newValue,
                   utilizationColor:this.state.utilizationColorArray[utilization]});
  }

  onContentStateChange: Function = (contentState) => {
    this.setState({
      contentState,
    });
  };

  performValidation = event =>
  {
    var validationSuccessful = true;
    var errorMessage = '';

    if (this.state.taskName === '')
    {
      errorMessage += '??? Task name needs to be specified ';
      validationSuccessful = false;
    }

    if (this.state.assignee === '')
    {
      errorMessage += '??? Task needs to be assigned to a team member ';
      validationSuccessful = false;
    }

    for (var task of this.props.payload.otherTasksStartEndDates)
    {
      var checkStartDate = new Date(task.startDate);
      checkStartDate = new Date(checkStartDate.toDateString());

      var checkEndDate = new Date(task.endDate);
      checkEndDate = new Date(checkEndDate.toDateString());

      var currentStartDate = new Date(this.state.startDate);
      currentStartDate = new Date(currentStartDate.toDateString());

      var currentEndDate = new Date(this.state.endDate);
      currentEndDate = new Date(currentEndDate.toDateString());

      if (currentStartDate <= checkEndDate && currentStartDate >= checkStartDate)
      {
        errorMessage += '??? Task coincides with another on the same track ';
        validationSuccessful = false;
        break;
      }

      if (currentEndDate <= checkEndDate && currentEndDate >= checkStartDate)
      {
        errorMessage += '??? Task coincides with another on the same track ';
        validationSuccessful = false;
        break;
      }

      if (checkStartDate <= currentEndDate && checkStartDate >= currentStartDate && checkEndDate <= currentEndDate && checkEndDate >= currentStartDate)
      {
        errorMessage += '??? Task coincides with another on the same track ';
        validationSuccessful = false;
        break;
      }

      if (currentEndDate <= checkStartDate && currentStartDate >= checkStartDate && currentEndDate <= checkEndDate && currentStartDate >= checkEndDate)
      {
        errorMessage += '??? Task coincides with another on the same track ';
        validationSuccessful = false;
        break;
      }
    }

    if (validationSuccessful)
    {
      this.setState({validationSuccessful:validationSuccessful});

      var state = cloneDeep(this.state);
      if (typeof this.state.taskID === 'undefined')
      {
        state['taskID'] = new Date().getTime();
        this.props.addTaskHandler(state);
      }
      else this.props.editTaskHandler(state);

      this.props.handler();
    }
    else
    {
      this.setState({showErrorSnackbar:true, errorMessage:errorMessage});
    }
  };

  onDelete = event =>
  {
    this.props.deleteTaskHandler(this.state.taskID);
    this.props.handler();
  };

  showTaskColorPicker = () =>
  {
    this.setState({ showTaskColorPicker: !this.state.showTaskColorPicker })
  };

  closeTaskColorPicker = () =>
  {
    this.setState({ showTaskColorPicker: false })
  };

  onColorPick = (color) =>
  {
    this.setState({ taskColor: color.rgb })
  };

  onSnackbarClose = event =>
  {
    this.setState({showErrorSnackbar:false, errorMessage:''});
  };

  onTaskColorSwitch = event =>
  {
    var taskColor = {r: '241', g: '112', b: '19', a: '1'};
    if (!this.state.taskColorSwitch && this.state.assignee !== '')
    {
      const hexToRgb = hex =>
      hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
                 ,(m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16));
        taskColor = hexToRgb(this.props.teamMembers[this.state.assignee].color);
        taskColor = {r:taskColor[0], g:taskColor[1], b:taskColor[2], a:1};
    }
    this.setState({taskColorSwitch:!this.state.taskColorSwitch, taskColor:taskColor});
  }

  onTaskErrorSwitch = event =>
  {
    this.setState({taskError:!this.state.taskError});
  }

  onTaskDelaySwitch = event =>
  {
    this.setState({taskDelay:!this.state.taskDelay});
  }

  onTaskDelayReasonChanged = event =>
  {
    this.setState({taskDelayReason:event.target.value});
  };

  onTaskDelayMitigationChanged = event =>
  {
    this.setState({taskDelayMitigation:event.target.value});
  };


  onTaskErrorDescriptionChanged = event =>
  {
    this.setState({taskErrorDescription:event.target.value});
  };

  onTaskErrorImpactChanged = event =>
  {
    this.setState({taskErrorImpact:event.target.value});
  };

  render()
  {
    const { classes } = this.props;
    var pointerEvents = 'auto';
    if (this.state.taskColorSwitch) pointerEvents = 'none';

    var styles = reactCSS({
      'default': {
        color: {
          width: '2em',
          height: '2em',
          borderRadius: '2px',
          background: `rgba(${ this.state.taskColor.r }, ${ this.state.taskColor.g }, ${ this.state.taskColor.b }, ${ this.state.taskColor.a })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
          pointerEvents:pointerEvents
        },
        popover: {
          position: 'absolute',
          left:'5%',
          top:'45%',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    var storyTrackNames = 'Story: ' + this.state.story + ' | ' + 'Track: ' + this.state.track;

    var teamSelectArray = [];
    for (var member of this.state.team)
    {
      teamSelectArray.push(<MenuItem value={member}>{member}</MenuItem>)
    }

    var taskTypeArray = [];
    for (var taskType of this.state.taskTypes)
    {
      taskTypeArray.push(<MenuItem value={taskType}>{taskType}</MenuItem>)
    }

    var taskProgressMarks = [];
    for (var i = 0; i <= 100; i += 10)
    {
      taskProgressMarks.push({value:i, label:i.toString() + '%'});
    }

    var utilizationMarks = [];
    var utilizationArray = this.state.utilizationArray;
    for (var i = 1; i <= utilizationArray.length; i++)
    {
      utilizationMarks.push({value:i, label:utilizationArray[i-1]});
    }

    var taskCreatorLabel = 'Create a Task';
    var taskCreatorButtons = (<div className='task-creator-save-discard-button-container'>
                                <Button onClick={this.performValidation} variant="contained" color="secondary"style={{fontSize:'0.8em', borderRadius: '0.5em', color:'#EEEDE7', backgroundColor: "#478C5C", padding: "0.5em 1em"}}><i className="fas fa-save fa-lg"></i>&nbsp;&nbsp;&nbsp;Save Task</Button>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <Button onClick={this.onClose} variant="contained" color="secondary"style={{fontSize:'0.8em', borderRadius: '0.5em', color:'#EEEDE7', backgroundColor: "#C85250", padding: "0.5em 1em"}}><i className="fas fa-window-close fa-lg"></i>&nbsp;&nbsp;&nbsp;Discard Task</Button>
                              </div>)
    if (typeof this.state.taskID !== 'undefined')
    {
      taskCreatorLabel = 'Edit Task';
      taskCreatorButtons = (<div className='task-creator-save-discard-button-container'>
                              <Button onClick={this.performValidation} variant="contained" color="secondary"style={{fontSize:'0.8em', borderRadius: '0.5em', color:'#EEEDE7', backgroundColor: "#478C5C"}}><i className="fas fa-save fa-lg"></i>&nbsp;&nbsp;&nbsp;Save Changes</Button>
                              &nbsp;&nbsp;&nbsp;&nbsp;
                              <Button onClick={this.onDelete} variant="contained" color="secondary"style={{fontSize:'0.8em', borderRadius: '0.5em', color:'#EEEDE7', backgroundColor: "#F93154"}}><i className="fas fa-trash fa-lg"></i>&nbsp;&nbsp;&nbsp;Delete Task</Button>
                              &nbsp;&nbsp;&nbsp;&nbsp;
                              <Button onClick={this.onClose} variant="contained" color="secondary"style={{fontSize:'0.8em', borderRadius: '0.5em', color:'#EEEDE7', backgroundColor: "#C85250"}}><i className="fas fa-window-close fa-lg"></i>&nbsp;&nbsp;&nbsp;Discard Changes</Button>
                            </div>)
    }


    // const { contentState } = this.state;

    return (
      <div className='task-creator-layout'>
        <div className='task-creator-form-layout'>
          <div className='task-creator-header-container'>
            <div className='task-creator-header-text'>
              {taskCreatorLabel}
            </div>
              {taskCreatorButtons}
          </div>

          <div className='sub-header-container'>
            <span className='sub-header'><i className="fas fa-tasks"></i>&nbsp;&nbsp;&nbsp;Task Details</span>
            <span className='sub-header'><i className="fas fa-calendar-alt"></i>&nbsp;&nbsp;&nbsp;Timelines & Status</span>
            <span className='sub-header'><i className="fab fa-cloudscale"></i>&nbsp;&nbsp;&nbsp;Utilization & Others</span>
          </div>

          <div className='task-form-container'>
            <div className='task-details-outer-container'>
              <div className='task-details-inner-container'>
              <div className='story-track-name-container'>
                <span className='project-name'>Project: {this.props.project}</span>
                <span className='story-name'>Story: {this.state.story}</span>
                <span className='track-name'>Track: {this.state.track}</span>
              </div>
              <TextField value={this.state.taskName} style = {{width: '95%'}} InputProps={{className: classes.input}} onChange={this.onTaskChanged} className={classes.root} label="Task"/>
              <div className='task-color-container'>
                <div style={ styles.swatch } onClick={ this.showTaskColorPicker }>
                  <div style={ styles.color } />
                </div>
                { this.state.showTaskColorPicker ? <div style={ styles.popover }>
                  <div style={ styles.cover } onClick={ this.closeTaskColorPicker }/>
                  <SketchPicker color={ this.state.taskColor } onChange={ this.onColorPick } />
                </div> : null }
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <FormControlLabel className='task-color-switch' control={<Switch checked={this.state.taskColorSwitch} onChange={this.onTaskColorSwitch} />} label="Task color same as assignee color"/>
              </div>

              <FormControl style={{marginTop:'2em'}} >
                <InputLabel className={classes.formLabel}>Assigned To</InputLabel>
                <Select className={classes.select} value={this.state.assignee} style={{width:'20em', color:'#616161', fontSize:'1.5em'}} onChange={this.onAssigneeSelect}>
                  {teamSelectArray}
                </Select>
              </FormControl>

              <FormControl style={{marginTop:'2em'}}>
                <InputLabel className={classes.formLabel}>Task Type</InputLabel>
                <Select className={classes.select} value={this.state.taskType} style={{width:'20em', color:'#616161', fontSize:'1.5em'}} onChange={this.onTaskTypeSelect}>
                  {taskTypeArray}
                </Select>
              </FormControl>
            </div>
            </div>

            <div className='task-timelines-outer-container'>

              <div className='task-timelines-inner-container'>
              <div className='expected-date-pickers-container'>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                      style = {{width: '40%'}}
                      variant="inline"
                      format="dd-MM-yyyy"
                      margin="normal"
                      label="Expected Start Date"
                      value={this.state.startDate}
                      InputProps={{className: classes.input}}
                      className={classes.root}
                      onChange={this.onStartDateChanged}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <KeyboardDatePicker
                      style = {{width: '40%'}}
                      variant="inline"
                      format="dd-MM-yyyy"
                      margin="normal"
                      label="Expected End Date"
                      value={this.state.endDate}
                      InputProps={{className: classes.input}}
                      className={classes.root}
                      onChange={this.onEndDateChanged}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}/>
                </MuiPickersUtilsProvider>
              </div>

              <div className='date-pickers-container'>
                <TextField type="number" style = {{width: '20%'}} value={this.state.days} InputProps={{className: classes.input}} onChange={this.onDayCountChange}  min={1} max={90} className={classes.root} label="No. of Days"/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <FormControlLabel style={{color:'#616161', marginTop:'1em'}} control={<Switch checked={this.state.weekendsAsWorkdays} onChange={this.onWeekendSwitch} />} label="Treat weekends as work days"/>
              </div>

              <div className='actual-date-pickers-container'>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                      style = {{width: '40%'}}
                      variant="inline"
                      format="dd-MM-yyyy"
                      margin="normal"
                      label="Actual Start Date"
                      value={this.state.actualStartDate}
                      InputProps={{className: classes.input}}
                      className={classes.root}
                      onChange={this.onActualStartDateChanged}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <KeyboardDatePicker
                      style = {{width: '40%'}}
                      variant="inline"
                      format="dd-MM-yyyy"
                      margin="normal"
                      label="Actual End Date"
                      value={this.state.actualEndDate}
                      InputProps={{className: classes.input}}
                      className={classes.root}
                      onChange={this.onActualEndDateChanged}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}/>
                </MuiPickersUtilsProvider>
              </div>

              <FormControl style={{marginTop:'2.5em'}} component="fieldset">
                <FormLabel className={classes.formLabel} style={{color:'#373737', fontSize:'1.2em'}} component="legend">Task Status</FormLabel>
                <RadioGroup style={{marginTop:'0.7em'}} row value={this.state.taskStatus} onChange={this.onTaskStatusChanged}>
                  <FormControlLabel style={{ color:this.state.taskStatusColorsAssigned['Not Started'] }} value="Not Started" control={<Radio style={{ color:this.state.taskStatusColorsAssigned['Not Started'] }} />} label="Not Started" />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormControlLabel style={{ color:this.state.taskStatusColorsAssigned['In Progress'] }} value="In Progress" control={<Radio style={{ color:this.state.taskStatusColorsAssigned['In Progress'] }} />} label="In Progress" />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormControlLabel style={{ color:this.state.taskStatusColorsAssigned['Completed'] }} value="Completed" control={<Radio style={{ color:this.state.taskStatusColorsAssigned['Completed'] }}/>} label="Completed" />

                </RadioGroup>
              </FormControl>

              <Typography style={{marginTop:'2em', color:'#373737', fontSize:'1.2em'}} gutterBottom>Task Progress</Typography>
              <Slider disabled={this.state.progressSliderDisabled} style={{width:'90%', marginLeft:'0.5em', marginTop:'0.3em', color:this.state.progressColor}} value={this.state.taskProgress}  step={1} valueLabelDisplay="auto" marks={taskProgressMarks} onChange={this.onTaskProgressChanged}/>

            </div>
            </div>

            <div className='task-updates-outer-container'>
            <div className='task-updates-inner-container'>
            <Typography style={{marginTop:'2em', color:'#373737', fontSize:'1.2em'}} gutterBottom>Utilization</Typography>
            <Slider style={{width:'90%', marginLeft:'0.5em', color:this.state.utilizationColor}} value={this.state.utilization}  step={1}  marks={utilizationMarks} min={1} max={3} onChange={this.onUtilizationChanged}/>

              <FormControlLabel style={{color:'#616161', marginTop:'1em'}} control={<Switch checked={this.state.taskDelay} onChange={this.onTaskDelaySwitch} />} label="Delay in Task"/>
              { this.state.taskDelay ?
                <>
                <TextField value={this.state.taskDelayReason} style = {{width: '95%', marginTop:'0.5em', fontSize:'0.8em'}} InputProps={{className: classes.input}} onChange={this.onTaskDelayReasonChanged} className={classes.root} label="Delay Reason"/>
                <TextField value={this.state.taskDelayMitigation} style = {{width: '95%', marginTop:'1.2em', fontSize:'0.8em'}} InputProps={{className: classes.input}} onChange={this.onTaskDelayMitigationChanged} className={classes.root} label="Delay Mitigation"/></> : null }

              <FormControlLabel style={{color:'#616161', marginTop:'1.5em'}} control={<Switch checked={this.state.taskError} onChange={this.onTaskErrorSwitch} />} label="Error in Task"/>

              { this.state.taskError ?
                <>
                <TextField value={this.state.taskErrorDescription} style = {{width: '95%', marginTop:'0.5em', fontSize:'0.8em'}} InputProps={{className: classes.input}} onChange={this.onTaskErrorDescriptionChanged} className={classes.root} label="Error Description"/>
                <TextField value={this.state.taskErrorImpact} style = {{width: '95%', marginTop:'1.2em', fontSize:'0.8em'}} InputProps={{className: classes.input}} onChange={this.onTaskErrorImpactChanged} className={classes.root} label="Error Impact"/></> : null }


              <Typography style={{marginTop:'1.5em', color:'#373737', fontSize:'1.2em'}} gutterBottom>Additional Comments/Notes</Typography>
              <Editor initialContentState={this.state.contentState} wrapperClassName="demo-wrapper" editorClassName="demo-editor" onContentStateChange={this.onContentStateChange} />
            </div>
          </div>
          </div>

          <Snackbar anchorOrigin={{vertical:'bottom', horizontal:'left' }} open={this.state.showErrorSnackbar} autoHideDuration={6000} onClose={this.onSnackbarClose}>
            <MuiAlert elevation={6} variant="filled" onClose={this.onSnackbarClose} severity="error">
              {this.state.errorMessage}
            </MuiAlert>
          </Snackbar>

        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TaskCreator);
