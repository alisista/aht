import React, { Component } from 'react'

class Alert extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let alerts = this.props.items || []
    let alert_html = []
    alerts.forEach((v, i) => {
      alert_html.push(
        <div
          role="alert"
          className={`alert alert-${v.type} ml-3 mr-3`}
          style={{ width: '100%' }}
        >
          <button
            type="button"
            className="close"
            onClick={() => {
              this.props.alerts.dissmissAlert(i)
            }}
          />
          {v.text}
        </div>
      )
    })

    return <div className="row">{alert_html}</div>
  }
}

export default Alert
