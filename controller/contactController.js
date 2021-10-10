const mongoose = require("mongoose");
const { populate } = require("../models/contactSchema");

const passport = require("passport");
const ExpressHandlebars = require("express-handlebars/lib/express-handlebars");
require("../config/passport")(passport);

const User = mongoose.model("User");
const Contact = mongoose.model("Contact");
const ContactList = mongoose.model("ContactList");

/**
 * check if duplication contact exist for this account Function
 * @param {express.Request} req - request that contain Contact basic information as body
 * @param {express.Response} res - respond that contain Contact info if contact exist
 */
const duplicateContact = async (req, res) => {
  const inputContact = await Contact.findOne({
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    phone: req.body.phone,
    email: req.body.email,
    ownerAccount: req.body.ownerAccount,
  }).lean();
  res.send(inputContact);
};

/**
 * check if contact exist in system as user
 * @param {express.Request} req - request that contain Contact basic information as body
 * @param {express.Response} res - respond that contain Contact info if contact has an account
 */
const existAccount = async (req, res) => {
  const inputContact = await User.findOne({
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    phone: req.body.phone,
    email: req.body.email,
  }).lean();
  res.send(inputContact);
};

/**
 * connect the exist contact to a Account if the contact register
 * @param  {express.Request} req request that contain object id of contact and object id of contact's account
 * @param  {express.Response} res response from ststem
 */
const linkToAccount = async (req, res) => {
  try {
    const accountCreateContact = await Contact.findOne({
      _id: mongoose.Types.ObjectId(req.body._idOfContact),
    });
    await Contact.updateMany(
      {
        firstName: accountCreateContact.firstName,
        lastName: accountCreateContact.lastName,
        email: accountCreateContact.email,
        phone: accountCreateContact.phone,
        occupation: accountCreateContact.occupation,
      },
      { $set: { linkedAccount: req.body.accountOfContact } }
    );
    res.send(accountCreateContact);
  } catch (err) {
    console.log(err);
  }
};

/**
 * create a new contact in database with userName client give
 * @param {express.Request} req - userName for add a contact and who is adding this account.
 * @param {express.Response} res - response from the system.
 */
const createContactbyUserName = async (req, res) => {
  try {
    const ownerAccount = await User.findOne({
      _id: mongoose.Types.ObjectId(req.user._id),
    });
    let existAccountContact = null;
    let dupContact = null;
    if (req.body.userName) {
      existAccountContact = await User.findOne({
        userName: req.body.userName,
      }).lean();
      dupContact = await Contact.findOne({
        lastName: existAccountContact.lastName,
        firstName: existAccountContact.firstName,
        phone: existAccountContact.phone,
        email: existAccountContact.email,
        ownerAccount: mongoose.Types.ObjectId(req.user._id),
      });
    } else {
      return res.send("Username needed");
    }
    if (dupContact != null) {
      return res.json({ status: false, contact: dupContact });
    }
    if (existAccountContact != null && dupContact == null) {
      newContact = await Contact.create({
        lastName: existAccountContact.lastName,
        firstName: existAccountContact.firstName,
        portraits: existAccountContact.portraits,
        email: existAccountContact.email,
        phone: existAccountContact.phone,
        meetRecord: existAccountContact.meetRecord,
        occupation: existAccountContact.occupation,
        addDate: Date.now(),
        note: existAccountContact.note,
        status: true,
        ownerAccount: mongoose.Types.ObjectId(req.user._id),
        linkedAccount: existAccountContact._id,
      });
    }
    const ContactIdLink = new ContactList({
      contact: newContact._id,
      addSince: Date.now(),
    });
    ownerAccount.contactList.push(ContactIdLink);
    await ownerAccount.save();
    res.json({ status: true, newContact: newContact });
  } catch (err) {
    console.log(err);
    return res.json({ status: false });
  }
};

/**
 * create a new contact in database with information client give
 * @param {express.Request} req - basic information for add a contact and who is adding this account.
 * @param {express.Response} res - response from the system.
 */
