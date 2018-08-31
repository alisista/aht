import React, { Component } from 'react'

class Nav extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    let $ = window.$
    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function() {
      $('.navbar-collapse').collapse('hide')
    })

    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
      target: '#mainNav',
      offset: 56,
    })

    // Collapse Navbar
    var navbarCollapse = function() {
      if ($('#mainNav').offset().top > 100) {
        $('#mainNav').addClass('navbar-shrink')
      } else {
        $('#mainNav').removeClass('navbar-shrink')
      }
    }
    // Collapse now if page is not at top
    navbarCollapse()
    // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse)
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
      if (
        window.location.pathname.replace(/^\//, '') ==
          this.pathname.replace(/^\//, '') &&
        window.location.hostname == this.hostname
      ) {
        var target = $(this.hash)
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']')
        if (target.length) {
          $('html, body').animate(
            {
              scrollTop: target.offset().top - 54,
            },
            1000,
            'easeInOutExpo'
          )
          return false
        }
      }
    })
  }
  render() {
    let nav_items = []
    for (let v of this.props.items) {
      nav_items.push(
        <li className="nav-item">
          <a className="nav-link js-scroll-trigger" href={`#${v.id}`}>
            {v.name}
          </a>
        </li>
      )
    }
    return (
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        id="mainNav"
      >
        <div className="container">
          <a className="navbar-brand js-scroll-trigger" href="#page-top">
            ALIS HackerToken
          </a>
          <button
            className="navbar-toggler navbar-toggler-right"
            type="button"
            data-toggle="collapse"
            data-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ color: 'steelblue' }}
          >
            Menu
            <i className="fa fa-bars" />
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav text-uppercase ml-auto">{nav_items}</ul>
          </div>
        </div>
      </nav>
    )
  }
}

export default Nav
