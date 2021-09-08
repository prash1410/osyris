import React from 'react';

import './TeamManagementRow.css';
import '../../css/all.css';
import reactCSS from 'reactcss';

class TeamManagementRow extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  changeTeamMemberName = (event) =>
  {
    this.props.changeTeamMemberName({index:this.props.index, type:this.props.type, oldName:this.props.value});
  };

  changeProjectName = (event) =>
  {
    this.props.editProjectName({index:this.props.index, type:this.props.type, oldName:this.props.value});
  };


  showHideRowColorPicker = (event) =>
  {
    this.props.showHideRowColorPicker({index:this.props.index, type:this.props.type});
  }

  removeTeamMember = event =>
  {
    //this.setState({selectedTeam:team, showLandingPage:true});
    this.props.removeTeamMember(this.props.index);
  };

  removeProject = event =>
  {
    //this.setState({selectedTeam:team, showLandingPage:true});
    this.props.removeProject(this.props.index);
  };

  render()
  {
    const styles = reactCSS({
      'default': {
        color: {
          width: '1.3em',
          height: '1.3em',
          borderRadius: '2px',
          background: `rgba(${ this.props.rowColor.r }, ${ this.props.rowColor.g }, ${ this.props.rowColor.b }, ${ this.props.rowColor.a })`,
        },
        swatch: {
          marginRight:'1em',
          padding: '1px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'relative',
          right:'0',
          top:'0',
          zIndex:'90'
        },
        cover: {
          position: 'absolute',
          top: '0px',
          left: '0px',
          background: 'rgba(0, 0, 0, .2)',
          zIndex:'70',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent:'center',
          alignItems: 'center'
        },
      },
    });

    var row = <div className='team-management-row'>
                <div className='row-wrapper'>
                  <input onFocus={this.changeTeamMemberName} value={this.props.value} className='team-management-row-input' placeholder='Name' type='text'/>
                  <div style={ styles.swatch } onClick={this.showHideRowColorPicker}>
                    <div style={ styles.color } />
                  </div>
                  <i onClick={this.removeTeamMember} className="far fa-times-circle team-management-row-delete-button"></i>
                </div>
              </div>

    if (this.props.type !== 'Team Member')
    {
      row = <div className='team-management-row'>
                  <div className='row-wrapper'>
                    <input onFocus={this.changeProjectName} value={this.props.value} className='team-management-row-input' placeholder='Project Name' type='text'/>
                    <div style={ styles.swatch } onClick={this.showHideRowColorPicker}>
                      <div style={ styles.color } />
                    </div>
                    <i onClick={this.removeProject} className="far fa-times-circle team-management-row-delete-button"></i>
                  </div>
                </div>
    }
    return (<>{row}</>);
  }

}

export default TeamManagementRow;
