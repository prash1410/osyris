import React from 'react';
import './TaskCardContainer.css';

import TaskCard from './TaskCard/TaskCard.js';


class TaskCardContainer extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    var taskCardArray = [];
    var taskCardContainerHeader = null;
    var taskCardContainerHeaderColor = '';

    if (this.props.cardType === 'Not Started')
    {
      taskCardContainerHeaderColor = '#546E7A';
      taskCardContainerHeader = (<span style={{color:'white'}}>&nbsp;&nbsp;&nbsp;<i className="far fa-times-circle"></i>&nbsp;&nbsp;{this.props.cardType}</span>);
    }
    else if (this.props.cardType === 'In Progress')
    {
      taskCardContainerHeaderColor = '#FFA900';
      taskCardContainerHeader = (<span style={{color:'white'}}>&nbsp;&nbsp;&nbsp;<i className="far fa-clock"></i>&nbsp;&nbsp;{this.props.cardType}</span>);
    }
    else if (this.props.cardType === 'Completed')
    {
      taskCardContainerHeaderColor = '#00B74A';
      taskCardContainerHeader = (<span style={{color:'white'}}>&nbsp;&nbsp;&nbsp;<i className="far fa-check-circle"></i>&nbsp;&nbsp;{this.props.cardType}</span>);
    }

    for (var i = 0; i < this.props.taskArray.length; i++)
    {
      taskCardArray.push(<TaskCard editTaskHandler={this.props.editTaskHandler} deleteTaskHandler={this.props.deleteTaskHandler} taskClickHandler={this.props.taskClickHandler} task={this.props.taskArray[i]}/>);
    }

    return (
      <div className='task-card-container-layout'>
        <div style={{background:taskCardContainerHeaderColor}} className='task-card-header'>
          {taskCardContainerHeader}
        </div>
        <div className='task-card-scrollable-container'>
          <div className='task-card-container'>
            {taskCardArray}
          </div>
        </div>
      </div>
    );
  }

}

export default TaskCardContainer;
