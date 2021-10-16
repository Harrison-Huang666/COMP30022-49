import React, { useState, useEffect } from "react";
import "./contact.css";
// import qr_code from "./qr-code.png";
// import hand_write from "./notes.png";
import "./manual-input.css";
// import axios from "axios";
import fetchClient from "../axiosClient/axiosClient";
import { Link } from "react-router-dom";
import Heading from "../heading/heading.jsx";
import NavBar from "../nav/Navbar";
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
// import Alert from '@mui/material/Alert';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import UploadIcon from '@mui/icons-material/Upload';
import { makeStyles } from '@material-ui/core/styles';
import cx from 'clsx';

const useFabStyle = makeStyles((success) => ({
  name: {
    color: 'blue',
  },
  fab : {
    ...(success && {
      bgcolor: green[500],
      '&:hover': {
        bgcolor: green[700],
      },
    }),
    borderRadius: 100,
  }
}))

const AddUser = () => {
  useEffect(() => {
    document.title = "Add a new Contact";
  }, []);
  const BASE_URL = "https://crm4399.herokuapp.com";
  // const BASE_URL = "http://localhost:5000";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);
  const [occupation, setOccupation] = useState("");
  // const [meetRecord, setMeetRecord] = useState("");
  const [note, setNote] = useState("");

	const [upload, setUpload] = useState(false);

  const [avatar, setAvatar] = useState("");
  const [file, setFile] = useState('');
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [loading1, setLoading1] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState('')

	const [contact, setContact] = useState('')
  const styles = useFabStyle(success)

  const handleSubmit = async (e) => {
    e.preventDefault();

		var email = ConvertListObjectToListValues(emails, "email");
    var phone = ConvertListObjectToListValues(phones, "phone");

    const contact = {
      firstName,
      lastName,
      email,
      phone,
      occupation,
      portraits: "",
      // meetRecord,
      note,
    };

		var id = ''
    await fetchClient
      .post(BASE_URL + "/contact/createContact", contact)
      .then((res) => {
				if (res.data.dupContact._id ) {
					 id = res.data.dupContact._id
				} else if (res.data.newContact._id) {
					id = res.data.newContact._id
				}
			})
      .catch((err) => {
        console.error(err);
      });
		
		setSuccess(true);
		setLoading1(false);

		const formData = new FormData();
    formData.append('portrait', file);
		formData.append('_id', id)

		try {

      console.log("trying to upload img" )
      setSuccess(false);
      setLoading1(true);
      const res = await fetchClient.post('/contact/uploadContactImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
        }
      }).then(response => {
				setAvatar(response.data.portrait.data.toString("base64"))
				setContact()
			});

      if (res.data.status === 'false') {
        setMessage('upload failed ');
        return
      }

      // setTimeout(() => setUploadPercentage(0), 100);

      setSuccess(true);
      setLoading1(false);
			setUpload(false)
      // TODO: backend should return the decoded string of image in res.data.portrait.
      // update hook state to rerender the new avatar 

    } catch (err) {
      if (err) {
        setMessage('upload failed err: ');
      } else {

        setMessage(err.response.data.msg);
      }
      setUploadPercentage(0)
    }

    alert("You've create a new contact!");
    setFirstName("");
    setLastName("");
    setEmails([]);
    setPhones([]);
    setOccupation("");
    // setMeetRecord("");
    setNote("");
  };

  // const [image, setImage] = useState("");

  // const uploadImage = async (e) => {
  //   e.preventDefault();
  //   // console.log(image);

  //   const formData = new FormData();
  //   formData.append("portrait", image);

  //   await fetchClient
  //     .post("http://localhost:5000/profile/uploadUserImage", formData)
  //     .then((res) => console.log(res));

  //   console.log("posted");
  // };

	const handleAddPhone = (e) => {
    e.preventDefault();
    setPhones([...phones, { phone: "" }]);
  };

	const handleAddEmail = (e) => {
    e.preventDefault();
    setEmails([...emails, { email: "" }]);
  };

	const removeHandler = (e, index, type) => {
		e.preventDefault();
		if (type === "phone") {
			setPhones((prev) => prev.filter((item) => item !== prev[index]));
		}

		if (type === "email") {
			setEmails((prev) => prev.filter((item) => item !== prev[index]));
		}
	};

	const emailOnChange = (index, event) => {
    event.preventDefault();
    event.persist();

    setEmails((prev) => {
      return prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        return {
          ...item,
          [event.target.name]: event.target.value,
        };
      });
    });
  };

	const phoneOnChange = (index, event) => {
    event.preventDefault();
    event.persist();

    setPhones((prev) => {
      return prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        return {
          ...item,
          [event.target.name]: event.target.value,
        };
      });
    });
  };


	const onClickUpload = () => {
    setUpload(!upload)
  }

	const onChange = e => {
    e.preventDefault();
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);

  };

	const onSubmit = async e => {
    if (contact !== '') {
			e.preventDefault();
			const formData = new FormData();
			formData.append('portrait', file);
			formData.append('_id', contact._id)


			try {
				setSuccess(false);
				setLoading1(true);
				const res = await fetchClient.post('/contact/uploadContactImage', formData, {
					headers: {
						'Content-Type': 'multipart/form-data'
					},
					onUploadProgress: progressEvent => {
						setUploadPercentage(
							parseInt(
								Math.round((progressEvent.loaded * 100) / progressEvent.total)
							)
						);
					}
				}).then(response => {
					setAvatar(response.data.portrait.data.toString("base64"))
					setContact(response.data)
				});

				if (res.data.status === 'false') {
					setMessage('Upload failed ');
					return
				}

				// setTimeout(() => setUploadPercentage(0), 100);

				setSuccess(true);
				setLoading1(false);
				setUpload(false)
				// TODO: backend should return the decoded string of image in res.data.portrait.
				// update hook state to rerender the new avatar
				// setAvatar(res.data.portrait) 

				alert("Success")
			} catch (err) {
			if (err) {
				setMessage('upload failed err: ');
			} else {

				setMessage(err.response.data.msg);
			}
				setUploadPercentage(0)
			}
		} else {
			alert('You need to submit contact information before upload image')
		}

    
  };

  const buttonSx = {
    borderRadius: 100,
    ...(success && {
      bgcolor: green[500],
      '&:hover': {
        bgcolor: green[700],
      },
    }),
  };

  return (
    <React.Fragment>
      <Heading />
      <NavBar />
      <div className="sub-container">
        <Link to="/addUser">
          <a href="/addUser" className="back-button">
            Back
          </a>
        </Link>

        {/* <div className="upload-img">
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <button onClick={uploadImage}>Upload</button>
        </div> */}
				<div className="avatar">
					<Avatar alt="Avatar" sx={{ width: 125, height: 125, border: '2px solid pink' }} margin={3} src={"data:image/png;base64," + avatar} />

					{upload ? [<div className="upload-container " style={{ alignItems: 'center', justifyContent: "center", display: "flex", position: 'fixed', right: '1rem', top: '0rem' }}>
            <form onSubmit={onSubmit}>
              <label htmlFor="contained-button-file" style={{ padding: '10px'}}>
                <Input accept="image/*" id="contained-button-file" multiple type="file" hidden={true} onChange={onChange} />
                <Button variant="contained" component="span" >
                  <Typography variant="body2">
                    Choose
                  </Typography>
                </Button>
              </label>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", width: '7rem' }}>
                <Typography variant="body2" noWrap color="text.secondary">
                  {fileName}
                </Typography>
              </div>



              {/* <Box sx={{ m: 1, position: 'relative', alignItems: 'center', justifyContent: "center", display: "flex" }}>
                <Fab
                  aria-label="save"
                  color="primary"
                  sx={buttonSx}
                  onClick={onSubmit}
                >
                  {success ? <CheckIcon /> : <SaveIcon />}

                </Fab>
                {loading1 && (
                  <CircularProgress

                    value={uploadPercentage}
                    variant="determinate"
                    size={68}
                    sx={{
                      color: green[500],
                      position: 'absolute',
                    }}
                  />
                )}
              </Box> */}
              <Button onClick={onClickUpload}>Cancel</Button>
            </form>
						</div>] : (<div style={{ right: '1rem', top: '3.5rem', position: 'fixed' }}>
							<Button onClick={onClickUpload}>

								<UploadIcon />
								Upload

							</Button>
						</div>)}
				</div>	
        <form className="contact-form" method="POST" onSubmit={handleSubmit} style={{height: "98%", overflow: "scroll"}}>
          <label htmlFor="firstName">First Name: </label>
          <input
            name="firstName"
						className='form-control'
            type="text"
            placeholder="Please enter the Last Name"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            required
          ></input>

          <label htmlFor="lastName">Last Name: </label>
          <input
            name="lastName"
						className='form-control'
            type="text"
            placeholder="Please enter the First Name"
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
            required
          ></input>

          <label htmlFor="email">E-mail: </label>
					{emails.map((mail, i) => {
						return (
							<div className="multi-field" >
								<div className="multi-field-input" style={{display: "flex", flexDirection:"row", gap: "10px", width: "100%" }}>
									<input
										value={mail.email}
                    type="email"
                    name="email"
                    className="form-control"
                    required
                    onChange={(e) => emailOnChange(i, e)}
									></input>
									<button
												className="btn btn-info"
												style={{
													width: "40px",
													height: "40px",
													margin: "0px"
												}}
												onClick={(e) => removeHandler(e, i, "email")}
											>
												x
									</button>
								</div>
							</div>
						)
					})}

					<button className="btn btn-primary mt-2" onClick={handleAddEmail}>
              Add Email
          </button>

          <label htmlFor="phone">Phone: </label>
          {phones.map((phone, i) => {
						return (
							<div className="multi-field" >
								<div className="multi-field-input" style={{display: "flex", flexDirection:"row", gap: "10px", width: "100%" }}>
									<input
                    text='text' pattern="\d*"
                    value={phone.phone}
                    className="form-control"
                    name="phone"
                    required
                    minLength={10}
                    maxLength={10}
                    onChange={(e) => phoneOnChange(i, e)}
                  />
									<button
												className="btn btn-info"
												style={{
													width: "40px",
													height: "40px",
													margin: "0px"
												}}
												onClick={(e) => removeHandler(e, i, "phone")}
											>
												x
									</button>
								</div>
							</div>
						)
					})}

					<button className="btn btn-primary mt-2" onClick={handleAddPhone}>
              Add Phone
            </button>

          <label htmlFor="occupation">Occupation: </label>
          <input
            name="occupation"
						className='form-control'
            type="text"
            placeholder="Please enter the occupation"
            onChange={(e) => setOccupation(e.target.value)}
            value={occupation}
            required
          ></input>

          {/* <label htmlFor="meetRecord">Meeting Record: </label>
          <input
            name="meetRecord"
            type="text"
            placeholder="Please enter the meetRecord"
            onChange={(e) => setMeetRecord(e.target.value)}
            value={meetRecord}
          ></input> */}

          <label htmlFor="note">Notes: </label>
          <textarea
						style={{minWidth: "100%"}}	
            name="note"
            type="text"
            placeholder="Add Notes"
            onChange={(e) => setNote(e.target.value)}
            value={note}
          ></textarea>

          <button
            className="btn btn-primary"
            style={{ padding: "0px" }}
            type="submit"
          >
            Create Contact
          </button>

          <Box type="submit" sx={{ m: 1, position: 'relative', alignItems: 'center', justifyContent: "center", display: "flex" }}>
                  <Fab
                      className={cx(styles.name,styles.fab)}
                      aria-label="save"
                      color="primary"
                      sx={buttonSx}
                  >
                    {success ? <CheckIcon /> : <SaveIcon />}

                  </Fab>
                  {loading1 && (
                      <CircularProgress

                          value={uploadPercentage}
                          variant="determinate"
                          size={68}
                          sx={{
                            color: green[500],
                            position: 'absolute',
                          }}
                      />
                  )}
            </Box>
        </form>
      </div>
    </React.Fragment>
  );
};

export default AddUser;

const ConvertListObjectToListValues = (items, type) => {
  var result = [];
  if (type === "phone") {
    for (let i = 0; i < items.length; i++) {
      result.push(items[i].phone);
    }
  }

  if (type === "email") {
    for (let i = 0; i < items.length; i++) {
      result.push(items[i].email);
    }
  }

  return result;
};