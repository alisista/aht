import React, { Component } from 'react'

class Subheader extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let items_html = []
    for (let v of this.props.items) {
      let icon
      if (v.icon != undefined) {
        icon = <i className={`mr-2 ${v.fa_type || 'fa'} fa-${v.icon}`} />
      }
      let a
      if (v.href != undefined) {
        let active = ''
        let pathname = this.props.location.pathname.toLowerCase()
        if (v.active || pathname === v.href) {
          active = 'active'
        }
        let href = v.href
        a = (
          <a href={href} className={`nav-link ${active}`}>
            {icon}
            {v.name}
          </a>
        )
      } else {
        let active = ''
        if (v.key === this.props.component.state.tab) {
          active = 'active'
        }
        a = (
          <a
            onClick={() => {
              this.props.component.setState({ tab: v.key }, () => {
                if (v.func != undefined) {
                  v.func()
                }
              })
            }}
            className={`nav-link ${active}`}
          >
            {icon}
            {v.name}
          </a>
        )
      }
      items_html.push(
        <li className="nav-item" key={`topic-${v.key || 'all'}`}>
          {a}
        </li>
      )
    }
    return (
      <div className="header collapse d-lg-flex p-0" id="headerMenuCollapse">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg order-lg-first">
              <ul className="nav nav-tabs border-0 flex-column flex-lg-row">
                {items_html}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Subheader
