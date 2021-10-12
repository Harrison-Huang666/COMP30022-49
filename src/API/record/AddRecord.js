import "./record.css";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateTimePicker from "@mui/lab/DateTimePicker";
// import { useShowAllRecords, useCreateRecord } from "../../BackEndAPI/recordAPI";
import { useContacts } from "../../BackEndAPI/contactAPI";
import { convert } from "./Record";
import fetchClient from "../axiosClient/axiosClient";
import Error from "../error/Error";
import Navbar from "../nav/Navbar";
import React, { useState, useEffect } from "react";
import Map from "./map";
import Heading from "../heading/heading.jsx";
import Autocomplete from "@mui/material/Autocomplete";
import { Link } from "react-router-dom";

const CreateRecord = () => {
  useEffect(() => {
    document.title = "Add Record";
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  const { loading, contacts, error } = useContacts();
  const [selected, setSelected] = useState("");
  const [location, setLocation] = useState("");
  const [geoCoords, setGeoCoords] = useState({ lat: -37.7972, lng: 144.961 });
  const [notes, setNotes] = useState("");
  if (error) {
    return <Error msg={"Something Wrong with Record Component"}></Error>;
  }

  if (loading) {
    return (
      <React.Fragment>
        <div className="sub-container">
          <div className="loading">
            <h1>Loading</h1>
            <h1> ヽ(*・ω・)ﾉ</h1>
          </div>
        </div>
      </React.Fragment>
    );
  }

  let names = contacts.map(function (contact, index) {
    return {
      label: contact.contact.firstName + " " + contact.contact.lastName,
      id: contact.contact._id,
    };
  });

  const handleSubmit = async () => {
    // return console.log(location);
    const recordInfo = {
      contact_id: selected,
      location: location,
      dateTime: convert(currentTime),
      geoCoords: geoCoords,
      notes: notes,
    };

    console.log(recordInfo);

    await fetchClient
      .post("https://crm4399.herokuapp.com/record/createRecord", recordInfo)
      .then(() => alert("Successfully create a record つ - - つ"))
      .catch((err) => {
        alert(err);
        console.error(err);
      });
    setLocation("");
    setSelected("");

    // window.location.href = "/record";
  };

  const setFieldValue = (value) => {
    if (value) {
      const { id, label } = value;
      setSelected(id);
      console.log(id, " + ", label);
    }
  };

  console.log("TIME ", convert(currentTime));

  return (
    <React.Fragment>
      <Heading />
      <Navbar />
      <div className="sub-container">
        <Link to="/record">
          <a href="/record" className="back-button">
            Back
          </a>
        </Link>

        <form className="record-form">
          <Autocomplete
            label="Contacts"
            name="Contacts"
            options={names}
            sx={{ width: 300 }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(e, v) => setFieldValue(v)}
            renderInput={(params) => <TextField {...params} label="Contacts" />}
          />
          <br />
          <div className="timer-container">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                renderInput={(params) => <TextField {...params} />}
                label="Meeting time"
                value={currentTime}
                onChange={(newValue) => {
                  setCurrentTime(newValue);
                }}
                minDate={new Date("2021-02-14")}
                maxTime={new Date("2025-02-14")}
                ampm={true}
                disableIgnoringDatePartForTimeValidation={true}
              />
            </LocalizationProvider>
          </div>

          <br />
          <label htmlFor="location">Location: </label>
          <input
            name="location"
            type="text"
            placeholder="Please enter the location"
            onChange={(e) => setLocation(e.target.value)}
            value={location}
            required
            className="location"
          ></input>

          <input
            htmlFor="geoCoords"
            type="number"
            step="any"
            value={geoCoords.lat}
            onChange={() => {}}
            hidden
          />
          <input
            htmlFor="geoCoords"
            type="number"
            step="any"
            value={geoCoords.lng}
            onChange={() => {}}
            hidden
          />

          <Map setLocation={setLocation} setGeoCoords={setGeoCoords} />

          <textarea
            name="notes"
            type="text"
            placeholder="Add notes here!"
            onChange={(e) => {
              setNotes(e.target.value);
            }}
            style={{ minWidth: "98.5%", minHeight: "auto" }}
          />

          <button
            className="btn btn-primary"
            type="button"
            onClick={handleSubmit}
          >
            Create A Record
          </button>
        </form>
      </div>
    </React.Fragment>
  );
};

export default CreateRecord;
