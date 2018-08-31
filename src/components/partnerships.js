import React, { Component } from 'react'

class Partnerships extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let partnership_items = []
    this.props.items.forEach((v, i) => {
      if (v.name == undefined) {
        partnership_items.push(
          <div className="col-xl-3 col-sm-6 d-none d-xl-inline-block">
            <a href="#" />
          </div>
        )
      } else {
        partnership_items.push(
          <div
            className="col-xl-3 col-sm-6 text-center"
            style={{ witeSpace: 'nowrap' }}
          >
            <a
              href={v.link}
              target="_blank"
              style={{
                verticalAlign: 'middle',
                color: '#aaa',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              <img
                src={v.icon}
                style={{
                  marginRight: '10px',
                  height: '30px',
                  verticalAlign: 'middle',
                }}
              />
              <span
                className="partner_name"
                style={{ verticalAlign: 'middle' }}
              >
                {v.name}
              </span>
            </a>
          </div>
        )
      }
    })
    return (
      <section className="py-5" id="partnerships">
        <div className="container">
          <div className="row">{partnership_items}</div>
        </div>
      </section>
    )
  }
}

export default Partnerships
