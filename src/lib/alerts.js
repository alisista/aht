class Alerts {
  constructor(component) {
    this.component = component
  }
  pushAlert(message, type = 'danger') {
    let alerts = this.component.state.alerts || []
    alerts.unshift({ type: type, text: message })
    this.component.setState({ alerts: alerts }, () => {})
  }
  dissmissAlert(i) {
    let alerts = this.component.state.alerts || []
    alerts.splice(i, 1)
    this.component.setState({ alerts: alerts })
  }
}

export default Alerts
