import React, { Component } from 'react'

class Token extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let token_items = []
    this.props.items.forEach((v, i) => {
      let items = []
      let mt = ''
      let hr
      if (i !== 0) {
        mt = 'mt-5'
      }
      v.items.forEach(v2 => {
        items.push(
          <div className="col-md-4">
            <span className="fa-stack fa-4x">
              <i className="fa fa-circle fa-stack-2x text-primary" />
              <i className={`fa fa-${v2.image} fa-stack-1x fa-inverse`} />
            </span>
            <h4 className="service-heading" style={{ color: 'white' }}>
              {v2.title}
            </h4>
            <p style={{ color: '#ccc' }}>{v2.description}</p>
          </div>
        )
      })
      token_items.push(
        <div className={`row ${mt}`}>
          <div className="col-lg-12 text-center">
            <h2 className="section-heading text-uppercase">{v.title}</h2>
            <h3 className="section-subheading text-light">{v.subheading}</h3>
          </div>
          <div className="row text-center">{items}</div>
        </div>
      )
    })
    return (
      <section id="token">
        <div className="container">{token_items}</div>
      </section>
    )
  }
}

export default Token
