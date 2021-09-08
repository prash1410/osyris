import React from 'react';

import './Planner.css';

import cloneDeep from 'lodash/cloneDeep';

import GridRow from './GridRow/GridRow.js';
import StoryMaker from './StoryMaker/StoryMaker.js';
import Button from '@material-ui/core/Button';
import Ripples from 'react-ripples'

class Planner extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {showStoryMaker:false, selectedLevel:0, levelButtonsClasses:['level-button-week-active',
                                                             'level-button-month',
                                                             'level-button-quarter',
                                                             'level-button-year']};

    this.editStoryHandler = this.editStoryHandler.bind(this);
    this.cellClickhandler = this.cellClickhandler.bind(this);
  }

  cellClickhandler(argument)
  {
    this.setState(argument);
  }

  levelChanged = viewIndex =>
  {

    var viewClassList = this.state.levelButtonsClasses;
    for (var i = 0; i < viewClassList.length; i++)
    {
      viewClassList[i] = viewClassList[i].replace('-active', '');
      if (i === viewIndex) viewClassList[i] = viewClassList[i] + '-active';
    }

    this.setState({levelButtonsClasses:viewClassList, selectedLevel:viewIndex});
  };


  editStoryHandler(argument)
  {
    var project = argument.payload.project;
    var storyID = argument.payload.storyID;

    for (var story of this.props.projects[project].stories)
    {
      if (story.storyID === storyID)
      {
        argument.payload['storyMakerPayload'] = story;
        this.setState(argument);
        break;
      }
    }
  }

  render()
  {
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


    function getMonday(d, dateAsString)
    {
      d = new Date(d);
      var day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
      var firstDay = new Date(d.setDate(diff));
      if (dateAsString) return firstDay.getDate() + '-' + (firstDay.getMonth()+1) + '-' + firstDay.getFullYear();
      else return firstDay;
    }

    //var startIndex = mondays.indexOf(getMonday(new Date(2021,6,5), true));
    //var endIndex = mondays.indexOf(getMonday(new Date(2021,7,6), true));

    var cellWidth = 15;
    if (this.state.selectedLevel === 1) cellWidth = 20;
    else if (this.state.selectedLevel === 2) cellWidth = 25;
    else if (this.state.selectedLevel === 3) cellWidth = 30;

    var defaultGridCellStyle = {background: '#444444',
                                width: cellWidth.toString() + 'em',
                                color: '#EDEDED',
                                clickable:true};

    var defaultGridCellData = {text:'', cellType:'blank-cell'};

    var grid = [];

    var projectArray = [{'text':'Projects',
                         'background':'#444444',
                         'rowSpan':1}];

    var storiesArray = [];

    function sortAscending( a, b )
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

    for (let project in this.props.projects)
    {
      var rowCollector = [0];
      var stories = this.props.projects[project].stories;
      if (typeof stories !== 'undefined')
      {
        stories.sort(sortAscending);
        var projectStoriesArray = [];
        for (var story of stories)
        {
          var row = 0;
          var blackListedRows = [];

          var storyStartDate = new Date(story.startDate);
          var storyEndDate = new Date(story.endDate);

          var actualStoryStartMonday = getMonday(storyStartDate, false);
          var storyStartMonday = 'Week of ' + getOrdinal(actualStoryStartMonday.getDate()) + ' ' + actualStoryStartMonday.toLocaleString('en-us', {month:'short'});
          actualStoryStartMonday = actualStoryStartMonday.getDate() + '-' + (actualStoryStartMonday.getMonth()+1) + '-' + actualStoryStartMonday.getFullYear();

          var actualStoryEndMonday = getMonday(storyEndDate, false);
          var storyEndMonday = 'Week of ' + getOrdinal(actualStoryEndMonday.getDate()) + ' ' + actualStoryEndMonday.toLocaleString('en-us', {month:'short'});
          actualStoryEndMonday = actualStoryEndMonday.getDate() + '-' + (actualStoryEndMonday.getMonth()+1) + '-' + actualStoryEndMonday.getFullYear();

          if (this.state.selectedLevel === 1)
          {
            actualStoryStartMonday = new Date(storyStartDate.getFullYear(), storyStartDate.getMonth(), 1);
            storyStartMonday = actualStoryStartMonday.toLocaleString('en-us', {month:'short'}) + " '" + actualStoryStartMonday.getFullYear().toString().substr(-2);
            actualStoryStartMonday = actualStoryStartMonday.getDate() + '-' + (actualStoryStartMonday.getMonth()+1) + '-' + actualStoryStartMonday.getFullYear();

            actualStoryEndMonday = new Date(storyEndDate.getFullYear(), storyEndDate.getMonth(), 1);
            storyEndMonday = actualStoryEndMonday.toLocaleString('en-us', {month:'short'}) + " '" + actualStoryEndMonday.getFullYear().toString().substr(-2);
            actualStoryEndMonday = actualStoryEndMonday.getDate() + '-' + (actualStoryEndMonday.getMonth()+1) + '-' + actualStoryEndMonday.getFullYear();
          }
          else if (this.state.selectedLevel === 2)
          {
            var startingQuarter =  parseInt(storyStartDate.getMonth() / 3 ) + 1 ;
            actualStoryStartMonday = new Date(storyStartDate.getFullYear(), 3*(startingQuarter-1), 1);
            storyStartMonday = 'Q' + startingQuarter.toString() + " " + actualStoryStartMonday.getFullYear().toString();
            actualStoryStartMonday = actualStoryStartMonday.getDate() + '-' + (actualStoryStartMonday.getMonth()+1) + '-' + actualStoryStartMonday.getFullYear();

            var endingQuarter =  parseInt(storyEndDate.getMonth() / 3 ) + 1 ;
            actualStoryEndMonday = new Date(storyEndDate.getFullYear(), 3*(endingQuarter-1), 1);
            storyEndMonday = 'Q' + endingQuarter.toString() + " " + actualStoryEndMonday.getFullYear().toString();
            actualStoryEndMonday = actualStoryEndMonday.getDate() + '-' + (actualStoryEndMonday.getMonth()+1) + '-' + actualStoryEndMonday.getFullYear();
          }
          else if (this.state.selectedLevel === 3)
          {
            actualStoryStartMonday = new Date(storyStartDate.getFullYear(), 0, 1);
            storyStartMonday = actualStoryStartMonday.getFullYear().toString();
            actualStoryStartMonday = actualStoryStartMonday.getDate() + '-' + (actualStoryStartMonday.getMonth()+1) + '-' + actualStoryStartMonday.getFullYear();

            actualStoryEndMonday = new Date(storyEndDate.getFullYear(), 0, 1);
            storyEndMonday = actualStoryEndMonday.getFullYear().toString();
            actualStoryEndMonday = actualStoryEndMonday.getDate() + '-' + (actualStoryEndMonday.getMonth()+1) + '-' + actualStoryEndMonday.getFullYear();
          }

          if (projectStoriesArray.length > 0)
          {
            for (var pushedStory of projectStoriesArray)
            {
              var collisionFlag = 0;
              var pushedStartDate = new Date(pushedStory.storyStartDate);
              var pushedEndDate = new Date(pushedStory.storyEndDate);
              var pushedStartMonday = pushedStory.storyStartMonday;
              var pushedEndMonday = pushedStory.storyEndMonday;

              if (storyStartDate <= pushedEndDate && storyStartDate >= pushedStartDate) collisionFlag += 1;

              if (storyEndDate <= pushedEndDate && storyEndDate >= pushedStartDate) collisionFlag += 1;

              if (pushedStartDate <= storyEndDate && pushedStartDate >= storyStartDate) collisionFlag += 1;

              if (pushedEndDate <= storyEndDate && pushedEndDate >= storyStartDate) collisionFlag += 1;

              if (storyStartMonday === pushedStartMonday || storyStartMonday === pushedEndMonday) collisionFlag += 1;

              if (storyEndMonday === pushedStartMonday || storyEndMonday === pushedEndMonday) collisionFlag += 1;

              if (collisionFlag !== 0)
              {

                var pushedRow = pushedStory.row;
                blackListedRows.push(pushedRow);
                blackListedRows.sort(function(a, b) {return a - b;});

                for (var i = 0; i <= Math.max.apply(Math, blackListedRows); i++)
                {
                  if (i === Math.max.apply(Math, blackListedRows)) row = Math.max.apply(Math, blackListedRows) + 1
                  else if (blackListedRows.indexOf(i) < 0)
                  {
                    row = i;
                    break;
                  }
                }
              }
            }
            rowCollector.push(row);
          }

          projectStoriesArray.push({project:project,
                                     storyStartDate:storyStartDate,
                                     storyEndDate:storyEndDate,
                                     storyName:story.storyName,
                                     storyID:story.storyID,
                                     storyStartMonday:storyStartMonday,
                                     storyEndMonday:storyEndMonday,
                                     actualStoryStartMonday:actualStoryStartMonday,
                                     actualStoryEndMonday:actualStoryEndMonday,
                                     row:row});
        }
        for (var projectStory of projectStoriesArray)
        {
          storiesArray.push(projectStory);
        }
      }
      for (var i = 0; i <= Math.max.apply(Math, rowCollector); i++)
      {
        projectArray.push({'text':project, 'background':this.props.projects[project].color, 'row':i});
      }
    }

    console.log(storiesArray);
    var trackStartDate = getMonday(new Date(), false);
    var trackEndDate = new Date();

    if (this.state.selectedLevel === 0)
    {
      trackStartDate.setDate(trackStartDate.getDate() - 7);
      trackEndDate.setDate(trackEndDate.getDate() + 90);
      trackEndDate = getMonday(trackEndDate, false);
    }
    else if (this.state.selectedLevel === 1)
    {
      var date = new Date();
      trackStartDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      trackEndDate = new Date(date.getFullYear(), date.getMonth() + 2, 1);
    }
    else if (this.state.selectedLevel === 2)
    {
      var date = new Date();
      trackStartDate = new Date(date.getFullYear(), date.getMonth() - 3, 1);
      var startingQuarter =  parseInt(trackStartDate.getMonth() / 3 ) + 1 ;
      trackStartDate = new Date(trackStartDate.getFullYear(), 3*(startingQuarter-1), 1);

      trackEndDate = new Date(date.getFullYear(), date.getMonth() + 6, 1);
      var endingQuarter =  parseInt(trackEndDate.getMonth() / 3 ) + 1 ;
      trackEndDate = new Date(trackEndDate.getFullYear(), 3*(endingQuarter-1), 1);
    }
    else if (this.state.selectedLevel === 3)
    {
      var date = new Date();
      trackStartDate = new Date(date.getFullYear() - 1, 0, 1);
      trackEndDate = new Date(date.getFullYear() + 2, 0, 1);
    }


    if (storiesArray.length > 0)
    {
      var storiesStartArray = [];
      var storiesEndArray = [];

      for (var story of storiesArray)
      {
        storiesStartArray.push(story.storyStartDate);
        storiesEndArray.push(story.storyEndDate);
      }

      var firstStoryStartDate = new Date(Math.min.apply(null,storiesStartArray));
      var lastStoryEndDate = new Date(Math.max.apply(null,storiesEndArray));

      if (this.state.selectedLevel === 0)
      {
        trackStartDate = new Date(firstStoryStartDate);
        trackStartDate.setDate(trackStartDate.getDate() - 7);
        trackStartDate = getMonday(trackStartDate, false);

        trackEndDate = new Date(lastStoryEndDate);
        trackEndDate.setDate(trackEndDate.getDate() + 90);
        trackEndDate = getMonday(trackEndDate, false);
      }
      else if (this.state.selectedLevel === 1)
      {
        trackStartDate = new Date(firstStoryStartDate.getFullYear(), firstStoryStartDate.getMonth() - 1, 1);
        trackEndDate = new Date(lastStoryEndDate.getFullYear(), lastStoryEndDate.getMonth() + 2, 1);
      }
      else if (this.state.selectedLevel === 2)
      {
        trackStartDate = new Date(firstStoryStartDate.getFullYear(), firstStoryStartDate.getMonth() - 3, 1);
        var startingQuarter =  parseInt(trackStartDate.getMonth() / 3 ) + 1 ;
        trackStartDate = new Date(trackStartDate.getFullYear(), 3*(startingQuarter-1), 1);

        trackEndDate = new Date(lastStoryEndDate.getFullYear(), lastStoryEndDate.getMonth() + 6, 1);
        var endingQuarter =  parseInt(trackEndDate.getMonth() / 3 ) + 1 ;
        trackEndDate = new Date(trackEndDate.getFullYear(), 3*(endingQuarter-1), 1);
      }
      else if (this.state.selectedLevel === 3)
      {
        trackStartDate = new Date(firstStoryStartDate.getFullYear() - 1, 0, 1);
        trackEndDate = new Date(lastStoryEndDate.getFullYear() + 2, 0, 1);
      }
    }

    var mondays = [''];
    var formattedMondays = [''];

    if (this.state.selectedLevel === 0)
    {
      while (trackStartDate <= trackEndDate)
      {
          var pushDate = new Date(trackStartDate.getTime());
          var monday = pushDate.getDate() + '-' + (pushDate.getMonth()+1) + '-' + pushDate.getFullYear();
          //var formattedMonday = 'Week of ' + getOrdinal(pushDate.getDate()) + ' ' + pushDate.toLocaleString('en-us', {month:'short'}) + " '" + pushDate.getFullYear().toString().substr(-2);
          var formattedMonday = 'Week of ' + getOrdinal(pushDate.getDate()) + ' ' + pushDate.toLocaleString('en-us', {month:'short'});
          mondays.push(monday);
          formattedMondays.push(formattedMonday);
          trackStartDate.setDate(trackStartDate.getDate() + 7);
      }
    }

    if (this.state.selectedLevel === 1)
    {
      var months = [''];
      var formattedMonths = [''];
      while (trackStartDate <= trackEndDate)
      {
          var month = trackStartDate.getDate() + '-' + (trackStartDate.getMonth()+1) + '-' + trackStartDate.getFullYear();
          var formattedMonth = trackStartDate.toLocaleString('en-us', {month:'long'}) + " '" + trackStartDate.getFullYear().toString().substr(-2);
          months.push(month);
          formattedMonths.push(formattedMonth);
          trackStartDate = new Date(trackStartDate.getFullYear(), trackStartDate.getMonth() + 1, 1);
      }
      mondays = months;
      formattedMondays = formattedMonths;
    }

    if (this.state.selectedLevel === 2)
    {
      var quarters = [''];
      var formattedQuarters = [''];
      while (trackStartDate <= trackEndDate)
      {
          var quarter = trackStartDate.getDate() + '-' + (trackStartDate.getMonth()+1) + '-' + trackStartDate.getFullYear();
          var startingQuarter =  parseInt(trackStartDate.getMonth() / 3 ) + 1;
          var formattedQuarter = 'Q' + startingQuarter.toString() + " " + trackStartDate.getFullYear().toString();
          quarters.push(quarter);
          formattedQuarters.push(formattedQuarter);
          trackStartDate = new Date(trackStartDate.getFullYear(), trackStartDate.getMonth() + 3, 1);
      }
      mondays = quarters;
      formattedMondays = formattedQuarters;
    }

    if (this.state.selectedLevel === 3)
    {
      var years = [''];
      var formattedYears = [''];
      while (trackStartDate <= trackEndDate)
      {
          var year = trackStartDate.getDate() + '-' + (trackStartDate.getMonth()+1) + '-' + trackStartDate.getFullYear();
          var formattedYear = trackStartDate.getFullYear().toString();

          years.push(year);
          formattedYears.push(formattedYear);
          trackStartDate = new Date(trackStartDate.getFullYear() + 1, 0, 1);
      }
      mondays = years;
      formattedMondays = formattedYears;
    }

    for (var rowCounter = 0; rowCounter < projectArray.length; rowCounter++)
    {
      var dataArray = [];
      var styleArray = [];
      var dropIndices = [];

      for (var columnCounter = 0; columnCounter < mondays.length; columnCounter++)
      {
        var customGridCellStyle = cloneDeep(defaultGridCellStyle);
        var customGridCellData = cloneDeep(defaultGridCellData);

        customGridCellData['startDate'] = mondays[columnCounter];

        if(rowCounter === 0)
        {
          customGridCellData['text'] = formattedMondays[columnCounter];
          customGridCellData['cellType'] = 'date-cell';
          customGridCellStyle['clickable'] = false;
        }


        if (columnCounter === 0)
        {
          customGridCellData['text'] = projectArray[rowCounter].text;
          customGridCellData['cellType'] = 'project-cell';
          customGridCellStyle['background'] = projectArray[rowCounter].background;
          customGridCellStyle['clickable'] = false;
          customGridCellStyle['width'] = '15em';
        }

        customGridCellData['project'] = projectArray[rowCounter].text;
        customGridCellStyle['projectColor'] = projectArray[rowCounter].background;

        for (var story of storiesArray)
        {
          var startMondayIndex = mondays.indexOf(story.actualStoryStartMonday);
          var endMondayIndex = mondays.indexOf(story.actualStoryEndMonday);

          if ( columnCounter === startMondayIndex && customGridCellData['project'] === story.project && projectArray[rowCounter].row === story.row)
          {
            customGridCellData['text'] = story.storyName;
            customGridCellData['storyID'] = story.storyID;
            customGridCellData['cellType'] = 'story-cell';
            customGridCellStyle['background'] = projectArray[rowCounter].background;
            var newWidth = cellWidth * ((endMondayIndex - startMondayIndex) + 1);
            customGridCellStyle['width'] = newWidth.toString() + 'em';

            for (var i = startMondayIndex + 1; i <= endMondayIndex; i++) dropIndices.push(i);
          }
        }

        styleArray.push(customGridCellStyle);
        dataArray.push(customGridCellData);
      }

      dataArray = dataArray.filter(function(value, index)
      {
        return dropIndices.indexOf(index) == -1;
      });

      styleArray = styleArray.filter(function(value, index)
      {
        return dropIndices.indexOf(index) == -1;
      });

      grid.push(<GridRow data={dataArray} style={styleArray} handler={this.cellClickhandler} editStoryHandler={this.editStoryHandler} />)
    }

    var storyMaker = null;
    if (this.state.showStoryMaker)
    {
      console.log(this.state.payload);
      storyMaker = <StoryMaker handler={this.cellClickhandler} payload={this.state.payload} deleteStoryHandler={this.props.deleteStoryHandler} addStoryHandler={this.props.addStoryHandler} editStoryHandler={this.props.editStoryHandler} teamMembers={this.props.teamMembers}/>
    }

    return (
      <div className='planner-layout'>
        {storyMaker}
        <div className='level-buttons-container'>
          <div onClick={() => this.levelChanged(0)}  className={this.state.levelButtonsClasses[0]}>
            Weekly
          </div>
          <div className='blank-space'/>
          <div onClick={() => this.levelChanged(1)} className={this.state.levelButtonsClasses[1]}>
            Monthly
          </div>
          <div className='blank-space'/>
          <div onClick={() => this.levelChanged(2)} className={this.state.levelButtonsClasses[2]}>
            Quarterly
          </div>
          <div className='blank-space'/>
          <div onClick={() => this.levelChanged(3)} className={this.state.levelButtonsClasses[3]}>
            Yearly
          </div>
        </div>
        <div className='grid-container'>
          {grid}
        </div>
      </div>
    );
  }
}

export default Planner;
