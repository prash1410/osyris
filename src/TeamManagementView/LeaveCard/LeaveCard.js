import React from 'react';


class LeaveCard extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  deleteLeave = event =>
  {
    this.props.deleteLeave(this.props.leave);
  };

  render()
  {
    return (
            <div className='leave-card'>
                <div className='leave-card-right-section'>
                  <div style={{background:this.props.teamMembers[this.props.leave.teamMember].color}} className='team-member-name-wrapper'>
                    &nbsp;&nbsp;&nbsp;{this.props.leave.teamMember}
                    <div className='delete-leave-button-container'>
                      <i onClick={this.deleteLeave} className="fas fa-trash-alt delete-leave-button"></i>&nbsp;&nbsp;&nbsp;
                    </div>
                  </div>
                  <div className='leave-details-section'>
                    <div className='leave-icon-container'>
                      <i style={{ color:'lightgray'}} className={this.props.leave.leaveType === 'Casual' ? "fas fa-umbrella-beach fa-2x" : "fas fa-user-md fa-2x"}></i>
                    </div>
                    <div className='days-count-section'>
                      {this.props.leave.days} {this.props.leave.days > 1 ? "days" : "day"}
                    </div>
                    <div className='leave-days-section'>
                      <div className='leave-start-date'>
                        From: {this.props.formattedLeaveStartDate}
                      </div>
                      <div className='leave-end-date'>
                        Until: {this.props.formattedLeaveEndDate}
                      </div>
                    </div>

                  </div>
                </div>
               </div>
    );
  }

}

export default LeaveCard;
