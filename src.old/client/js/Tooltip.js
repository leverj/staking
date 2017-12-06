import React from 'react'

const Tooltip = ({position, message}) => {
  return (
    <span className="help-icon" data-toggle="tooltip" data-placement={position || "top"} title={message}>?</span>
  )
}

export default Tooltip
