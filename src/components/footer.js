import React, { Component } from 'react'

class HTML extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let link_items = []
    for (let v of this.props.items) {
      link_items.push(
        <li className="list-inline-item">
          <a href={v.href} target="_blank">
            <i className={`fab fa-${v.key}`} />
          </a>
        </li>
      )
    }
    return (
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <span className="copyright">
                Copyright &copy; ALISハッカー部 2018
              </span>
            </div>
            <div className="col-md-4">
              <ul className="list-inline social-buttons">{link_items}</ul>
            </div>
            <div className="col-md-4">
              <ul className="list-inline quicklinks" />
            </div>
          </div>
        </div>
      </footer>
    )
  }
}

export default HTML
