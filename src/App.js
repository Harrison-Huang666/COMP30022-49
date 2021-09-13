// import required dependencies
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// import Navbar and Map components
import Navbar from "./API/nav/Navbar";
import Map from "./API/map/Map";
// import Calendar from "./API/calendar/Calendar";
import Home from "./API/home/home";
import Contact from "./API/contact/Contact";
import Person from "./API/person/Person";
import Record from "./API/record/Record";
import Search from "./API/search/Search";
import Error from "./API/error/Error";
import Login from "./API/auth/Login";
import Registration from "./API/auth/Registration"
import ProtectedRouters from "./API/auth/ProtectedRouter"
import LogOut from "./API/auth/Logout"

// defined the map function
function App() {
  return (
    <div className="container">
      {/* define the route */}
      {/* TODO: login route and regist route */}

      <Router>
        {/* <NavbarTop /> */}
        <Navbar />
        <Switch>
          <ProtectedRouters exact path="/" component={Home}>
          </ProtectedRouters>
          <Router path="/login" component={Login}>
          </Router>
          <Router path="/logout" component = {LogOut}>
          </Router>
          <Router path="/signup" >
            <Registration />
          </Router>



          <ProtectedRouters exact path="/contact" component = {Contact}>
          </ProtectedRouters>
          <Route exact path="/map" component = {Map}>
          </Route>
          {/* <Route path="/calendar">
            <Calendar />
          </Route> */}
          <ProtectedRouters exact path="/record" component = {Record}>
          </ProtectedRouters>
          <ProtectedRouters exact path="/search" component = {Search}>
          </ProtectedRouters>
          <ProtectedRouters exact path="/setting" component = {Person}>
          </ProtectedRouters>

          
          <Route path="*">
            <Error msg={"AHHHHHHHH"} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;