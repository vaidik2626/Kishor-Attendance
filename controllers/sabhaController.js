const Sabha = require('../models/Sabha');
const User = require('../models/User');

// Create a new sabha
const createSabha = async (req, res) => {
  try {
    const sabhaData = { ...req.body };
    
    // Parse attendance array if it comes as string
    if (typeof sabhaData.attendance === 'string') {
      sabhaData.attendance = JSON.parse(sabhaData.attendance);
    }

    const sabha = new Sabha(sabhaData);
    await sabha.save();

    res.status(201).json({
      success: true,
      message: 'Sabha created successfully',
      data: sabha
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating sabha',
      error: error.message
    });
  }
};

// Get all sabhas
const getAllSabhas = async (req, res) => {
  try {
    const { sabhaType, startDate, endDate, isCancelled } = req.query;
    
    let filter = {};
    
    if (sabhaType) {
      filter.sabhaType = sabhaType;
    }
    
    if (startDate || endDate) {
      filter.sabhaDate = {};
      if (startDate) filter.sabhaDate.$gte = new Date(startDate);
      if (endDate) filter.sabhaDate.$lte = new Date(endDate);
    }
    
    if (isCancelled !== undefined) {
      filter.isCancelled = isCancelled === 'true';
    }

    const sabhas = await Sabha.find(filter)
      .populate('attendance.user', 'name smkNo attendanceNumber')
      .sort({ sabhaDate: -1 });
    
    res.status(200).json({
      success: true,
      count: sabhas.length,
      data: sabhas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sabhas',
      error: error.message
    });
  }
};

// Get a single sabha by ID
const getSabhaById = async (req, res) => {
  try {
    const sabha = await Sabha.findById(req.params.id)
      .populate('attendance.user', 'name smkNo attendanceNumber personalMobile');
    
    if (!sabha) {
      return res.status(404).json({
        success: false,
        message: 'Sabha not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sabha
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sabha',
      error: error.message
    });
  }
};

// Update a sabha
const updateSabha = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Parse attendance array if it comes as string
    if (typeof updateData.attendance === 'string') {
      updateData.attendance = JSON.parse(updateData.attendance);
    }

    const sabha = await Sabha.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('attendance.user', 'name smkNo attendanceNumber');

    if (!sabha) {
      return res.status(404).json({
        success: false,
        message: 'Sabha not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sabha updated successfully',
      data: sabha
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating sabha',
      error: error.message
    });
  }
};

// Delete a sabha
const deleteSabha = async (req, res) => {
  try {
    const sabha = await Sabha.findByIdAndDelete(req.params.id);

    if (!sabha) {
      return res.status(404).json({
        success: false,
        message: 'Sabha not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sabha deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting sabha',
      error: error.message
    });
  }
};

// Mark attendance for a user in a sabha
const markAttendance = async (req, res) => {
  try {
    const { sabhaId } = req.params;
    const { userId, isPresent } = req.body;

    const sabha = await Sabha.findById(sabhaId);
    
    if (!sabha) {
      return res.status(404).json({
        success: false,
        message: 'Sabha not found'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if attendance already marked for this user
    const existingAttendance = sabha.attendance.findIndex(
      att => att.user.toString() === userId
    );

    if (existingAttendance !== -1) {
      // Update existing attendance
      sabha.attendance[existingAttendance].isPresent = isPresent;
      sabha.attendance[existingAttendance].markedAt = Date.now();
    } else {
      // Add new attendance record
      sabha.attendance.push({
        user: userId,
        isPresent: isPresent
      });
    }

    await sabha.save();
    await sabha.populate('attendance.user', 'name smkNo attendanceNumber');

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: sabha
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

// Mark bulk attendance
const markBulkAttendance = async (req, res) => {
  try {
    const { sabhaId } = req.params;
    const { attendanceList } = req.body; // Array of { userId, isPresent }

    const sabha = await Sabha.findById(sabhaId);
    
    if (!sabha) {
      return res.status(404).json({
        success: false,
        message: 'Sabha not found'
      });
    }

    for (const item of attendanceList) {
      const existingAttendance = sabha.attendance.findIndex(
        att => att.user.toString() === item.userId
      );

      if (existingAttendance !== -1) {
        sabha.attendance[existingAttendance].isPresent = item.isPresent;
        sabha.attendance[existingAttendance].markedAt = Date.now();
      } else {
        sabha.attendance.push({
          user: item.userId,
          isPresent: item.isPresent
        });
      }
    }

    await sabha.save();
    await sabha.populate('attendance.user', 'name smkNo attendanceNumber');

    res.status(200).json({
      success: true,
      message: 'Bulk attendance marked successfully',
      data: sabha
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error marking bulk attendance',
      error: error.message
    });
  }
};

// Get attendance report for a specific sabha
const getSabhaAttendanceReport = async (req, res) => {
  try {
    const { sabhaId } = req.params;
    
    const sabha = await Sabha.findById(sabhaId)
      .populate('attendance.user', 'name smkNo attendanceNumber personalMobile assemblyType');

    if (!sabha) {
      return res.status(404).json({
        success: false,
        message: 'Sabha not found'
      });
    }

    const report = {
      sabhaNo: sabha.sabhaNo,
      sabhaType: sabha.sabhaType,
      sabhaDate: sabha.sabhaDate,
      totalPresent: sabha.totalPresent,
      totalAbsent: sabha.totalAbsent,
      totalUsers: sabha.attendance.length,
      presentUsers: sabha.attendance.filter(att => att.isPresent),
      absentUsers: sabha.attendance.filter(att => !att.isPresent)
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating attendance report',
      error: error.message
    });
  }
};

// Get user attendance history across all sabhas
const getUserAttendanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const sabhas = await Sabha.find({
      'attendance.user': userId
    }).sort({ sabhaDate: -1 });

    const attendanceHistory = sabhas.map(sabha => {
      const userAttendance = sabha.attendance.find(
        att => att.user.toString() === userId
      );
      
      return {
        sabhaNo: sabha.sabhaNo,
        sabhaType: sabha.sabhaType,
        sabhaDate: sabha.sabhaDate,
        isPresent: userAttendance ? userAttendance.isPresent : false,
        markedAt: userAttendance ? userAttendance.markedAt : null
      };
    });

    const totalSabhas = attendanceHistory.length;
    const totalPresent = attendanceHistory.filter(att => att.isPresent).length;
    const attendancePercentage = totalSabhas > 0 ? ((totalPresent / totalSabhas) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          smkNo: user.smkNo,
          attendanceNumber: user.attendanceNumber
        },
        statistics: {
          totalSabhas,
          totalPresent,
          totalAbsent: totalSabhas - totalPresent,
          attendancePercentage: `${attendancePercentage}%`
        },
        history: attendanceHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user attendance history',
      error: error.message
    });
  }
};

module.exports = {
  createSabha,
  getAllSabhas,
  getSabhaById,
  updateSabha,
  deleteSabha,
  markAttendance,
  markBulkAttendance,
  getSabhaAttendanceReport,
  getUserAttendanceHistory
};
