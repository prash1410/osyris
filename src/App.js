import React from 'react';
import axios from 'axios';

import './App.css';
import './css/all.css';


import reactCSS from 'reactcss';
import { SketchPicker } from 'react-color';

import NewTeamDetailsRow from './NewTeamDetailsRow/NewTeamDetailsRow.js';
import ExistingTeamCard from './ExistingTeamCard/ExistingTeamCard.js';
import LandingPage from './LandingPage/LandingPage.js';


class App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.baseURL = 'http://192.168.0.109:5000/';
    this.defaultColor = {r: '241', g: '112', b: '19', a: '1'};
    this.state = {showLandingPage:false,
                  teams:[],
                  selectedTeam:null,
                  showNewTeamUI:false,
                  clickedRowType:null,
                  clickedRowIndex:null,
                  teamMembersArray:['', '', '', ''],
                  teamMembersColorArray:[this.defaultColor,
                                         this.defaultColor,
                                         this.defaultColor,
                                         this.defaultColor],
                  projectsArray:['', '', '', ''],
                  projectsColorArray:[this.defaultColor,
                                         this.defaultColor,
                                         this.defaultColor,
                                         this.defaultColor],
                  teamName:'',
                  teamPasskey:'',
                  showRowColorPicker: false,

                  showErrorLayout:false,
                  errors:[]};

    this.editTeamMemberName = this.editTeamMemberName.bind(this);
    this.removeTeamMember = this.removeTeamMember.bind(this);
    this.editProjectName = this.editProjectName.bind(this);
    this.removeProject = this.removeProject.bind(this);
    this.showHideRowColorPicker = this.showHideRowColorPicker.bind(this);
    this.teamSelect = this.teamSelect.bind(this);
    this.goToHome = this.goToHome.bind(this);
  }

  componentDidMount()
  {
    axios.get(this.baseURL + 'teams')
        .then(response =>
          {
            this.setState({teams:response.data});
          }
        )
        .catch(error =>
          {
            console.error('There was an error fetching teams!', error);
          }
        );
  }

  onColorPick = (color) =>
  {
    if (this.state.clickedRowType === 'Team Member')
    {
      var teamMembersColorArray = this.state.teamMembersColorArray;
      teamMembersColorArray[this.state.clickedRowIndex] = color.rgb;
      this.setState({ teamMembersColorArray: teamMembersColorArray });
    }
    else
    {
      var projectsColorArray = this.state.projectsColorArray;
      projectsColorArray[this.state.clickedRowIndex] = color.rgb;
      this.setState({ projectsColorArray: projectsColorArray });
    }
  };

  dismissColorPicker = (event) =>
  {
    this.setState({showRowColorPicker:false})
  }

  editTeamMemberName(argument)
  {
    var teamMembersArray = this.state.teamMembersArray;
    teamMembersArray[argument.index] = argument.value;
    this.setState({teamMembersArray:teamMembersArray});
  }

  showHideRowColorPicker(argument)
  {
    this.setState({showRowColorPicker:!this.state.showRowColorPicker, clickedRowType:argument.type, clickedRowIndex:argument.index});
  }

  removeTeamMember(argument)
  {
    var teamMembersArray = this.state.teamMembersArray;
    teamMembersArray.splice(argument, 1);
    var teamMembersColorArray = this.state.teamMembersColorArray;
    teamMembersColorArray.splice(argument, 1);
    this.setState({teamMembersArray:teamMembersArray, teamMembersColorArray: teamMembersColorArray});
  }

  editProjectName(argument)
  {
    var projectsArray = this.state.projectsArray;
    projectsArray[argument.index] = argument.value;
    this.setState({projectsArray:projectsArray});
  }

  removeProject(argument)
  {
    var projectsArray = this.state.projectsArray;
    projectsArray.splice(argument, 1);
    var projectsColorArray = this.state.projectsColorArray;
    projectsColorArray.splice(argument, 1);
    this.setState({projectsArray:projectsArray, projectsColorArray:projectsColorArray});
  }

  addTeamMember = event =>
  {
    var teamMembersArray = this.state.teamMembersArray;
    teamMembersArray.push('');
    var teamMembersColorArray = this.state.teamMembersColorArray;
    teamMembersColorArray.push(this.defaultColor);
    this.setState({teamMembersArray:teamMembersArray, teamMembersColorArray: teamMembersColorArray});
  };

  addProject = event =>
  {
    var projectsArray = this.state.projectsArray;
    projectsArray.push('');
    var projectsColorArray = this.state.projectsColorArray;
    projectsColorArray.push(this.defaultColor);
    this.setState({projectsArray:projectsArray, projectsColorArray:projectsColorArray});
  };

  onTeamNameChanged = event =>
  {
    this.setState({teamName:event.target.value});
  };

  onTeamPasskeyChanged = event =>
  {
    this.setState({teamPasskey:event.target.value});
  };

  createTeam = event =>
  {
    this.setState({showNewTeamUI:true});
  };

  discardChanges = event =>
  {
    this.setState({showNewTeamUI:false});
  };

  teamSelect(argument)
  {
    this.setState({selectedTeam:argument, showLandingPage:true});
  };


  saveChanges = event =>
  {
    var validationSuccessful = true;
    var errorMessage = [];
    var newTeamName = this.state.teamName;
    var teamPasskey = this.state.teamPasskey;

    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('');

    for (var team of this.state.teams)
    {
      if (newTeamName.toUpperCase().trim() === team.toUpperCase().trim())
      {
        errorMessage.push('New team name cannot be same as any of the existing teams');
        validationSuccessful = false;
        break;
      }
    }

    if (newTeamName.length < 3)
    {
      errorMessage.push("New team name must be greater or equal to 3 characters");
      validationSuccessful = false;
    }

    if (teamPasskey.length < 8)
    {
      errorMessage.push("Passkey's length cannot be lesser than 8 characters");
      validationSuccessful = false;
    }
    if (/\s/g.test(teamPasskey))
    {
      errorMessage.push("Passkey cannot contain any spaces");
      validationSuccessful = false;
    }

    var teamMembersArray = [];
    var team = {};
    for (var i = 0; i < this.state.teamMembersArray.length; i++)
    {
      var teamMember = this.state.teamMembersArray[i];
      if (teamMember.trim() !== '' && teamMember.trim() !== ' ')
      {
        if (!/^[a-zA-Z ]{3,30}$/.test(teamMember))
        {
          errorMessage.push('Team member name length cannot be lesser than 3 or greater than 30 characters or contain any special characters');
          validationSuccessful = false;
          break;
        }
        else
        {
          if (teamMembersArray.indexOf(teamMember.toUpperCase().trim()) < 0 )
          {
            teamMembersArray.push(teamMember.toUpperCase().trim())
            var r = parseInt(this.state.teamMembersColorArray[i].r);
            var g = parseInt(this.state.teamMembersColorArray[i].g);
            var b = parseInt(this.state.teamMembersColorArray[i].b);
            team[teamMember.trim()] = {color:rgbToHex(r, g, b)};
          }
          else
          {
            errorMessage.push('Team members cannot have duplicate or blank names');
            validationSuccessful = false;
            break;
          }
        }
      }
    }
    if (teamMembersArray.length === 0)
    {
      errorMessage.push('At least one team member needs to be added in the team');
      validationSuccessful = false;
    }


    var projectsArray = [];
    var projects = {};
    for (var i = 0; i < this.state.projectsArray.length; i++)
    {
      var project = this.state.projectsArray[i];
      if (project.trim() !== '' && project.trim() !== ' ')
      {
        if (!/^[a-zA-Z ]{3,30}$/.test(project))
        {
          errorMessage.push('Project name length cannot be lesser than 3 or greater than 30 characters or contain any special characters');
          validationSuccessful = false;
          break;
        }
        else
        {
          if (projectsArray.indexOf(project.toUpperCase().trim()) < 0)
          {
            projectsArray.push(project.toUpperCase().trim());
            var r = parseInt(this.state.projectsColorArray[i].r);
            var g = parseInt(this.state.projectsColorArray[i].g);
            var b = parseInt(this.state.projectsColorArray[i].b);
            projects[project.trim()] = {color:rgbToHex(r, g, b)};
          }
          else
          {
            errorMessage.push('Projects cannot have duplicate or blank names');
            validationSuccessful = false;
            break;
          }
        }
      }
    }
    if (projectsArray.length === 0)
    {
      errorMessage.push('At least one project needs to be added in the team');
      validationSuccessful = false;
    }

    if (!validationSuccessful) this.setState({showErrorLayout:true, errors:errorMessage});
    else
    {
      var newTeamData = {};
      newTeamData[newTeamName] = {team:team, projects:projects, passkey:teamPasskey, leaves:[], holidays:[]};
      this.addTeam(newTeamData, newTeamName);
    }

  }

  addTeam(teamData, teamName)
  {
    var teamFormData = new FormData();
    teamFormData.append('Team Data', JSON.stringify(teamData));

    axios.post(this.baseURL + 'add-team', teamFormData)
        .then(response =>
          {
            if (response.data === 'Team added successfully')
            {
              var teams = this.state.teams;
              teams.push(teamName);
              this.setState({showLandingPage:true,
                              teams:teams,
                              selectedTeam:teamName,
                              showNewTeamUI:false,
                              clickedRowType:null,
                              clickedRowIndex:null,
                              teamMembersArray:['', '', '', ''],
                              teamMembersColorArray:[this.defaultColor,
                                                     this.defaultColor,
                                                     this.defaultColor,
                                                     this.defaultColor],
                              projectsArray:['', '', '', ''],
                              projectsColorArray:[this.defaultColor,
                                                     this.defaultColor,
                                                     this.defaultColor,
                                                     this.defaultColor],
                              teamName:'',
                              teamPasskey:'',
                              showRowColorPicker: false,

                              showErrorLayout:false,
                              errors:[]});
            }
            else(console.error('Unexpected response from server'));
          }
        )
        .catch(error =>
          {
            console.error('There was an error adding new team!', error);
          }
        );
  }

  goToHome(argument)
  {
    this.setState({showLandingPage:false});
  }

  dismissErrorLayout = (event) =>
  {
    this.setState({showErrorLayout:false, errors:[]});
  }

  render()
  {
    var landingPage = null;
    var defaultSection = null;
    var existingTeams = null;

    if (this.state.showLandingPage) landingPage = <LandingPage goToHome={this.goToHome} baseURL={this.baseURL} selectedTeam={this.state.selectedTeam} />;
    else
    {
      if (!this.state.showNewTeamUI)
      {
        if (this.state.teams.length > 0)
        {
          var teamCardArray = [];
          for (var team of this.state.teams)
          {
            var abbreviatedTeamName = team;
            if (/\s/g.test(abbreviatedTeamName)) abbreviatedTeamName = team.toUpperCase().match(/\b([A-Z])/g).join('');
            teamCardArray.push(<ExistingTeamCard team={team} abbreviatedTeamName={abbreviatedTeamName} teamSelect={this.teamSelect}/>);
          }

          existingTeams = (<>
                              <div className='existing-teams'>
                                <span className='existing-teams-text'> &nbsp;&nbsp;&nbsp;&nbsp;Select Your Team </span>
                                <div className='team-cards-container'>
                                  {teamCardArray}
                                </div>
                              </div>
                              <div className='team-section-divider'/>
                            </>)
        }
        defaultSection = (<>
                            <div className='app-logo'>
                              OSYRIS
                            </div>
                            <div className='about-osyris'>
                              Osyris offers a highly interactive and visual platform for efficient project management
                              <br/>From managing daily tasks to tracking team utilization and much more, Osyris covers all
                              <br/>Select a team below or create new one to get started
                            </div>
                              <div className='lower-section'>
                              {existingTeams}
                              <div className='new-team'>
                                <span className='new-team-text'> &nbsp;&nbsp;&nbsp;&nbsp;Create a New Team </span>
                                <div onClick={this.createTeam} className='team-card-container'>
                                 <div className='team-card'>
                                  <span className='team-card-text'>&nbsp;&nbsp;+&nbsp;&nbsp;</span>
                                 </div>
                                 <span className='team-full-name'>New Team</span>
                               </div>
                              </div>
                            </div>
                        </>);
      }
      else
      {
        var teamMembersArray = [];
        for (var i = 0; i < this.state.teamMembersArray.length; i++)
        {
          teamMembersArray.push(<NewTeamDetailsRow index={i}
                                                   type='Team Member'
                                                   value={this.state.teamMembersArray[i]}
                                                   editTeamMemberName={this.editTeamMemberName}
                                                   removeTeamMember={this.removeTeamMember}
                                                   showHideRowColorPicker={this.showHideRowColorPicker}
                                                   rowColor={this.state.teamMembersColorArray[i]} />);
        }

        var projectsArray = [];
        for (var i = 0; i < this.state.projectsArray.length; i++)
        {
          projectsArray.push(<NewTeamDetailsRow index={i}
                                                type='Project'
                                                value={this.state.projectsArray[i]}
                                                editProjectName={this.editProjectName}
                                                removeProject={this.removeProject}
                                                showHideRowColorPicker={this.showHideRowColorPicker}
                                                rowColor={this.state.projectsColorArray[i]}/>);
        }

        var colorPicker = (<SketchPicker className='color-picker' color={ this.state.teamMembersColorArray[this.state.clickedRowIndex] } onChange={ this.onColorPick } />);
        if (this.state.clickedRowType !== 'Team Member') colorPicker = (<SketchPicker className='color-picker' color={ this.state.projectsColorArray[this.state.clickedRowIndex] } onChange={ this.onColorPick } />);

        var errorLayout = null;
        if ( this.state.showErrorLayout && this.state.errors.length > 0 )
        {
          var errors = [];

          for ( var error of this.state.errors)
          {
            errors.push(<div className='error-row'>{error}</div>);
          }

          errorLayout = (<div className='error-layout-container' onClick={this.dismissErrorLayout}>
                          <div className='error-layout-header'>
                            <i className="fas fa-exclamation-triangle"></i>
                            &nbsp;&nbsp;
                            <div className='error-layout-header-text'>Please rectify the following error(s):</div>
                          </div>
                          {errors}
                        </div>);
        }
        defaultSection = (<>
                          { this.state.showRowColorPicker ?
                            <div className='color-picker-cover' >
                              <div className='dismiss-color-picker' onClick={this.dismissColorPicker}/>
                              {colorPicker}
                            </div> : null }
                          { this.state.showErrorLayout ?
                            <div className='error-layout' >
                              <div className='dismiss-error-layout' onClick={this.dismissErrorLayout}/>
                              {errorLayout}
                            </div> : null }
                          <div className='new-team-ui-container'>
                            <div className='app-logo-alt'>
                              OSYRIS
                            </div>
                            <div className='header-container'>
                              <div className='create-team-text'>
                                Create a New Team:
                              </div>
                              <input onChange={this.onTeamNameChanged} value={this.state.teamName} className='team-name-input' placeholder='Team Name' type='text'/>
                              <input onChange={this.onTeamPasskeyChanged} value={this.state.teamPasskey} className='team-name-input' placeholder='Team Passkey' type='password'/>
                              <div onClick={this.saveChanges} className='save-changes-button'>
                                <i className="far fa-check-circle"></i> &nbsp;Create Team
                              </div>
                              <div onClick={this.discardChanges} className='discard-changes-button'>
                                <i className="fas fa-angle-left"></i> &nbsp;Go Back
                              </div>
                            </div>
                            <div className='team-details-container'>
                              <div className='team-members-container'>
                                Team Members
                                <div className='team-members-layout'>
                                  {teamMembersArray}
                                  <div className='add-team-member-button-container'>
                                    <div onClick={this.addTeamMember} className='add-team-member-button'>
                                      <i className="fas fa-user-plus"></i> &nbsp;&nbsp;Add Team Member
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className='project-details-container'>
                                Projects
                                <div className='project-details-layout'>
                                  {projectsArray}
                                  <div className='add-project-button-container'>
                                    <div onClick={this.addProject} className='add-project-button'>
                                      <i className="fas fa-project-diagram"></i> &nbsp;&nbsp;Add Project
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>)
      }



      landingPage = (<div className='home-page'>
                      <ul className="circles">
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                      </ul>
                      {defaultSection}
                    </div>)
    }
    return (
      <>
        {landingPage}
      </>
    );
  }

}

export default App;
