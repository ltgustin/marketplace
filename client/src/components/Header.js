import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import pages from '../pages';
import { ReactComponent as Logo } from '../logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Navbar({current}) {
  return (
    <header>
        <div className="container">
            <Link className="logo" to="/">
              <Logo />
            </Link>

            <nav>
                <NavLink  
                  to="/"
                ><FontAwesomeIcon icon="fa-ticket" />Your Assets</NavLink>

                <NavLink  
                  to="/shop"
                ><FontAwesomeIcon icon="fa-store" />Spend Tokens</NavLink>

                <NavLink  
                  to="/help"
                ><FontAwesomeIcon icon="fa-circle-info" />Help & Support</NavLink>
            </nav>
        </div>

        <div className="bottom">
          <p>Copyright 2024 |  <a href="https://www.twitter.com/0xwebninja">WebNinja</a></p>
        </div>
    </header>
  );
}

export default Navbar;