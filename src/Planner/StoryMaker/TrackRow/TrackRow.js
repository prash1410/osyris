import React from 'react';

import TaskCell from './TaskCell/TaskCell.js';

import './TrackRow.css';

class TrackRow extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    var trackRow = [];
    var dataArray = this.props.data;
    var styleArray = this.props.style;

    for (var columnCounter = 0; columnCounter < dataArray.length; columnCounter++)
    {
      var data = dataArray[columnCounter];
      var style = styleArray[columnCounter];

      trackRow.push(<TaskCell text={data['text']}
                              cellType = {data['cellType']}
                              date = {data['date']}
                              tracks = {data['tracks']}
                              trackIndex = {data['trackIndex']}
                              taskID = {data['taskID']}
                             startDate = {data['startDate']}
                             width={style['width']}
                             background={style['background']}
                             color={style['color']}
                             clickable={style['clickable']}
                             handler={this.props.handler}
                             trackNameChangehandler={this.props.trackNameChangehandler}
                             deleteTrackHandler={this.props.deleteTrackHandler} />);
    }
    return (
      <div className='track-row'>
        {trackRow}
      </div>
    );
  }
}

export default TrackRow;
