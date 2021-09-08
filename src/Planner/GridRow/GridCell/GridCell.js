import React from 'react';

import './GridCell.css';
import '../../../css/all.css';

import Popover from '@material-ui/core/Popover';

class GridCell extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {showPopup:false, popupAnchorElement:null};
    this.onGridCellHover = this.onGridCellHover.bind(this);
  }

  onGridCellHover(event)
  {
    console.log('fired');
    if (this.state.showPopup)
    {
      this.setState({popupAnchorElement: null,
                     showPopup: false});
    }
    else
    {
      this.setState({popupAnchorElement: event.currentTarget,
                     showPopup: true});
    }
  }

  createStory = event =>
  {
    this.props.handler({showStoryMaker:true,
                        payload:{startDate:this.props.startDate,
                                 project:this.props.project,
                                 projectColor:this.props.projectColor}});
  };

  editStory = event =>
  {
    this.props.editStoryHandler({showStoryMaker:true,
                                payload:{startDate:this.props.startDate,
                                         project:this.props.project,
                                         projectColor:this.props.projectColor,
                                         storyID:this.props.storyID}});
  };

  render()
  {
    const { width = '10em' } = this.props;
    const {background = '#444444'} = this.props;
    const {color = '#EDEDED'} = this.props;
    const {clickable = true} = this.props;
    const {project = null} = this.props;
    const {projectColor = 'black'} = this.props;
    const {cellType = 'blank-cell'} = this.props;

    var cellText = this.props.text;

    var cellLayout = (<div style={{ width: width}} className='grid-cell-container-hoverable'>
                        <div style={{ border: '0.2em solid', borderColor:background, background:background, color:color}} className='grid-cell'>
                          {cellText}
                        </div>
                        <div style={{ border: '0.2em solid', borderColor:projectColor }}className='overlay' onClick={this.createStory} >
                          <i style={{ color:projectColor}} className="fas fa-plus-circle fa-2x"></i>
                        </div>
                      </div>);

    if (!clickable)
    {
      cellLayout = (<div style={{ width: width}} className='grid-cell-container'>
                      <div style={{ border: '0.2em solid', borderColor:background, background:background, color:color}} className='grid-cell'>
                        {cellText}
                      </div>
                    </div>);
    }

    if (cellType === 'story-cell')
    {
      cellLayout = (<>
        <div onMouseEnter={() =>{console.log('enter')}} onMouseLeave={() =>{console.log('leave')}} style={{ width: width}} className='grid-cell-container-hoverable'>
                      <div style={{ border: '0.2em solid', borderColor:background, background:background, color:color}} className='grid-cell'>
                        {cellText}
                      </div>

                      <div style={{ border: '0.2em solid', borderColor:projectColor, background:projectColor }}className='overlay' onClick={this.editStory} >
                        <i style={{ color:'#EDEDED'}} className="fas fa-pencil-alt fa-2x"></i>
                      </div>
                    </div>
                    <Popover open={this.state.showPopup} anchorEl={this.state.popupAnchorElement} anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} transformOrigin={{vertical: 'top', horizontal: 'left'}} onClose={this.onGridCellHover} disableRestoreFocus>
                      Hello
                    </Popover>
                  </>);
    }

    return (
      <>{cellLayout}</>
    );
  }
}

export default GridCell;
