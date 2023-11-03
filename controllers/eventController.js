
var db = require("../models");

const { Op } = require('sequelize');

const User = db.users;
const Event = db.events;

const createEvent = async (req, res) => {
    try {
      const { title, description, date,  inviteeIds} = req.body;
      console.log(req.body);
      const creatorId = req.user.id;
    console.log( "creatores id",creatorId);
      const event = await Event.create({ title, description, date, inviteeIds ,creatorId});
      //  console.log("events",event);
      if ( inviteeIds &&  inviteeIds.length > 0) {
        const invitedUsers = await User.findAll({ where: { id:  inviteeIds } });
      
        if (invitedUsers) {
          await event.addInvitees(invitedUsers);
        }
  
        console.log( "invitedUser",invitedUsers);
      }
  
      
  
      return res.status(201).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Event creation failed' });
    }
  }
  
  
  
  
  const getEvent = async (req, res) => {
    try {
      const userId = req.user.id; // Get the ID of the authenticated user
  
      const page = req.query.page || 1;
      const limit = req.query.limit || 10; // Number of results per page
      const order = req.query.order || 'date'; // Default sorting field
  
      // Define an array of allowed sorting fields
      const allowedSortFields = ['date', 'title']; // Add more fields as needed
  
      if (!allowedSortFields.includes(order)) {
        return res.status(400).json({ error: 'Invalid sorting field' });
      }
  
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
  
      // Define the date filtering criteria
      const dateFilter = {};
  
      if (startDate && endDate) {
        dateFilter.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }
  
      const search = req.query.search;
  
      // Define the search filtering criteria
      const searchFilter = {};
  
      if (search) {
        searchFilter.title = {
          [Op.iLike]: `%${search}%`,
        };
      }
  
      // Find events where the user is the creator with pagination, sorting, date filtering, and search filtering
      const createdEvents = await Event.findAndCountAll({
        where: { creatorId: userId, ...dateFilter, ...searchFilter },
        offset: (page - 1) * limit,
        limit: limit,
        order: [[order, 'ASC']],
      });
  
      // Find events where the user is invited with pagination, sorting, date filtering, and search filtering
      const invitedEvents = await Event.findAndCountAll({
        include: [
          {
            model: User,
            as: 'invitees',
            where: { id: userId }, // Check if the user is among the invitees
          },
        ],
        where: { ...dateFilter, ...searchFilter },
        offset: (page - 1) * limit,
        limit: limit,
        order: [[order, 'ASC']],
      });
  
      return res.status(200).json({ createdEvents, invitedEvents });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Event retrieval failed' });
    }
  };
  
  
  var getEventsById = async (req, res) => {
    const eventId = req.params.eventId;
    try {
      const event = await Event.findByPk(eventId, {
        include: [
          {
            model: User,
            as: 'invitees',
          },
        ],
      });
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      return res.status(200).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Event retrieval failed' });
    }
  }
  
  
  var updateEvent = async (req, res) => {
    const eventId = req.params.eventId;
    const updatedEventData = req.body; // Data to update the event
      console.log(eventId);
    try {
      const event = await Event.findByPk(eventId);
      console.log(event);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Update the event's attributes with the new data
      await event.update(updatedEventData);
  
      return res.status(200).json({ message: 'Event updated successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Event update failed' });
    }
  }

  

module.exports = {

    createEvent,
    getEvent,
    getEventsById ,
    updateEvent
  };
  