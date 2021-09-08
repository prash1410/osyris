import React from 'react';

class ExistingTeamCard extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  teamSelect = team =>
  {
    this.props.teamSelect(team);
  };

  render()
  {
    return (<div onClick={() => this.teamSelect(this.props.team)} className='team-card-container'>
               <div className='team-card'>
                <span className='team-card-text'>{this.props.abbreviatedTeamName}</span>
               </div>
               <span className='team-full-name'>{this.props.team}</span>
             </div>
    );
  }

}

export default ExistingTeamCard;
