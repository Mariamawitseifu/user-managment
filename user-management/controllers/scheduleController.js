// const { validationResult } = require('express-validator');
// const Schedule = require('../models/scheduleModel');


// const addSchedule = async (req, res) => {
//     try {
//         // Check for validation errors
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Validation errors',
//                 errors: errors.array()
//             });
//         }

//         // Extract fields from request body
//         const { user_id, branch_id, date, start_time, end_time } = req.body;

//         // Check if a schedule already exists for the given user and branch on the specified date
//         const isExists = await Schedule.findOne({
//             user_id: user_id,
//             branch_id: branch_id,
//             date: date,
//             start_time: start_time,
//             end_time: end_time
//         });

//         if (isExists) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Schedule already exists for this user and branch at the specified time'
//             });
//         }

//         // Create a new schedule
//         const schedule = new Schedule({
//             user_id: user_id,
//             branch_id: branch_id,
//             date: date,
//             start_time: start_time,
//             end_time: end_time
//         });

//         // Save the schedule to the database
//         const scheduleData = await schedule.save();

//         // Respond with success
//         return res.status(201).json({
//             success: true,
//             msg: 'Scheduled successfully',
//             data: scheduleData
//         });

//     } catch (error) {
//         // Respond with error
//         return res.status(500).json({
//             success: false,
//             msg: 'Server error',
//             error: error.message
//         });
//     }
// };



// const getSchedule = async (req, res) => {
//     try {
//         // Extract query parameters
//         const { user_id, branch_id, date, start_time, end_time } = req.query;

//         // Build query object
//         const query = {};

//         if (user_id) {
//             query.user_id = user_id;
//         }
//         if (branch_id) {
//             query.branch_id = branch_id;
//         }
//         if (date) {
//             // Ensure date is in ISO format or handle accordingly
//             query.date = new Date(date);
//         }
//         if (start_time) {
//             query.start_time = start_time;
//         }
//         if (end_time) {
//             query.end_time = end_time;
//         }

//         // Fetch schedules based on query parameters
//         const schedules = await Schedule.find(query);

//         // Respond with the fetched schedules
//         return res.status(200).json({
//             success: true,
//             msg: 'Schedules retrieved successfully',
//             data: schedules
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             msg: 'Server error',
//             error: error.message
//         });
//     }
// };




// const deleteSchedule = async (req, res) => {
//     try {
//         // Extract schedule ID from request parameters
//         const { id } = req.params;

//         // Validate the ID (you might want to add more validation here)
//         if (!id) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Schedule ID is required'
//             });
//         }

//         // Find and delete the schedule by ID
//         const schedule = await Schedule.findByIdAndDelete(id);

//         // If schedule not found
//         if (!schedule) {
//             return res.status(404).json({
//                 success: false,
//                 msg: 'Schedule not found'
//             });
//         }

//         // Respond with success
//         return res.status(200).json({
//             success: true,
//             msg: 'Schedule deleted successfully',
//             data: schedule
//         });

//     } catch (error) {
//         // Respond with error
//         return res.status(500).json({
//             success: false,
//             msg: 'Server error',
//             error: error.message
//         });
//     }
// };

// const updateSchedule = async (req, res) => {
//     try {
//         // Extract schedule ID from request parameters
//         const { id } = req.params;

//         // Validate the ID
//         if (!id) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Schedule ID is required'
//             });
//         }

//         // Extract update fields from request body
//         const { user_id, branch_id, date, start_time, end_time } = req.body;

//         // Find and update the schedule by ID
//         const updatedSchedule = await Schedule.findByIdAndUpdate(
//             id,
//             { user_id, branch_id, date, start_time, end_time },
//             { new: true, runValidators: true } // Options: `new` returns the updated document, `runValidators` ensures validation is applied
//         );

//         if (!updatedSchedule) {
//             return res.status(404).json({
//                 success: false,
//                 msg: 'Schedule not found'
//             });
//         }
//         return res.status(200).json({
//             success: true,
//             msg: 'Schedule updated successfully',
//             data: updatedSchedule
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             msg: 'Server error',
//             error: error.message
//         });
//     }ss
// };


// module.exports = {
//     addSchedule,
//     getSchedule,
//     deleteSchedule,
//     updateSchedule
// }