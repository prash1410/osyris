import React from 'react';

import './UtilizationView.css';

import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import UtilizationViewChart from './UtilizationViewChart/UtilizationViewChart.js';

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


class UtilizationView extends React.Component
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

    this.state = {lookBackDate:lookBackDate,
                  today:today,
                  lookAheadDate:lookAheadDate,
                  lookupPeriods:['1 Week', '2 Weeks', '3 Weeks', '4 Weeks'],
                  selectedLookBackPeriod:'1 Week',
                  selectedLookAheadPeriod:'1 Week',
                  selectedTeamMembers:Object.keys(this.props.teamMembers)};
  }

  onTeamMemberSelectionChanged = event =>
  {
    this.setState({selectedTeamMembers:event.target.value});
  };

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

  render()
  {
    const { classes } = this.props;

    var summaryStartDate = new Date(this.state.lookBackDate);
    var summaryEndDate = new Date(this.state.lookAheadDate);

    var lookupPeriodArray = [];
    for (var period of this.state.lookupPeriods)
    {
      lookupPeriodArray.push(<MenuItem value={period}>{period}</MenuItem>)
    }

    var projectsObject = {};
    var projectsLegend = [];
    for (var [key, value] of Object.entries(this.props.projects))
    {
      projectsObject[key] = value.color;
      projectsLegend.push(<div className='legend-item-wrapper'>
                            <div style={{background:value.color}} className='legend-project-color'/>
                            <div className='legend-project-name'>{key}</div>
                          </div>)
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

    var individualUtilizationUIArray = [];
    var teamMembers = [];
    for (var [teamMemberkey, teamMembervalue] of Object.entries(this.props.teamMembers))
    {
      teamMembers.push(<MenuItem value={teamMemberkey}>{teamMemberkey}</MenuItem>)

      if (this.state.selectedTeamMembers.indexOf(teamMemberkey) !== -1)
      {
        var utilizationData = {};
        var pastUtilization = 0;
        var futureUtilization = 0;

        for (var [key, value] of Object.entries(this.props.projects))
        {
          if (value.stories !== undefined)
          {
            for (var story of value.stories)
            {
              for (var task of story.tasks)
              {
                var taskStartDate = new Date(task.startDate);
                var taskEndDate = new Date(task.endDate);
                var considerTaskFlag = 0;
                if (taskStartDate >= summaryStartDate && taskStartDate <= summaryEndDate) considerTaskFlag += 1;
                if (taskEndDate >= summaryStartDate && taskEndDate <= summaryEndDate) considerTaskFlag += 1;
                if (taskStartDate <= summaryStartDate && taskEndDate >= summaryEndDate) considerTaskFlag += 1;
                if (taskStartDate >= summaryStartDate && taskEndDate <= summaryEndDate) considerTaskFlag += 1;

                if (considerTaskFlag > 0)
                {
                  //if (this.state.selectedTeamMembers.indexOf('Badri') > -1)
                  if (task.assignee === teamMemberkey)
                  {
                    while (taskStartDate <= taskEndDate && taskStartDate <= summaryEndDate)
                    {
                      if (!task.weekendsAsWorkdays)
                      {
                        if (taskStartDate.getDay() !== 0 && taskStartDate.getDay() !== 6)
                        {
                          var formattedDate = taskStartDate.getDate() + '-' + (taskStartDate.getMonth()+1) + '-' + taskStartDate.getFullYear();
                          if (Object.keys(utilizationData).indexOf(formattedDate) > -1)
                          {
                            if (Object.keys(utilizationData[formattedDate]).indexOf(key) > -1) utilizationData[formattedDate][key] = utilizationData[formattedDate][key] + task.utilization;
                            else utilizationData[formattedDate][key] = task.utilization;
                          }
                          else
                          {
                            var dayUtilization = {};
                            dayUtilization['actualDate'] = new Date(taskStartDate);
                            dayUtilization[key] = task.utilization;
                            utilizationData[formattedDate] = dayUtilization;
                          }
                          if (Object.keys(utilizationData[formattedDate]).indexOf(key + '_tasks') > -1) utilizationData[formattedDate][key + '_tasks'] = utilizationData[formattedDate][key + '_tasks'] + '\n • ' + task.track + ': ' + task.taskName;
                          else utilizationData[formattedDate][key + '_tasks'] = ' • ' + task.track + ': ' + task.taskName;
                        }

                      }
                      else
                      {
                        var formattedDate = taskStartDate.getDate() + '-' + (taskStartDate.getMonth()+1) + '-' + taskStartDate.getFullYear();
                        if (Object.keys(utilizationData).indexOf(formattedDate) > -1)
                        {
                          if (Object.keys(utilizationData[formattedDate]).indexOf(key) > -1) utilizationData[formattedDate][key] = utilizationData[formattedDate][key] + task.utilization;
                          else utilizationData[formattedDate][key] = task.utilization;
                        }
                        else
                        {
                          var dayUtilization = {};
                          dayUtilization['actualDate'] = new Date(taskStartDate);
                          dayUtilization[key] = task.utilization;
                          utilizationData[formattedDate] = dayUtilization;
                        }
                        if (Object.keys(utilizationData[formattedDate]).indexOf(key + '_tasks') > -1) utilizationData[formattedDate][key + '_tasks'] = utilizationData[formattedDate][key + '_tasks'] + '\n • ' + task.track + ': ' + task.taskName;
                        else utilizationData[formattedDate][key + '_tasks'] = ' • ' + task.track + ': ' + task.taskName;
                      }
                      taskStartDate.setDate(taskStartDate.getDate() + 1);
                    }
                  }
                }
              }
            }
          }
        }

        var startCheckDate = new Date(this.state.lookBackDate);
        var endCheckDate = new Date(this.state.lookAheadDate);

        while (startCheckDate <= endCheckDate)
        {
          var formattedStartCheckDate = startCheckDate.getDate() + '-' + (startCheckDate.getMonth()+1) + '-' + startCheckDate.getFullYear();
          if (Object.keys(utilizationData).indexOf(formattedStartCheckDate) < 0)
          {
            if (startCheckDate.getDay() !== 0 && startCheckDate.getDay() !== 6) utilizationData[formattedStartCheckDate] = {"date":formattedStartCheckDate, 'actualDate':startCheckDate};
          }
          startCheckDate.setDate(startCheckDate.getDate() + 1);
        }

      var utilizationChartData = [];
      for (var [key, value] of Object.entries(utilizationData))
      {
        if (new Date(value.actualDate) >= new Date(this.state.lookBackDate))
        {
          for (var [subKey, subValue] of Object.entries(value))
          {
            if (subKey !== 'actualDate' && subKey.split('_')[1] !== 'tasks')
            {
              if(value.actualDate <= this.state.today && !isNaN(value[subKey])) pastUtilization = pastUtilization + value[subKey];
              if(value.actualDate > this.state.today && !isNaN(value[subKey])) futureUtilization = futureUtilization + value[subKey];
              value[subKey] = value[subKey]/3;
            }
          }
          value['date'] = key;
          utilizationChartData.push(value);
        }
      }

      utilizationChartData.sort(sortChartData);

      var chartWidth = 37;
      chartWidth = (parseInt(this.state.selectedLookBackPeriod.split(' ')[0]) + parseInt(this.state.selectedLookAheadPeriod.split(' ')[0])) * chartWidth;
      chartWidth = chartWidth.toString() + 'vw';

      var pastWorkingDays = parseInt(this.state.selectedLookBackPeriod.split(' ')[0]) * 5;
      pastUtilization = parseInt((pastUtilization/(pastWorkingDays * 3))*100);

      var futureWorkingDays = parseInt(this.state.selectedLookAheadPeriod.split(' ')[0]) * 5;
      futureUtilization = parseInt((futureUtilization/(futureWorkingDays * 3))*100);

      individualUtilizationUIArray.push(<div className='individual-utilization-row'>
                                          <div style={{background:teamMembervalue.color, borderColor:teamMembervalue.color}} className='individual-utilization-container'>
                                            <div className='team-member-name'>
                                              {teamMemberkey}
                                            </div>
                                            <div className='past-future-utilization-container'>
                                              <div className='past-future-utilization-row'>
                                                <div className='past-future-utilization-percentage'>
                                                  {pastUtilization}%
                                                </div>
                                                <div className='past-future-utilization-text'>
                                                  <span>Past</span>
                                                  <span>Utilization</span>
                                                </div>
                                              </div>
                                              <div className='past-future-utilization-row'>
                                                <div className='past-future-utilization-percentage'>
                                                  {futureUtilization}%
                                                </div>
                                                <div className='past-future-utilization-text'>
                                                  <span>Future</span>
                                                  <span>Utilization</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div style={{borderColor:teamMembervalue.color}} className='utilization-chart-wrapper'>
                                            <UtilizationViewChart chartID={teamMemberkey} chartData={utilizationChartData} projectsObject={projectsObject} chartWidth={chartWidth} lookBackDate={this.state.lookBackDate} today={this.state.today} lookAheadDate={this.state.lookAheadDate}/>
                                          </div>
                                        </div>)
      }
    }

    return (
      <div className='utilization-view-layout'>
        <div className='filter-cards-container'>
        <div className='team-members-selector-card'>
          <div className='look-ahead-selector-text'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Team Members</div>
          <FormControl>
            <Select multiple className={classes.select} value={this.state.selectedTeamMembers} style={{marginLeft:'1.2em',width:'17em', color:'gray', fontSize:'1.5em'}} onChange={this.onTeamMemberSelectionChanged}>
              {teamMembers}
            </Select>
          </FormControl>
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
            <div style={{marginLeft:'10%'}} className='look-ahead-selector-wrapper'>
            <div className='look-ahead-selector-text'>Look Ahead Period</div>
            <FormControl>
              <Select className={classes.select} value={this.state.selectedLookAheadPeriod} style={{width:'10em', color:'gray', fontSize:'1.5em'}} onChange={this.onLookAheadPeriodChanged}>
                {lookupPeriodArray}
              </Select>
            </FormControl>
            </div>
          </div>
          <div className='legend-card'>
            <div className='look-ahead-selector-text'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Project Legend</div>
            <div className='legend-wrapper'>
              {projectsLegend}
            </div>
          </div>
        </div>
        <div className='utilization-chart-container'>
          <div className='utilization-container-card'>
            {individualUtilizationUIArray}
          </div>
        </div>
      </div>
    );
  }

}

export default withStyles(styles)(UtilizationView);
