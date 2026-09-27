import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import fetch from 'node-fetch';
import { sendTicketCreatedEmail, sendTicketAssignedEmail, sendOTPEmail } from '../services/emailService.js';
import { applyTicketDeadline, enforceTicketDeadlines } from '../services/ticketLifecycleService.js';
import { normalizeTicketStatus } from '../utils/ticketStatus.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// @desc    Create new ticket with AI analysis
// @route   POST /api/tickets
// @access  Private (Employee, Technician, Admin)
export const createTicket = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Issue description is required'
      });
    }

    // Step 1: Analyze ticket using ML service
    let category = 'Others';
    let priority = 'Medium';
    let assignedTeam = 'General Support Team';

    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue: description })
      });

      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        if (mlData.success) {
          category = mlData.data.category;
          priority = mlData.data.priority;
          assignedTeam = mlData.data.assignedTeam;
          console.log('✓ ML Analysis:', { category, priority, assignedTeam });
        }
      }
    } catch (mlError) {
      console.warn('⚠ ML service unavailable, using defaults:', mlError.message);
    }

    // Step 2: Auto-assign to technician with load-balancing and fallback
    let assignedTechnician = null;
    try {
      // First try: case-insensitive department match
      let technicians = await User.find({
        role: 'technician',
        isActive: true,
        department: { $regex: new RegExp(`^${category}$`, 'i') }
      });

      // Fallback: any active technician if no category match
      if (technicians.length === 0) {
        console.log(`⚠ No ${category} specialist found, falling back to any active technician`);
        technicians = await User.find({ role: 'technician', isActive: true });
      }

      if (technicians.length > 0) {
        // Load-balance: assign to technician with fewest open tickets
        const techLoads = await Promise.all(
          technicians.map(async (tech) => {
            const openCount = await Ticket.countDocuments({
              assignedTo: tech._id,
              status: { $in: ['Open', 'In Progress'] }
            });
            return { tech, load: openCount };
          })
        );
        techLoads.sort((a, b) => a.load - b.load);
        assignedTechnician = techLoads[0].tech;
        console.log(`✓ Auto-assigned to technician: ${assignedTechnician.name} (load: ${techLoads[0].load} tickets)`);
      } else {
        console.log('⚠ No technicians found in the system');
      }
    } catch (assignError) {
      console.warn('⚠ Auto-assignment failed:', assignError.message);
    }

    // Step 3: Generate title from description (first 50 chars)
    const title = description.length > 50
      ? description.substring(0, 50) + '...'
      : description;

    // Step 4: Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user._id,
      assignedTo: assignedTechnician ? assignedTechnician._id : null
    });

    await ticket.populate([
      { path: 'createdBy', select: 'name email role department phoneNumber' },
      { path: 'assignedTo', select: 'name email role department phoneNumber' }
    ]);

    // Step 5: Send email notifications (non-blocking — ticket is created regardless)
    try {
      // Email to employee who raised the ticket
      const empResult = await sendTicketCreatedEmail(ticket.createdBy.email, ticket);
      if (empResult.success) {
        console.log(`✉ Employee email sent to: ${ticket.createdBy.email}`);
      } else {
        console.warn(`⚠ Employee email failed: ${empResult.error}`);
      }

      // Email to assigned technician
      if (ticket.assignedTo) {
        const techResult = await sendTicketAssignedEmail(
          ticket.assignedTo.email,
          ticket.assignedTo.name,
          ticket
        );
        if (techResult.success) {
          console.log(`✉ Technician email sent to: ${ticket.assignedTo.email}`);
        } else {
          console.warn(`⚠ Technician email failed: ${techResult.error}`);
        }
      } else {
        console.warn('⚠ No technician assigned — skipping technician email');
      }
    } catch (emailError) {
      console.warn('⚠ Email notification error:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        ticket,
        mlAnalysis: {
          category,
          priority,
          assignedTeam,
          autoAssigned: !!assignedTechnician
        }
      }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    await enforceTicketDeadlines();
    let query = {};

    // Filter based on user role
    if (req.user.role === 'employee') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'technician') {
      query.$or = [
        { assignedTo: req.user._id },
        { assignedTo: null }
      ];
    }
    // Admin can see all tickets

    // Query parameters
    const { status, priority, category } = req.query;
    if (status) query.status = normalizeTicketStatus(status);
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: { tickets }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
  try {
    await enforceTicketDeadlines({ _id: req.params.id });
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email role department phoneNumber')
      .populate('assignedTo', 'name email role department phoneNumber')
      .populate('comments.user', 'name email role')
      .populate('resolution.resolvedBy', 'name email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check authorization
    if (req.user.role === 'employee' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private (Technician, Admin)
export const updateTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check authorization for technician
    if (req.user.role === 'technician' &&
        ticket.assignedTo &&
        ticket.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ticket'
      });
    }

    const { status, priority, assignedTo } = req.body;
    const nextStatus = normalizeTicketStatus(status);

    await applyTicketDeadline(ticket);

    if (ticket.status === 'Unsolved' && nextStatus !== 'Unsolved') {
      return res.status(400).json({
        success: false,
        message: 'This ticket crossed the 24-hour completion window and cannot be reopened'
      });
    }

    if (nextStatus === 'Resolved' && !ticket.verification?.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Ticket completion must be verified with the employee OTP before it can be resolved'
      });
    }

    if (nextStatus) ticket.status = nextStatus;
    if (priority) ticket.priority = priority;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo;

    // If status is Resolved, set resolution
    if (nextStatus === 'Resolved' && !ticket.resolution.resolvedAt) {
      ticket.resolution.resolvedBy = req.user._id;
      ticket.resolution.resolvedAt = new Date();
    }

    await ticket.save();
    await ticket.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket }
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: error.message
    });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date()
    });

    await ticket.save();
    await ticket.populate('comments.user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: { comments: ticket.comments }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// @desc    Assign ticket to technician
// @route   PUT /api/tickets/:id/assign
// @access  Private (Admin)
export const assignTicket = async (req, res) => {
  try {
    const { technicianId } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await applyTicketDeadline(ticket);

    if (ticket.status === 'Unsolved') {
      return res.status(400).json({
        success: false,
        message: 'This ticket crossed the 24-hour completion window and cannot be assigned'
      });
    }

    // Verify technician exists
    if (technicianId) {
      const technician = await User.findById(technicianId);
      if (!technician || technician.role !== 'technician') {
        return res.status(400).json({
          success: false,
          message: 'Invalid technician ID'
        });
      }
    }

    ticket.assignedTo = technicianId || null;
    if (technicianId && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    await ticket.save();
    await ticket.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: { ticket }
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning ticket',
      error: error.message
    });
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private (Admin)
export const getTicketStats = async (req, res) => {
  try {
    await enforceTicketDeadlines();
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const unsolvedTickets = await Ticket.countDocuments({ status: 'Unsolved' });

    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalTickets,
        byStatus: {
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          unsolved: unsolvedTickets
        },
        byPriority: priorityStats,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Request ticket completion verification (Technician)
// @route   POST /api/tickets/:id/request-verification
// @access  Private (Technician, Admin)
export const requestVerification = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if technician is assigned to this ticket
    if (req.user.role === 'technician' && ticket.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to request verification for this ticket'
      });
    }

    await applyTicketDeadline(ticket);

    if (ticket.status === 'Unsolved') {
      return res.status(400).json({
        success: false,
        message: 'This ticket crossed the 24-hour completion window and is marked as unsolved'
      });
    }

    if (ticket.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'This ticket is already resolved'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update ticket with OTP
    ticket.verification = {
      otp,
      otpExpiry,
      isVerified: false,
      requestedBy: req.user._id,
      requestedAt: new Date()
    };

    await ticket.save();

    // Send OTP email to employee
    await sendOTPEmail(
      ticket.createdBy.email,
      ticket.createdBy.name,
      ticket,
      otp
    );

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent to employee email',
      data: {
        otpSent: true,
        expiresIn: '15 minutes'
      }
    });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting verification',
      error: error.message
    });
  }
};

