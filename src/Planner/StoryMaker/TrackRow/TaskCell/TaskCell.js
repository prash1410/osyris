import React from 'react';

import './TaskCell.css';
import '../../../../css/all.css';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


class TaskCell extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {menuAnchorElement:null,
                  showMenu:false};

    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.deleteTrack = this.deleteTrack.bind(this);
  }

  showMenu(event)
  {
    this.setState({menuAnchorElement: event.currentTarget,
                   showMenu: !this.state.showMenu});
  };

  closeMenu(event)
  {
    this.setState({menuAnchorElement: null,
                   showMenu: !this.state.showMenu});
  };

  deleteTrack(event)
  {
    this.props.deleteTrackHandler(this.props.trackIndex);
    this.closeMenu();
  };

  createStory = event =>
  {
    this.props.handler({showTaskCreator:true,
                        taskCreatorPayload:{startDate:this.props.date,
                                            trackIndex:this.props.trackIndex,
                                            taskID:this.props.taskID}});
  };

  onTrackNameChange = event =>
  {
    var tracks = this.props.tracks;
    tracks[this.props.trackIndex] = event.target.value;
    this.props.trackNameChangehandler({tracks:tracks});
  };

  render()
  {
    const { width = '15em' } = this.props;
    const {background = '#444444'} = this.props;
    const {color = '#EDEDED'} = this.props;
    const {clickable = true} = this.props;
    const {cellType = ''} = this.props;
    var cellText = this.props.text;

    var cellLayout = (<div style={{ width: width}} className='task-cell-container-hoverable'>
                        <div style={{ background:background, color:color}} className='task-cell'>
                          {cellText}
                        </div>
                        <div className='task-cell-overlay' onClick={this.createStory} >
                          <i className="fas fa-plus-circle fa-2x"></i>
                        </div>
                      </div>);

    if (!clickable)
    {
      cellLayout = (<div style={{ width: width}} className='task-cell-container'>
                      <div style={{ background:background, color:color}} className='task-cell'>
                        {cellText}
                      </div>
                    </div>);
    }

    if (!clickable && cellType === 'track-cell')
    {
      cellLayout = (<div style={{ width: width}} className='task-cell-container'>
                      <div style={{ background:background, color:color}} className='task-cell'>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <input onChange={this.onTrackNameChange} className='track-name-input' defaultValue={cellText} type='text'/>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <i onClick={this.showMenu} className="fas fa-ellipsis-v fa-lg track-menu"></i>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                      </div>
                      <Menu id="fade-menu" anchorEl={this.state.menuAnchorElement} open={this.state.showMenu} onClose={this.closeMenu} keepMounted>
                        <MenuItem onClick={this.deleteTrack}><span className='delete-menu-item'><i className="fas fa-trash-alt"></i>&nbsp;&nbsp;Delete Track</span></MenuItem>
                      </Menu>
                    </div>);
    }

    if (cellType === 'filled-cell')
    {
      cellLayout = (<div style={{ width: width}} className='task-cell-container-hoverable'>
                      <div style={{ background:background, color:color}} className='task-cell'>
                        {cellText}
                      </div>
                      <div style={{ background:background}} className='task-cell-overlay' onClick={this.createStory} >
                        <i className="fas fa-pencil-alt fa-2x"></i>
                      </div>
                    </div>);
    }


    return (
      <>{cellLayout}</>
    );
  }
}

export default TaskCell;
