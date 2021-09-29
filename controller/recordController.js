const mongoose = require('mongoose')
const Record = mongoose.model('Record')
const passport = require('passport')
const User = mongoose.model('User')
const Contact = mongoose.model('Contact')
const { populate } = require('../models/recordSchema')

require('../config/passport')(passport);


/**
* create a new Record Function
* @param {express.Request} req - information json for add a record
* @param {express.Response} res - response from the system.
*/
const createRecord = async (req, res) => {
    /*
    request header: user
    request body:
    {  
        "contact_id": 12354325
        "dateTime": "10/10/2000",
        "location": "University of Melbourne",
        "linkedAccount": "account",
        "ownerAccount" : "ownerAccount"
    }*/
    const ownerAccount = await User.findOne({_id:req.user._id})
    const {contact_id, dateTime, location, linkedAccount} = req.body
    if (dateTime==null) dateTime = new Date.now()
    try {
        //meetingPerson = await Contact.findOne({_id: mongoose.Types.ObjectId(contact_id)}).lean()
        newRecord = await Record.create({
            "meetingPerson": contact_id,
            "dateTime": dateTime,
            "location": location,
            "linkedAccount" : linkedAccount,
            "ownerAccount" : req.user._id
        })

        await ownerAccount.recordList.push(newRecord._id)
        await ownerAccount.recordList.save()
        res.send("Record Create Successfully")
    }catch(err){
        res.send("Database query failed")
    }
}

/**
* show All Records for the user
* @param {express.Request} req 
* @param {express.Response} res - response from the system.
*/
const showAllRecords = async (req,res) => {
    const ownerAccount = await User.findOne({_id: mongoose.Types.ObjectId(req.user._id)}).populate("RecordList.record").lean()
    res.json(ownerAccount.recordList)
}

const searchRecord = async (req, res) => {
    const validationErrors = expressValidator.validationResult(req)
    if (!validationErrors.isEmpty()){
        return res.status(422).render('error', {errorCode: '422', message: 'Search works on alphabet characters only.'})
    }
    var query = {}

    if (req.body.meetingPerson != ''){
        query["meetingPerson"] = {$regex: new RegExp(req.body.meetingPerson, 'i') }
    }
    if (req.body.location != ''){
        query["location"] = {$regex: new RegExp(req.body.location, 'i') }
    }
    if (req.body.occupation != ''){
        query["occupation"] = {$regex: new RegExp(req.body.occupation, 'i') }
    }
    if (req.body.dateTime != ''){
        try {
            const searchDate = new Date(req.body.dateTime)
            var matchRecords = await Record.find({dateTime: {$lt: searchDate.getTime()}})
            res.json(matchRecords)
            return
        } catch (err) {
            console.log(err)
        }
    }
    try {
		const records = await Record.find(query).lean()
		res.json(records)	
	} catch (err) {
		console.log(err)
	}
}


module.exports = {
    createRecord,
    showAllRecords,
    searchRecord
}