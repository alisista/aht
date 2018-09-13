import React, { Component } from 'react'

class Header_Home extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let user
    if (this.props.user != undefined) {
      let aht = '0.00000000'
      if (
        this.props.serverInfo != undefined &&
        this.props.serverInfo.amount != undefined &&
        this.props.serverInfo.amount.aht != undefined
      ) {
        aht = `${this.props.serverInfo.amount.aht.earned}.00000000`
      }
      user = (
        <a
          href="#"
          className="nav-link pr-0 leading-none"
          data-toggle="dropdown"
        >
          <span
            className="avatar"
            style={{
              backgroundImage: `url(${this.props.user.photoURL})`,
            }}
          />
          <span className="ml-2 d-none d-lg-block">
            <span className="text-default">{this.props.user.displayName}</span>
            <small className="text-muted d-block mt-1">{aht} AHT</small>
          </span>
        </a>
      )
    }
    let links = []
    for (let v of this.props.links || []) {
      links.push(
        <div className="nav-item d-none d-md-flex">
          <a href={v.href} className="btn btn-sm btn-outline-primary">
            {v.name}
          </a>
        </div>
      )
    }
    return (
      <div className="page">
        <div className="flax-fill">
          <div className="header py-4">
            <div className="container">
              <div className="d-flex">
                <a className="header-brand" href="/">
                  {this.props.title || `ALIS Hacker's Club`}
                </a>
                <div className="d-flex order-lg-2 ml-auto">
                  {links}
                  <div className="dropdown">
                    {user}
                    <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                      <a
                        className="dropdown-item"
                        onClick={() => {
                          this.props.auth.logout()
                        }}
                      >
                        <i className="dropdown-icon fe fe-log-out" /> ログアウト
                      </a>
                    </div>
                  </div>
                </div>
                <a
                  href="#"
                  className="header-toggler d-lg-none ml-3 ml-lg-0"
                  data-toggle="collapse"
                  data-target="#headerMenuCollapse"
                >
                  <span className="header-toggler-icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Header_Home
