import React from 'react'

class StatusBar extends React.Component {
  render () {
    return (
      <div>{this.props.sale ? "Sale Contract Address:" + this.props.sale : ""}</div>
    )
  }
}
export default StatusBar
