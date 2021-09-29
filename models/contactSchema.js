// mongodb schema
const mongoose = require('mongoose')

// create mongoose schema
const contactSchema = new mongoose.Schema({
	lastName: {type: String, required: true},
	firstName: {type: String, required: true},
	portraits: {
		data: Buffer,
		contentType: String 
	},
	email: {type: Array, required: true}, // only display one record for thumbnails 
	phone: {type: Array, required: true}, // only display one record for thumbnails
	meetRecord: {type: Array},
    occupation: {type: String, required: true},
    addDate: {type: Date, required: true, default: Date.now},
	note: {type: String},// unsure type, we also need to handle the image or attachments
	status: {type: Boolean, required: true},
    ownerAccount: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    linkedAccount: {type: mongoose.Schema.Types.ObjectId, ref:'User'}
})

const Contact = mongoose.model('Contact', contactSchema)

module.exports = Contact