const createNewContact = async (req, res) => {
  try {
    //!! can not use object id as input
    const ownerAccount = await User.findOne({
      _id: mongoose.Types.ObjectId(req.user._id),
    });
    // if req is a user id
    // Check if contact has account in app
    const existAccountContact = await User.findOne({
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      phone: req.body.phone,
      email: req.body.email,
    });
    const dupContact = await Contact.findOne({
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      phone: req.body.phone,
      email: req.body.email,
      ownerAccount: mongoose.Types.ObjectId(req.user._id),
    });
    //!!generate one meeting record automatically!
    let newContact = null;
    if (existAccountContact == null && dupContact == null) {
      newContact = await Contact.create({
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        portraits: req.body.portraits,
        email: req.body.email,
        phone: req.body.phone,
        meetRecord: req.body.meetRecord,
        occupation: req.body.occupation,
        addDate: Date.now(),
        note: req.body.note,
        status: true,
        ownerAccount: mongoose.Types.ObjectId(req.user._id),
        linkedAccount: null,
      });
    } else if (existAccountContact != null && dupContact == null) {
      newContact = await Contact.create({
        lastName: existAccountContact.lastName,
        firstName: existAccountContact.firstName,
        portraits: existAccountContact.portraits,
        email: existAccountContact.email,
        phone: existAccountContact.phone,
        meetRecord: existAccountContact.meetRecord,
        occupation: existAccountContact.occupation,
        addDate: Date.now(),
        note: existAccountContact.note,
        status: false,
        ownerAccount: mongoose.Types.ObjectId(req.user._id),
        linkedAccount: existAccountContact._id,
      });
    } else if (dupContact != null) {
      return res.json({ status: false, dupContact: dupContact });
    }
    // const formedContact = new Contact(newContact)
    // formedContact.save()
    const ContactIdLink = new ContactList({
      contact: newContact._id,
      addSince: Date.now(),
    });
    ownerAccount.contactList.push(ContactIdLink);
    await ownerAccount.save();
    res.json({ status: true, newContact: newContact });
  } catch (err) {
    console.log(err);
    return res.json({ status: false });
  }
};

/**
 * give a user, show all contact it has
 * @param {express.Request} req - request that contain information of who is ask for showing all contact.
 * @param {express.Response} res - response from the system contain a list of contact of the user .
 */
const showAllContact = async (req, res) => {
  try {
    const ownerAccount = await User.findOne({
      $or: [
        { userName: req.body.userName },
        { _id: mongoose.Types.ObjectId(req.user._id) },
      ],
    })
      .populate("contactList.contact")
      .lean();
    // .lean();
    res.json(ownerAccount.contactList);
  } catch (err) {
    return res.send("database query fail");
  }
};

/**
 * gives a onject id of Contact, return all its information in response
 * @param {express.Request} req - give the object id of contact as request body,
 * @param {express.Response} res - response from the system that contain information of that contact.
 */
const showOneContact = async (req, res) => {
  try {
    const contactDetail = await Contact.findOne({
      _id: mongoose.Types.ObjectId(req.body._idOfContact),
    }).lean();
    res.send(contactDetail);
  } catch (err) {
    res.send("Database query fail, something wrong with contact Id");
  }
};

/**
 * recived a text from user and return the contacts of that user that has match information
 * @param  {express.Request} req request body contain all information of a search query
 * @param  {express.Response} res response contain the match contacs of this user
 */
const searchContact = async (req, res) => {
  // const validationErrors = expressValidator.validationResult(req)
  // if (!validationErrors.isEmpty()){
  //     return res.status(422).render('error', {errorCode: '422', message: 'Search works on alphabet characters only.'})
  // }
  var query = {};
  query["ownerAccount"] = req.user._id;
  if (req.body.nofillter == true) {
    //direct search by name?
    var nameSearch = req.body.searchContent.split(" ");
    try {
      const matchContacts = await Contact.find({
        $and: [
          { ownerAccount: req.user._id },
          {
            $or: [
              { firstName: { $in: nameSearch } },
              { lastName: { $in: nameSearch } },
            ],
          },
        ],
      }).lean();
      res.json(matchContacts);
      return;
    } catch (err) {
      console.log(err);
    }
  }
  if (req.body.contactUserName != "") {
    try {
      const contactUser = await User.findOne({
        userName: req.body.contactUserName,
      }).lean();
      const matchContact = await Contact.findOne({
        linkedAccount: mongoose.Types.ObjectId(contactUser._id),
        ownerAccount: mongoose.Types.ObjectId(req.user._id),
      }).lean();
      return res.json(matchContact);
    } catch (err) {
      console.log(err);
    }
  }
  // if name in submited form
  if (req.body.lastName != "") {
    query["lastName"] = { $regex: new RegExp(req.body.lastName, "i") };
  }
  if (req.body.firstName != "") {
    query["firstName"] = { $regex: new RegExp(req.body.firstName, "i") };
  }
  if (req.body.phone != "") {
    query["phone"] = req.body.phone;
  }
  if (req.body.email != "") {
    query["email"] = { $regex: new RegExp(req.body.email, "i") };
  }
  if (req.body.occupation != "") {
    query["occupation"] = { $regex: new RegExp(req.body.occupation, "i") };
  }
  if (req.body.addDate != "") {
    // try {
    const searchDate = new Date(req.body.addDate);
    query["addDate"] = { $lt: searchDate };
    searchDate.setHours(24, 0, 0, 0);
    console.log(searchDate.getTime());
    // var matchContacts = await Contact.find({ownerAccount: req.user._id, addDate: {$lt: searchDate.getTime()}})
    // res.json(matchContacts)
    // return
    // } catch (err) {
    //     console.log(err)
    // }
  }
  try {
    var contacts = await Contact.find(query).lean();
    res.json(contacts);
  } catch (err) {
    console.log(err);
    res.send("search failed");
  }
};

