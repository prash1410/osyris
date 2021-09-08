import React from 'react';
import axios from 'axios';

import cloneDeep from 'lodash/cloneDeep';

import './LandingPage.css';
import SummaryView from '../SummaryView/SummaryView.js';
import Planner from '../Planner/Planner.js';
import UtilizationView from '../UtilizationView/UtilizationView.js';
import TaskView from '../TaskView/TaskView.js';
import TeamManagementView from '../TeamManagementView/ManagementView.js';
import SettingsView from '../SettingsView/SettingsView.js';

class LandingPage extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {projects:null,
                  teamMembers:null,
                  leaves:null,
                  holidays:null,
                  viewClassList:['summary-button-container-active',
                                  'roadmap-button-container',
                                   'utilization-button-container',
                                   'task-view-button-container',
                                   'manage-team-button-container',
                                   'settings-button-container'],
                  viewHeaderList:['Delivery Summary', 'Roadmap', 'Utilization View', 'Task View', 'Team Management View', 'Settings View']};

    this.addStoryHandler = this.addStoryHandler.bind(this);
    this.editStoryHandler = this.editStoryHandler.bind(this);
    this.deleteStoryHandler = this.deleteStoryHandler.bind(this);
    this.taskViewerEditDeleteTask = this.taskViewerEditDeleteTask.bind(this);
    this.addDeleteLeaveHandler = this.addDeleteLeaveHandler.bind(this);
    this.addDeleteHolidayHandler = this.addDeleteHolidayHandler.bind(this);
    this.editProjectsHandler = this.editProjectsHandler.bind(this);
    this.editTeamHandler = this.editTeamHandler.bind(this);
  }

  viewButtonClick = viewIndex =>
  {

    var viewClassList = this.state.viewClassList;
    for (var i = 0; i < viewClassList.length; i++)
    {
      viewClassList[i] = viewClassList[i].replace('-active', '');
      if (i === viewIndex) viewClassList[i] = viewClassList[i] + '-active';
    }

    this.setState({viewClassList:viewClassList});
  };

  updateProjects(projects)
  {
    var projectData = new FormData();
    projectData.append('Team', this.props.selectedTeam);
    projectData.append('Projects', JSON.stringify(projects));

    axios.post(this.props.baseURL + 'update', projectData)
        .then(response =>
          {
            console.log(response.data);
          }
        )
        .catch(error =>
          {
            console.error('There was an error!', error);
          }
        );
  }

  addStoryHandler(argument)
  {
    var projects = cloneDeep(this.state.projects);
    var currentProject = projects[argument.project];
    var stories = [];
    if (typeof currentProject.stories !== 'undefined') stories = currentProject.stories;
    stories.push(argument);
    projects[argument.project].stories = stories;
    this.setState({projects:projects});

    this.updateProjects(projects);
  }

  editStoryHandler(argument)
  {
    var projects = cloneDeep(this.state.projects);
    var stories = projects[argument.project].stories;

    for (var i = 0; i < stories.length; i++)
    {
      if(stories[i].storyID === argument.storyID)
      {
        stories[i] = argument;
        break;
      }
    }
    projects[argument.project].stories = stories;
    this.setState({projects:projects});
    this.updateProjects(projects);
  }

  deleteStoryHandler(argument)
  {
    var projects = cloneDeep(this.state.projects);
    var stories = projects[argument.project].stories;

    for (var i = 0; i < stories.length; i++)
    {
      if(stories[i].storyID === argument.storyID)
      {
        stories.splice(i, 1);
        break;
      }
    }
    projects[argument.project].stories = stories;
    this.updateProjects(projects);
    this.setState({projects:projects});
  }

  getProjects()
  {
    var teamName = new FormData();
    teamName.append('Team', this.props.selectedTeam);

    axios.post(this.props.baseURL + 'projects', teamName)
        .then(response =>
          {
            this.setState({projects:response.data.projects,
                           teamMembers:response.data.team,
                           leaves:response.data.leaves,
                           holidays:response.data.holidays});
          }
        )
        .catch(error =>
          {
            console.error('There was an error!', error);
          }
        );
  }

  taskViewerEditDeleteTask(argument)
  {
    var projects = cloneDeep(argument);
    this.setState({projects:projects});
    this.updateProjects(projects);
  }

  updateLeaves(leaves)
  {
    var projectData = new FormData();
    projectData.append('Team', this.props.selectedTeam);
    projectData.append('Leaves', JSON.stringify(leaves));

    axios.post(this.props.baseURL + 'update-leaves', projectData)
        .then(response =>
          {
            console.log(response.data);
          }
        )
        .catch(error =>
          {
            console.error('There was an error updating leaves!', error);
          }
        );
  };

  addDeleteLeaveHandler(argument)
  {
    var leaves = cloneDeep(argument);
    this.setState({leaves:leaves});

    this.updateLeaves(leaves);
  };

  componentDidMount()
  {
    this.getProjects();
  };


  updateHolidays(holidays)
  {
    var projectData = new FormData();
    projectData.append('Team', this.props.selectedTeam);
    projectData.append('Holidays', JSON.stringify(holidays));

    axios.post(this.props.baseURL + 'update-holidays', projectData)
        .then(response =>
          {
            console.log(response.data);
          }
        )
        .catch(error =>
          {
            console.error('There was an error updating holidays!', error);
          }
        );
  };

  addDeleteHolidayHandler(argument)
  {
    var holidays = cloneDeep(argument);
    this.setState({holidays:holidays});

    this.updateHolidays(holidays);
  };

  editProjectsHandler(projects)
  {
    this.setState({projects:projects});
    this.updateProjects(projects);
  };

  updateTeam(team)
  {
    var teamData = new FormData();
    teamData.append('Team', this.props.selectedTeam);
    teamData.append('Team Members', JSON.stringify(team));

    axios.post(this.props.baseURL + 'update-team', teamData)
        .then(response =>
          {
            console.log(response.data);
          }
        )
        .catch(error =>
          {
            console.error('There was an error updating team!', error);
          }
        );
  };

  editTeamHandler(team)
  {
    this.setState({teamMembers:team});
    this.updateTeam(team);
  }

  render()
  {
    var selectedViewIndex = -1;
    var activeView = null;
    var viewList = this.state.viewClassList;
    if (this.state.projects !== null)
    {
      if (viewList[0].includes('active'))
      {
        selectedViewIndex = 0;
        activeView = (<SummaryView leaves={this.state.leaves} holidays={this.state.holidays} projects={this.state.projects} teamMembers={this.state.teamMembers}/>);
      }
      if (viewList[1].includes('active'))
      {
        selectedViewIndex = 1;
        activeView = (<Planner deleteStoryHandler={this.deleteStoryHandler} addStoryHandler={this.addStoryHandler} editStoryHandler={this.editStoryHandler} projects={this.state.projects} teamMembers={this.state.teamMembers}/>);
      }
      else if (viewList[2].includes('active'))
      {
        selectedViewIndex = 2;
        activeView = (<UtilizationView projects={this.state.projects} teamMembers={this.state.teamMembers}/>);
      }
      else if (viewList[3].includes('active'))
      {
        selectedViewIndex = 3;
        activeView = (<TaskView taskViewerEditDeleteTask={this.taskViewerEditDeleteTask} projects={this.state.projects} teamMembers={this.state.teamMembers}/>);
      }
      else if (viewList[4].includes('active'))
      {
        selectedViewIndex = 4;
        activeView = (<TeamManagementView
                       projects={this.state.projects}
                       teamMembers={this.state.teamMembers}
                       leaves={this.state.leaves}
                       addDeleteLeaveHandler={this.addDeleteLeaveHandler}
                       holidays={this.state.holidays}
                       addDeleteHolidayHandler={this.addDeleteHolidayHandler}
                       editTeamHandler={this.editTeamHandler}
                       editProjectsHandler={this.editProjectsHandler}/>);
      }
      else if (viewList[5].includes('active'))
      {
        selectedViewIndex = 5;
        activeView = (<SettingsView/>);
      }
    }

    return (
      <div className='landing-page-layout'>
        <div className='sidebar'>
          <i style={{marginTop:'0.6em'}} onClick={this.props.goToHome} className="fas fa-home fa-2x home-button"></i>
          <div onClick={() => this.viewButtonClick(0)} className={this.state.viewClassList[0]}>
            <i className="fas fa-book-reader fa-lg"></i>
          </div>
          <div onClick={() => this.viewButtonClick(1)} className={this.state.viewClassList[1]}>
            <i className="fas fa-road fa-lg"></i>
          </div>
          <div onClick={() => this.viewButtonClick(2)} className={this.state.viewClassList[2]}>
            <i className="fas fa-tachometer-alt fa-lg"></i>
          </div>
          <div onClick={() => this.viewButtonClick(3)} className={this.state.viewClassList[3]}>
            <i className="fas fa-tasks fa-lg"></i>
          </div>
          <div onClick={() => this.viewButtonClick(4)} className={this.state.viewClassList[4]}>
            <i className="fas fa-users fa-lg"></i>
          </div>
          <div onClick={() => this.viewButtonClick(5)} className={this.state.viewClassList[5]}>
            <i className="fas fa-cog fa-lg"></i>
          </div>
        </div>
        <div className='view-container'>
          <div className='top-nav'>
            <span style={{marginLeft:'5em'}}> {this.props.selectedTeam}: {this.state.viewHeaderList[selectedViewIndex]} </span>
          </div>
          {activeView}
        </div>
      </div>
    );
  }
}

export default LandingPage;
