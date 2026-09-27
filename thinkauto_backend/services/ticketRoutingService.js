import fetch from 'node-fetch';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Ask the ML service for category and priority.
// Falls back to defaults if the service is asleep or unreachable, so a ticket is never lost.
export const analyzeIssue = async (description, fallbackPriority = 'Medium') => {
  const result = { category: 'Others', priority: fallbackPriority, assignedTeam: 'General Support Team' };

  try {
    const mlResponse = await fetch(`${ML_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue: description })
    });

    if (!mlResponse.ok) {
      throw new Error(`ML service request failed: ${mlResponse.status}`);
    }

    const mlData = await mlResponse.json();
    if (mlData.success === false) {
      throw new Error(`ML service error: ${mlData.error || 'Unknown error'}`);
    }

    const payload = mlData.data || mlData;
    result.category = payload.category || result.category;
    result.priority = payload.priority || result.priority;
    result.assignedTeam = payload.assignedTeam || result.assignedTeam;
    console.log('✓ ML Analysis:', result);
  } catch (mlError) {
    console.warn('⚠ ML service unavailable, using defaults:', mlError.message);
  }

  return result;
};

// Pick the active technician with the fewest open tickets, preferring the matching department.
// Returns null if there are no technicians.
export const findLeastLoadedTechnician = async (category) => {
  try {
    const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let technicians = await User.find({
      role: 'technician',
      isActive: true,
      department: { $regex: new RegExp(`^${escaped}$`, 'i') }
    });

    if (technicians.length === 0) {
      console.log(`⚠ No ${category} specialist found, falling back to any active technician`);
      technicians = await User.find({ role: 'technician', isActive: true });
    }

    if (technicians.length === 0) {
      console.log('⚠ No technicians found in the system');
      return null;
    }

    const techLoads = await Promise.all(
      technicians.map(async (tech) => ({
        tech,
        load: await Ticket.countDocuments({ assignedTo: tech._id, status: { $in: ['Open', 'In Progress'] } })
      }))
    );
    techLoads.sort((a, b) => a.load - b.load);

    const { tech, load } = techLoads[0];
    console.log(`✓ Auto-assigned to technician: ${tech.name} (load: ${load} tickets)`);
    return tech;
  } catch (error) {
    console.warn('⚠ Auto-assignment failed:', error.message);
    return null;
  }
};
