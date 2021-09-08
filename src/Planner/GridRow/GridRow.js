import React from 'react';

import GridCell from './GridCell/GridCell.js';

import './GridRow.css';

class GridRow extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    var gridRow = [];
    var dataArray = this.props.data;
    var styleArray = this.props.style;

    for (var columnCounter = 0; columnCounter < dataArray.length; columnCounter++)
    {
      var data = dataArray[columnCounter];
      var style = styleArray[columnCounter];

      gridRow.push(<GridCell text={data['text']}
                             cellType={data['cellType']}
                             storyID={data['storyID']}
                             project={data['project']}
                             projectColor={style['projectColor']}
                             startDate = {data['startDate']}
                             width={style['width']}
                             background={style['background']}
                             color={style['color']}
                             clickable={style['clickable']}
                             handler={this.props.handler}
                             editStoryHandler={this.props.editStoryHandler}/>);
    }

    return (
      <div className='grid-row'>
        {gridRow}
      </div>
    );
  }
}

export default GridRow;