//further discussion needed
/**
 * function that able to update information of a contact with information user provide
 * @param  {express.Request} req request contain all new information that need to be update
 * @param  {express.Response} res response contain contact information after update.
 */
const updateContactInfo = async (req, res) => {
  var query = {};
  // if name in submited form
  if (req.body.lastName != "") {
    query["lastName"] = req.body.lastName;
  }
  if (req.body.firstName != "") {
    query["firstName"] = req.body.firstName;
  }
  if (req.body.phone != []) {
    query["phone"] = req.body.phone;
  }
  if (req.body.email != []) {
    query["email"] = req.body.email;
  }
  if (req.body.occupation != "") {
    query["occupation"] = req.body.occupation;
  }
  if (req.body.note != "") {
    query["note"] = req.body.note;
  }
  try {
    const contacts = await Contact.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body._idOfContact) },
      query,
      { new: true }
    ).lean();
    res.json(contacts);
  } catch (err) {
    console.log(err);
    res.json("update failed");
  }
};
/**
 * this founciton is for synchtonize the information of a contact and the account this contacat connect to
 * @param  {express.Request} req request that contain object id of contact we need to synchronize with its account
 * @param  {express.Response} res response contain the information of contact after update
 */
const synchronizationContactInfo = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: mongoose.Types.ObjectId(req.body._idOfContact),
    })
      .populate("linkedAccount")
      .lean();
    var query = {};
    // consider directly replace without comparing
    if (contact.linkedAccount == null) {
      return res.send("no account linked to this contact");
    }
    if (
      contact.linkedAccount.lastName &&
      contact.lastName !== contact.linkedAccount.lastName
    ) {
      query["lastName"] = contact.linkedAccount.lastName;
    }
    if (
      contact.linkedAccount.firstName &&
      contact.firstName !== contact.linkedAccount.firstName
    ) {
      query["firstName"] = contact.linkedAccount.firstName;
    }
    if (
      contact.linkedAccount.phone &&
      !listCompare(contact.phone, contact.linkedAccount.phone)
    ) {
      query["phone"] = contact.linkedAccount.phone;
    }
    if (
      contact.linkedAccount.email &&
      !listCompare(contact.email, contact.linkedAccount.email)
    ) {
      query["email"] = contact.linkedAccount.email;
    }
    if (
      contact.linkedAccount.occupation &&
      contact.occupation !== contact.linkedAccount.occupation
    ) {
      query["occupation"] = contact.linkedAccount.occupation;
    }
    if (
      contact.linkedAccount.portrait &&
      contact.portrait !== contact.linkedAccount.portrait
    ) {
      query["portrait"] = contact.linkedAccount.portrait;
    }
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body._idOfContact) },
      query,
      { new: true }
    ).lean();
    res.json(updatedContact);
  } catch (err) {
    console.log(err);
    res.json("update failed");
  }
};

/**
 * compare two array of string, in our case Email or Phone list
 * @param  {Array} currentList the current array of Email or Phone
 * @param  {Array} targetList the array need to compared with
 * @return {int} if two array are same return 1, otherwise return 0
 */
const listCompare = (currentList, targetList) => {
  if (currentList.length != targetList.length) {
    return 0;
  } else {
    for (var i = 0; i <= currentList.length; i++) {
      if (currentList[i] != targetList[i]) {
        return 0;
      }
    }
  }
  return 1;
};
/**
 * function that allow user upload a photo for one contact
 * @param  {express.Request} req contain the object id of the contact is body, and photo in formdata
 * @param  {express.Response} res contain the contact information after updated
 */
const contactPhotoUpload = async (req, res) => {
  var img = {
    data: fs.readFileSync(req.file.path),
    contentType: req.file.mimeType,
  };
  try {
    // req.body._id is the id of contact that need to be upload
    const contact = await Contact.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { portrait: img },
      { new: true }
    );
    console.log("update success");
    res.send(contact);
  } catch (err) {
    console.log(err);
  }
};

/**
 * function that delete one contact from the contact lists
 * @param  {express.Request} req contain the object id in the request params
 * @param  {express.Response} res send success information
 */
const deleteOneContact = async (req, res) => {
  try {
    // req.body._id is the id of contact that need to be upload
    const contacts = await User.findOne({
      userName: req.user.userName,
    }).lean();

    const contactList = contacts.contactList.filter(
      (contact) => contact.contact.toString() !== req.params.contact_id
    );
    // console.log(contactList);

    // update contact list
    await User.findOneAndUpdate(
      { userName: req.user.userName },
      { contactList: contactList }
    );
    await Contact.deleteOne({ _id: req.params.contact_id });

    res.json({ status: "success" });
  } catch (err) {
    console.log(err);
    res.json({ status: "failed" });
  }
};

module.exports = {
  createNewContact,
  showAllContact,
  existAccount,
  duplicateContact,
  showOneContact,
  linkToAccount,
  contactPhotoUpload,
  searchContact,
  updateContactInfo,
  deleteOneContact,
  synchronizationContactInfo,
  createContactbyUserName,
};
