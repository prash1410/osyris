import React from 'react';
import './ProjectUpdates.css';


class ProjectUpdates extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    var storyUpdateCard = null;
    if (this.props.storyType === 'current')
    {
      storyUpdateCard = (<div className='story-update-card'>
                          <div style={{background:this.props.projectColor}} className='story-name-container'>
                            <span className='story-name-wrapper'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>{this.props.project}</strong>&nbsp;:&nbsp;{this.props.storyName}</span>
                          </div>
                          <div className='story-update-card-body'>
                            <div className='story-update-card-body-left-section'>
                              <div className='story-update-card-body-left-section-text'>&nbsp;<i style={{color:this.props.projectColor}} className="fas fa-calendar-day"></i>&nbsp;&nbsp;&nbsp;Story started on {this.props.formattedStartDate}</div>
                              <div className='story-update-card-body-left-section-text'>&nbsp;<i style={{color:this.props.projectColor}} className={this.props.storyStatus === 'Completed' ? "fas fa-check-circle" : "fas fa-hourglass-half"}></i>&nbsp;&nbsp;&nbsp;Story status: {this.props.storyStatus}</div>
                            </div>
                            <div className='ongoing-story-details-separator'/>
                            <div className='story-update-card-body-right-section'>
                              <div className='story-progress-section'>
                                <div className='story-progress-text'>Tasks completed: {this.props.completedTaskCount} of {this.props.taskCount}</div>
                                <div className='story-progress-bar-track'>
                                  <div style={{width:this.props.progress.toString() + '%'}} className='story-progress-bar'>
                                    <div className='story-progress-indicator'/>
                                  </div>
                                </div>
                              </div>
                              <div className='days-elapsed-section'>
                                <div className='days-elapsed-text'>Days elapsed: {this.props.daysElapsed} of {this.props.storyDaysCount}</div>
                                <div className='days-elapsed-bar-track'>
                                  <div style={{width:this.props.timeProgression.toString() + '%'}} className='days-elapsed-bar'>
                                    <div className='days-elapsed-indicator'/>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>);
    }
    else if (this.props.storyType === 'upcoming')
    {
      var daysToStart = 'Days to go: ' + this.props.eta.toString();
      if (this.props.eta === 0) daysToStart += ' day';
      else if (this.props.eta === 1) daysToStart += ' day';
      else if (this.props.eta > 1) daysToStart += ' days';

      var daysToComplete = 'Time to completion: ' + this.props.etc.toString();
      if (this.props.etc === 1) daysToComplete += ' day';
      else if (this.props.etc > 1) daysToComplete += ' days';

      storyUpdateCard = (<div className='story-upcoming-update-card'>
                          <div style={{background:this.props.projectColor}} className='story-name-container'>
                            <span className='story-name-wrapper'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>{this.props.project}</strong>&nbsp;:&nbsp;{this.props.storyName}</span>
                          </div>
                          <div className='story-details-section'>
                            <div className='story-start-icon'>
                              <i style={{color:this.props.projectColor}} className="fas fa-running fa-2x"></i>
                            </div>
                            <div className='story-start-details-section'>
                              <div className='story-start-text'>Story starts on {this.props.formattedStartDate}</div>
                              <div className='days-to-start-text'>{daysToStart}</div>
                            </div>
                            <div className='story-details-separator'/>
                            <div className='story-end-icon'>
                              <i style={{color:this.props.projectColor}} className="fas fa-flag-checkered fa-2x"></i>
                            </div>
                            <div className='story-end-details-section'>
                              <div className='story-end-text'>Story ends on {this.props.formattedEndDate}</div>
                              <div className='days-to-complete-text'>{daysToComplete}</div>
                            </div>
                          </div>
                        </div>);
    }
    return (<>{storyUpdateCard}</>);
  }

}

export default ProjectUpdates;