// @desc    Verify OTP and complete ticket (Assigned Technician)
// @route   POST /api/tickets/:id/verify-completion
// @access  Private (Assigned Technician, Admin)
export const verifyTicketCompletion = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await applyTicketDeadline(ticket);

    if (ticket.status === 'Unsolved') {
      return res.status(400).json({
        success: false,
        message: 'This ticket crossed the 24-hour completion window and is marked as unsolved'
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignedTechnician =
      req.user.role === 'technician' &&
      ticket.assignedTo?._id?.toString() === req.user._id.toString();

    // Verification is performed by the assigned technician (OTP is shared by employee)
    if (!isAdmin && !isAssignedTechnician) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned technician can verify completion'
      });
    }

    // Check if OTP exists
    if (!ticket.verification?.otp) {
      return res.status(400).json({
        success: false,
        message: 'No verification request found for this ticket'
      });
    }

    // Check if OTP has expired
    if (new Date() > new Date(ticket.verification.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new verification code.'
      });
    }

    // Verify OTP
    if (ticket.verification.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Mark ticket as completed
    ticket.status = 'Resolved';
    ticket.verification.isVerified = true;
    ticket.verification.verifiedAt = new Date();
    // Clear OTP after successful verification
    ticket.verification.otp = undefined;
    ticket.verification.otpExpiry = undefined;
    ticket.resolution = {
      text: isAdmin
        ? 'Ticket completed and verified by admin using employee OTP'
        : 'Ticket completed and verified by technician using employee OTP',
      resolvedBy: ticket.assignedTo?._id || req.user._id,
      resolvedAt: new Date()
    };

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket completed successfully',
      data: { ticket }
    });
  } catch (error) {
    console.error('Verify completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying ticket completion',
      error: error.message
    });
  }
};
