import React, { Component } from 'react'
import { withPrefix } from 'gatsby-link'

class HTML extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let problems = []
    this.props.items.forEach((v, i) => {
      let order1 = 'order-lg-2'
      let order2 = 'order-lg-1'
      if (i % 2 == 1) {
        order1 = 'order-lg-1'
        order2 = 'order-lg-2'
      }
      problems.push(
        <div className="row no-gutters">
          <div
            className={`col-lg-6 ${order1} text-white showcase-img`}
            style={{
              backgroundImage: `url('${withPrefix(v.icon)}`,
            }}
          />
          <div className={`col-lg-6 ${order2} my-auto showcase-text`}>
            <h2>{v.title}</h2>
            <p className="lead mb-0">{v.description}</p>
          </div>
        </div>
      )
    })
    return (
      <section className="showcase p-0" id="problems">
        <div className="container-fluid p-0">{problems}</div>
      </section>
    )
  }
}

export default HTML
