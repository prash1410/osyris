import React from 'react';

import './HolidayCard.css';

class HolidayCard extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  deleteHoliday = event =>
  {
    this.props.deleteHoliday(this.props.holiday);
  };

  render()
  {
    return (
            <div className='holiday-row'>
               <div className='holiday-name-wrapper'>{this.props.holiday.holiday}</div>
               <div className='holiday-date-wrapper'>{this.props.formattedHolidayStartDate}&nbsp;&nbsp;&nbsp;&nbsp;<i onClick={this.deleteHoliday} className="fas fa-trash-alt delete-holiday-button"></i></div>
             </div>
    );
  }

}

export default HolidayCard;
