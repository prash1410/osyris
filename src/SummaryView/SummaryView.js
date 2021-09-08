import React from 'react';

import './SummaryView.css';

import ProjectUpdates from './ProjectUpdates/ProjectUpdates.js';
import UtilizationChart from './UtilizationChart/UtilizationChart.js';

import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  input: {
    color: "gray",
    fontSize: '1.5em'
  },
  formLabel: {
    '&.Mui-focused': {
      color: '#616161'
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

class SummaryView extends React.Component
{
  constructor(props)
  {
    super(props);
    var today = new Date();
    today = new Date(today.toDateString());

    var lookBackDate = new Date(today);
    lookBackDate.setDate(lookBackDate.getDate() - 6);

    var lookAheadDate = new Date(today);
    lookAheadDate.setDate(lookAheadDate.getDate() + 7);

    var progressColors = ['#00b74a', '#71bb3f', '#a3bd41', '#ccbe50', '#ecc068', '#f3a552', '#f88547', '#fb6149', '#f93154', '#f93154'];
    progressColors.reverse();

    this.state = {lookBackDate:lookBackDate,
                  today:today,
                  lookAheadDate:lookAheadDate,
                  lookupPeriods:['1 Week', '2 Weeks', '3 Weeks', '4 Weeks'],
                  selectedLookBackPeriod:'1 Week',
                  selectedLookAheadPeriod:'1 Week',
                  selectedTeamMembers:Object.keys(this.props.teamMembers),
                  progressColors:progressColors};
  }

  onLookAheadPeriodChanged = event =>
  {
    var endDate = new Date(this.state.today);
    var lookAheadDays = parseInt(event.target.value.split(' ')[0]) * 7;
    endDate.setDate(endDate.getDate() + lookAheadDays);
    this.setState({selectedLookAheadPeriod:event.target.value, lookAheadDate:endDate});
  };

  onLookBackPeriodChanged = event =>
  {
    var startDate = new Date(this.state.today);
    var lookBackDays = parseInt(event.target.value.split(' ')[0]) * 7;
    lookBackDays = lookBackDays - 1;
    startDate.setDate(startDate.getDate() - lookBackDays);
    this.setState({selectedLookBackPeriod:event.target.value, lookBackDate:startDate});
  };

  onTeamMemberSelectionChanged = event =>
  {
    this.setState({selectedTeamMembers:event.target.value});
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

    var leavesData = this.props.leaves;
    leavesData.sort(sortLeaves);

    var leavesArray = [];

    for (var leave of this.props.leaves)
    {
      var leaveStartDate = new Date(leave.startDate);
      var leaveEndDate = new Date(leave.endDate);
      if ( leaveEndDate >= new Date(this.state.today) && leaveStartDate <= new Date(this.state.lookAheadDate))
      {
        var formattedLeaveStartDate = leaveStartDate.getDate() + '-' + (leaveStartDate.toLocaleString('en-us', {month:'short'})) + '-' + leaveStartDate.getFullYear().toString().substr(-2);

        var formattedLeaveEndDate = leaveEndDate.getDate() + '-' + (leaveEndDate.toLocaleString('en-us', {month:'short'})) + '-' + leaveEndDate.getFullYear().toString().substr(-2);

        leavesArray.push(<div className='leave-card'>
                          <div className='leave-card-right-section'>
                            <div style={{background:this.props.teamMembers[leave.teamMember].color}} className='team-member-name-wrapper'>
                              &nbsp;&nbsp;&nbsp;{leave.teamMember}
                            </div>
                            <div className='leave-details-section'>
                              <div className='leave-icon-container'>
                                <i style={{ color:'lightgray'}} className={leave.leaveType === 'Casual' ? "fas fa-umbrella-beach fa-2x" : "fas fa-user-md fa-2x"}></i>
                              </div>
                              <div className='days-count-section'>
                                {leave.days} {leave.days > 1 ? "days" : "day"}
                              </div>
                              <div className='leave-days-section'>
                                <div className='leave-start-date'>
                                  From: {formattedLeaveStartDate}
                                </div>
                                <div className='leave-end-date'>
                                  Until: {formattedLeaveEndDate}
                                </div>
                              </div>

                            </div>
                          </div>
                         </div>);
      }
    }


     var holidaysArray = [];
     for (var holiday of this.props.holidays)
     {
       var holidayStartDate = new Date(holiday.startDate);
       var formattedHolidayStartDate = holidayStartDate.toString().split(' ')[0] + ', ' + holidayStartDate.getDate() + '-' + (holidayStartDate.toLocaleString('en-us', {month:'short'})) + '-' + holidayStartDate.getFullYear().toString().substr(-2);

         holidaysArray.push(<div className='holiday-row'>
                              <div className='holiday-name-wrapper'>{holiday.holiday}</div>
                              <div className='holiday-date-wrapper'>{formattedHolidayStartDate}</div>
                            </div>);
      }

    var lookupPeriodArray = [];
    for (var period of this.state.lookupPeriods)
    {
      lookupPeriodArray.push(<MenuItem value={period}>{period}</MenuItem>)
    }

    var teamMembers = [];
    for (var [key, value] of Object.entries(this.props.teamMembers))
    {
      teamMembers.push(<MenuItem value={key}>{key}</MenuItem>)
    }

    var activeProjects = [];
    var upcomingStoriesArray = [];
    var ongoingStoriesArray = [];
    var utilizationData = {};
    var summaryStartDate = new Date(this.state.lookBackDate);
    var summaryEndDate = new Date(this.state.today);
    var totalTaskCount = 0;
    var totalNotStartedTaskCount = 0;
    var totalInProgressTaskCount = 0;
    var totalCompletedTaskCount = 0;
    var errorCount = 0;
    var delayCount = 0;

    for (var [key, value] of Object.entries(this.props.projects))
    {
      if (value.stories !== undefined)
      {
        for (var story of value.stories)
        {
          var storyStartDate = new Date(story.startDate);
          var storyEndDate = new Date(story.endDate);

          var considerStoryFlag = 0;
          if (storyStartDate >= summaryStartDate && storyStartDate <= summaryEndDate) considerStoryFlag += 1;
          if (storyEndDate >= summaryStartDate && storyEndDate <= summaryEndDate) considerStoryFlag += 1;
          if (storyStartDate <= summaryStartDate && storyEndDate >= summaryEndDate) considerStoryFlag += 1;
          if (storyStartDate >= summaryStartDate && storyEndDate <= summaryEndDate) considerStoryFlag += 1;

          if (considerStoryFlag > 0)
          {
            var taskCount = story.tasks.length;
            var completedTaskCount = 0;
            for (var task of story.tasks)
            {
              if (task.taskStatus === 'Completed') completedTaskCount += 1;

              var taskStartDate = new Date(task.startDate);
              var taskEndDate = new Date(task.endDate);
              var considerTaskFlag = 0;
              if (taskStartDate >= summaryStartDate && taskStartDate <= summaryEndDate) considerTaskFlag += 1;
              if (taskEndDate >= summaryStartDate && taskEndDate <= summaryEndDate) considerTaskFlag += 1;
              if (taskStartDate <= summaryStartDate && taskEndDate >= summaryEndDate) considerTaskFlag += 1;
              if (taskStartDate >= summaryStartDate && taskEndDate <= summaryEndDate) considerTaskFlag += 1;

              if (considerTaskFlag > 0)
              {
                totalTaskCount += 1;
                if (task.taskStatus === 'Completed') totalCompletedTaskCount += 1;
                else if (task.taskStatus === 'Not Started') totalNotStartedTaskCount += 1;
                else if (task.taskStatus === 'In Progress') totalInProgressTaskCount += 1;

                if (task.taskError) errorCount += 1;
                if (task.taskDelay) delayCount += 1;
                if (this.state.selectedTeamMembers.indexOf(task.assignee) > -1)
                {
                  while (taskStartDate <= taskEndDate && taskStartDate <= summaryEndDate)
                  {
                    if (!task.weekendsAsWorkdays)
                    {
                      if (taskStartDate.getDay() !== 0 && taskStartDate.getDay() !== 6)
                      {
                        var formattedDate = taskStartDate.getDate() + '-' + (taskStartDate.getMonth()+1) + '-' + taskStartDate.getFullYear();
                        if (Object.keys(utilizationData).indexOf(formattedDate) > -1) utilizationData[formattedDate] = utilizationData[formattedDate] + task.utilization;
                        else utilizationData[formattedDate] = task.utilization;
                      }
                    }
                    else
                    {
                      var formattedDate = taskStartDate.getDate() + '-' + (taskStartDate.getMonth()+1) + '-' + taskStartDate.getFullYear();
                      if (Object.keys(utilizationData).indexOf(formattedDate) > -1) utilizationData[formattedDate] = utilizationData[formattedDate] + task.utilization;
                      else utilizationData[formattedDate] = task.utilization;
                    }
                    taskStartDate.setDate(taskStartDate.getDate() + 1);
                  }
                }
              }
            }
            var storyProgress = parseInt((completedTaskCount/taskCount)*100);

            var storyDaysCount = (new Date(storyEndDate) - new Date(storyStartDate))/ (1000 * 60 * 60 * 24) + 1;
            var daysElapsed = 0;
            var timeProgression = 0;
            var today = new Date();
            today = new Date(today.toDateString());

            if (storyStartDate < today)
            {
              if (storyEndDate < today)
              {
                daysElapsed = storyDaysCount;
                timeProgression = 100;
              }
              else if (storyEndDate === today)
              {
                daysElapsed = storyDaysCount - 1;
                timeProgression = parseInt((daysElapsed/storyDaysCount)*100);
              }
              else
              {
                daysElapsed = (new Date(today) - new Date(storyStartDate))/ (1000 * 60 * 60 * 24);
                timeProgression = parseInt((daysElapsed/storyDaysCount)*100);
              }
            }

            var formattedStartDate = storyStartDate.getDate() + '-' + (storyStartDate.toLocaleString('en-us', {month:'short'})) + '-' + storyStartDate.getFullYear().toString().substr(-2);
            var formattedEndDate = storyEndDate.getDate() + '-' + (storyEndDate.toLocaleString('en-us', {month:'short'})) + '-' + storyEndDate.getFullYear().toString().substr(-2);

            var storyStatus = 'In Progress';
            if (completedTaskCount === taskCount) storyStatus = 'Completed';
            ongoingStoriesArray.push(<ProjectUpdates
                                      storyType={'current'}
                                      storyName={story.storyName}
                                      startDate={storyStartDate}
                                      formattedStartDate={formattedStartDate}
                                      endDate={storyEndDate}
                                      formattedEndDate={formattedEndDate}
                                      progress={storyProgress}
                                      taskCount={taskCount}
                                      completedTaskCount={completedTaskCount}
                                      daysElapsed={daysElapsed}
                                      timeProgression={timeProgression}
                                      storyDaysCount={storyDaysCount}
                                      storyStatus={storyStatus}
                                      project={key}
                                      projectColor={value.color}/>);

            if ( activeProjects.indexOf(key) < 0 ) activeProjects.push(key);
          }
          else if (storyStartDate > summaryEndDate && storyStartDate <= this.state.lookAheadDate)
          {
            var formattedStartDate = storyStartDate.getDate() + '-' + (storyStartDate.toLocaleString('en-us', {month:'short'})) + '-' + storyStartDate.getFullYear().toString().substr(-2);
            var formattedEndDate = storyEndDate.getDate() + '-' + (storyEndDate.toLocaleString('en-us', {month:'short'})) + '-' + storyEndDate.getFullYear().toString().substr(-2);

            var eta = (new Date(storyStartDate) - new Date(this.state.today))/ (1000 * 60 * 60 * 24);
            var etc = (new Date(storyEndDate) - new Date(storyStartDate))/ (1000 * 60 * 60 * 24) + 1;

            upcomingStoriesArray.push(<ProjectUpdates
                                  storyType={'upcoming'}
                                  storyName={story.storyName}
                                  startDate={storyStartDate}
                                  formattedStartDate={formattedStartDate}
                                  endDate={storyEndDate}
                                  formattedEndDate={formattedEndDate}
                                  eta={eta}
                                  etc={etc}
                                  project={key}
                                  projectColor={value.color}/>);
          }
        }
      }
    }

    var utilizationChartData = [];
    var totalUtilization = 0;
    for (var [key, value] of Object.entries(utilizationData))
    {
      utilizationData[key] = value/this.state.selectedTeamMembers.length;
      var actualDate = new Date(parseInt(key.split('-')[2]), parseInt(key.split('-')[1]) - 1, parseInt(key.split('-')[0]));
      if (actualDate >= new Date(this.state.lookBackDate))
      {
        var utilizationValue = value/this.state.selectedTeamMembers.length;
        totalUtilization += utilizationValue;
        utilizationChartData.push({'date':key, 'actualDate':actualDate, 'value':utilizationValue/3});
      }
    }

    var iterativeDate = new Date(summaryStartDate);
    var workingDaysCount = 0;
    while (iterativeDate <= summaryEndDate)
    {
      if (iterativeDate.getDay() !== 0 && iterativeDate.getDay() !== 6) workingDaysCount += 1;
      iterativeDate.setDate(iterativeDate.getDate() + 1);
    }

    var maxUtilization = 3 * workingDaysCount;
    var percentageUtilization = Math.round(((totalUtilization/maxUtilization)*100) * 10) / 10;
    var utilizationColor = this.state.progressColors[0];
    if (parseInt(percentageUtilization/10) === 10) utilizationColor = this.state.progressColors[9];
    else if (parseInt(percentageUtilization/10) <= 9) utilizationColor = this.state.progressColors[parseInt(percentageUtilization/10)];

    function sortDecending( a, b )
    {
      if ( new Date(a.props.startDate) > new Date(b.props.startDate) )
      {
        return -1;
      }
      if ( new Date(a.props.startDate) < new Date(b.props.startDate) )
      {
        return 1;
      }
      return 0;
    }

    function sortAscending( a, b )
    {
      if ( new Date(a.props.startDate) < new Date(b.props.startDate) )
      {
        return -1;
      }
      if ( new Date(a.props.startDate) > new Date(b.props.startDate) )
      {
        return 1;
      }
      return 0;
    }

    function sortChartData( a, b )
    {
      if ( new Date(a.actualDate) < new Date(b.actualDate) )
      {
        return -1;
      }
      if ( new Date(a.actualDate) > new Date(b.actualDate) )
      {
        return 1;
      }
      return 0;
    }

    utilizationChartData.sort(sortChartData);

    var lookBackText = this.state.lookBackDate.getDate() + '-' + (this.state.lookBackDate.toLocaleString('en-us', {month:'short'})) + '-' + this.state.lookBackDate.getFullYear().toString().substr(-2);
    lookBackText += ' to '
    lookBackText += this.state.today.getDate() + '-' + (this.state.today.toLocaleString('en-us', {month:'short'})) + '-' + this.state.today.getFullYear().toString().substr(-2);

    var today = new Date(this.state.today);
    today.setDate(today.getDate() + 1);

    var lookAheadText = today.getDate() + '-' + (today.toLocaleString('en-us', {month:'short'})) + '-' + today.getFullYear().toString().substr(-2);
    lookAheadText += ' to '
    lookAheadText += this.state.lookAheadDate.getDate() + '-' + (this.state.lookAheadDate.toLocaleString('en-us', {month:'short'})) + '-' + this.state.lookAheadDate.getFullYear().toString().substr(-2);

    ongoingStoriesArray.sort(sortDecending);
    upcomingStoriesArray.sort(sortAscending);

    console.log(lookBackText, lookAheadText);

    return (
      <div className='summary-view-layout'>
        <div className='status-cards-container'>

          <div className='active-projects-card'>
            <div style={{ color: activeProjects.length === 0 ? '#E43D40' : '#81B622'}} className='active-projects-count'>{Object.keys(activeProjects).length}</div>
            <div className='active-projects-text'>Active Projects</div>
          </div>

          <div className='task-summary-card'>
            <div className='total-task-count-section'>
              <div className='total-task-count'>{totalTaskCount}</div>
              <div className='total-task-count-text'>Total Tasks</div>
            </div>
            <div className='separator'/>
            <div className='not-started-task-count-section'>
              <div className='not-started-task-count'>{totalNotStartedTaskCount}</div>
              <div className='not-started-task-count-text'>Not Started</div>
            </div>
            <div className='in-progress-task-count-section'>
              <div className='in-progress-task-count'>{totalInProgressTaskCount}</div>
              <div className='in-progress-task-count-text'>In Progress</div>
            </div>
            <div className='completed-task-count-section'>
              <div className='completed-task-count'>{totalCompletedTaskCount}</div>
              <div className='completed-task-count-text'>Completed</div>
            </div>
          </div>

          <div className='delay-count-card'>
            <div style={{ color: delayCount === 0 ? '#81B622' : '#E43D40'}} className='delay-count'>{delayCount}</div>
            <div className='delay-text'>Delays in Tasks</div>
          </div>

          <div className='error-count-card'>
            <div style={{ color: errorCount === 0 ? '#81B622' : '#E43D40'}} className='error-count'>{errorCount}</div>
            <div className='error-text'>Errors in Delivery</div>
          </div>

          <div className='lookup-selectors-card'>
            <div className='look-back-selector-wrapper'>
            <div className='look-back-selector-text'>Look Back Period</div>
            <FormControl>
              <Select className={classes.select} value={this.state.selectedLookBackPeriod} style={{width:'10em', color:'gray', fontSize:'1.5em'}} onChange={this.onLookBackPeriodChanged}>
                {lookupPeriodArray}
              </Select>
            </FormControl>
            </div>

            <div style={{marginLeft:'15%'}} className='look-ahead-selector-wrapper'>
            <div className='look-ahead-selector-text'>Look Ahead Period</div>
            <FormControl>
              <Select className={classes.select} value={this.state.selectedLookAheadPeriod} style={{width:'10em', color:'gray', fontSize:'1.5em'}} onChange={this.onLookAheadPeriodChanged}>
                {lookupPeriodArray}
              </Select>
            </FormControl>
            </div>
          </div>
        </div>

        <div className='update-cards-container'>
          <div className='happening-now-card'>
            <div className='update-card-header'>Current Stories</div>
            <div className='scrollable-container'>
              {ongoingStoriesArray}
            </div>
          </div>
          <div className='whats-next-card'>
            <div className='update-card-header'>Upcoming Stories</div>
            <div className='scrollable-container'>
              {upcomingStoriesArray}
            </div>
          </div>
        </div>

        <div className='utilization-holiday-cards-container'>
          <div className='utilization-card'>
            <div className='utilization-card-header'>
              Utilization&nbsp;&nbsp;|&nbsp;&nbsp;Team Members:&nbsp;&nbsp;
              <FormControl>
                <Select multiple className={classes.select} value={this.state.selectedTeamMembers} style={{width:'20em', color:'gray', fontSize:'0.8em'}} onChange={this.onTeamMemberSelectionChanged}>
                  {teamMembers}
                </Select>
              </FormControl>
            </div>
            <div className='utilization-card-body'>
              <div className='utilization-card-body-left-section'>
                <div style={{color:utilizationColor}} className='percent-utilization'>{percentageUtilization}%</div>
                <div className='utilization-text'>Total Utilization</div>
                <div className='working-days-count'>No. of working days: {workingDaysCount}</div>
                <div className='team-members-count'>No. of team members: {this.state.selectedTeamMembers.length}</div>
              </div>
              <div className='utilization-card-body-right-section'>
                <UtilizationChart chartData={utilizationChartData}/>
              </div>
            </div>
          </div>

          <div className='leaves-card'>
            <div className='utilization-card-header'>
              Upcoming Leaves
            </div>
            <div className='leaves-card-body'>
              {leavesArray}
            </div>
          </div>

          <div className='holidays-card'>
            <div className='utilization-card-header'>
              List of Holidays
            </div>
            <div className='holidays-card-body'>
              {holidaysArray}
            </div>
          </div>

        </div>
      </div>
    );
  }

}

export default withStyles(styles)(SummaryView);
