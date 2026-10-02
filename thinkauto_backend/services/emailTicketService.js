import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import { sendTicketCreatedEmail, sendTicketAssignedEmail } from './emailService.js';
import { analyzeIssue, findLeastLoadedTechnician } from './ticketRoutingService.js';
import { primaryFrontendUrl } from '../utils/frontendUrl.js';

class EmailTicketService {
  constructor() {
    this.connection = null;
    this.isRunning = false;
    this.config = {
      imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASS,
        host: process.env.IMAP_HOST,
        port: parseInt(process.env.IMAP_PORT),
        tls: process.env.IMAP_TLS === 'true',
        authTimeout: 30000, // Increased to 30 seconds
        connTimeout: 30000, // Connection timeout
        tlsOptions: {
          rejectUnauthorized: false,
          servername: process.env.IMAP_HOST // Add servername for SNI
        }
      }
    };
    this.checkInterval = parseInt(process.env.IMAP_CHECK_INTERVAL) || 60000; // Increased to 60 seconds
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 5;
    this.isEnabled = false;
  }

  async start() {
    if (this.isRunning) {
      console.log('📧 Email listener is already running');
      return;
    }

    // Validate IMAP configuration
    if (!this.validateConfig()) {
      console.warn('⚠️  Email listener disabled: Missing IMAP configuration');
      console.log('   Please configure IMAP settings in .env file to enable email-based ticket creation');
      return;
    }

    try {
      console.log('📧 Starting Email-Based Ticket Creation Service...');
      console.log(`   IMAP Host: ${this.config.imap.host}`);
      console.log(`   IMAP User: ${this.config.imap.user}`);
      console.log(`   Check Interval: ${this.checkInterval / 1000}s`);

      this.isRunning = true;
      this.isEnabled = true;

      // Test connection first
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        console.warn('⚠️  Email listener disabled: Cannot connect to IMAP server');
        console.log('   Server will continue without email monitoring');
        this.isRunning = false;
        this.isEnabled = false;
        return;
      }

      console.log('✅ IMAP connection test successful!');

      // Initial check
      await this.checkEmails();

      // Set up periodic checking
      this.intervalId = setInterval(async () => {
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          console.error(`❌ Email listener stopped after ${this.maxConsecutiveErrors} consecutive errors`);
          this.stop();
          return;
        }
        await this.checkEmails();
      }, this.checkInterval);

      console.log(`✅ Email listener started! Checking every ${this.checkInterval / 1000}s for emails with subject "ThinkAuto"`);
    } catch (error) {
      console.error('❌ Failed to start email listener:', error.message);
      this.isRunning = false;
      this.isEnabled = false;
    }
  }

  validateConfig() {
    const required = ['IMAP_HOST', 'IMAP_PORT', 'IMAP_USER', 'IMAP_PASS'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.warn(`   Missing: ${missing.join(', ')}`);
      return false;
    }

    return true;
  }

  // Connect to IMAP with a timeout. Error listeners are attached to both the
  // imap-simple wrapper and the raw node-imap connection and are never removed:
  // Gmail often resets the socket (ECONNRESET) after LOGOUT, and an 'error'
  // event emitted with no listener is thrown as an uncaught exception.
  async connect(label) {
    let timer;
    const connectPromise = imaps.connect(this.config).then((conn) => {
      const onError = (err) => {
        if (err && err.code === 'ECONNRESET') return; // expected on close
        console.error(`${label} error: ${err.message}`);
      };
      conn.on('error', onError);
      conn.imap.on('error', onError);
      return conn;
    });

    try {
      return await Promise.race([
        connectPromise,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Connection timeout after 30s')), 30000);
        })
      ]);
    } catch (error) {
      // If the connect finishes after the timeout fired, close that connection too
      connectPromise.then((conn) => this.closeConnection(conn)).catch(() => {});
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  closeConnection(connection) {
    if (!connection) return;
    try {
      connection.end();
    } catch (e) {
      // Ignore - connection might already be closed
    }
  }

  async testConnection() {
    try {
      console.log('   Testing IMAP connection...');
      const connection = await this.connect('   IMAP connection');
      this.closeConnection(connection);
      return true;
    } catch (error) {
      console.error(`   Connection test failed: ${error.message}`);
      return false;
    }
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.connection) {
      this.connection.end();
    }
    this.isRunning = false;
    console.log('📧 Email listener stopped');
  }

  async checkEmails() {
    if (!this.isEnabled) {
      return;
    }

    let connection = null;

    try {
      connection = await this.connect('IMAP');

      // Open inbox
      await connection.openBox('INBOX');

      // Search for UNSEEN emails with subject containing "ThinkAuto"
      const searchCriteria = [
        'UNSEEN',
        ['SUBJECT', 'ThinkAuto']
      ];

      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: false
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      if (messages.length === 0) {
        this.closeConnection(connection);
        // Reset error counter on successful connection
        this.consecutiveErrors = 0;
        return;
      }

      console.log(`📬 Found ${messages.length} new ThinkAuto email(s)`);

      // Process each email
      for (const item of messages) {
        try {
          await this.processEmail(item, connection);
        } catch (error) {
          console.error('Error processing email:', error.message);
        }
      }

      this.closeConnection(connection);

      // Reset error counter on successful check
      this.consecutiveErrors = 0;

    } catch (error) {
      this.consecutiveErrors++;

      if (error.message.includes('Timed out') || error.message.includes('ECONNRESET') || error.message.includes('EPIPE') || error.message.includes('timeout')) {
        console.warn(`⚠️  Email check timeout/connection issue (${this.consecutiveErrors}/${this.maxConsecutiveErrors})`);
      } else {
        console.error(`❌ Error checking emails (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error.message);
      }

      this.closeConnection(connection);

      // If too many consecutive errors, suggest troubleshooting
      if (this.consecutiveErrors >= this.maxConsecutiveErrors - 1) {
        console.error('\n⚠️  Persistent IMAP connection issues detected!');
        console.error('   Possible causes:');
        console.error('   1. Invalid Gmail App Password (check IMAP_PASS in .env)');
        console.error('   2. IMAP not enabled in Gmail settings');
        console.error('   3. Network/firewall blocking connection');
        console.error('   4. Gmail rate limiting');
        console.error('   Solution: Verify Gmail settings and App Password\n');
      }
    }
  }

  async processEmail(item, connection) {
    const id = item.attributes.uid;

    try {
      const all = item.parts.find(part => part.which === '');
      const idHeader = `Imap-Id: ${id}\r\n`;

      // Parse email
      const mail = await simpleParser(idHeader + all.body);

      const senderEmail = mail.from.value[0].address;
      const senderName = mail.from.value[0].name || senderEmail.split('@')[0];
      const subject = mail.subject || '';
      const body = mail.text || mail.html || '';

      console.log(`\n📨 Processing email from: ${senderEmail}`);
      console.log(`   Subject: ${subject}`);

      // Verify subject contains "ThinkAuto" (case-insensitive)
      if (!subject.toLowerCase().includes('thinkauto')) {
        console.log('   ⚠️  Skipping: Subject does not contain "ThinkAuto"');
        await connection.addFlags(id, '\\Seen');
        return;
      }

      // Extract issue description from body
      const issueDescription = this.extractIssueDescription(body);
      console.log(`   Body preview: ${issueDescription.substring(0, 100)}...`);

      if (!issueDescription || issueDescription.length < 10) {
        console.log('   ⚠️  Skipping: Issue description too short');
        await connection.addFlags(id, '\\Seen');
        return;
      }

      // Find REGISTERED employee only (DO NOT auto-create) - case-insensitive email search
      let user = await User.findOne({
        email: { $regex: new RegExp(`^${senderEmail}$`, 'i') },
        role: 'employee'
      });

      if (!user) {
        console.log(` ⚠️ Skipping: Email sender is not a registered employee`);
        console.log(` 👉 Please register at the portal first: ${primaryFrontendUrl}/signup`);
        await connection.addFlags(id, '\\Seen');
        return;
      }

      console.log(`   ✅ Verified registered employee: ${user.name}`)

      // Analyze with ML (falls back to keyword priority if the ML service is unavailable)
      console.log('   🤖 Analyzing issue with ML...');
      const { category, priority } = await analyzeIssue(issueDescription, this.detectPriority(issueDescription));

      // Auto-assign to the least-loaded technician in the matching department
      const assignedTechnician = await findLeastLoadedTechnician(category);

      // Generate title from email subject (remove "ThinkAuto" prefix if present)
      let ticketTitle = subject.replace(/thinkauto\s*-?\s*/gi, '').trim();
      if (!ticketTitle || ticketTitle.length < 5) {
        // Fallback: Use first 100 chars of description
        ticketTitle = issueDescription.substring(0, 100).trim();
      }

      // Create ticket with title
      const ticket = await Ticket.create({
        title: ticketTitle,
        description: issueDescription,
        category: category,
        priority: priority,
        status: 'Open',
        createdBy: user._id,
        assignedTo: assignedTechnician ? assignedTechnician._id : null,
        source: 'email' // Mark as email-created ticket
      });

      // Populate references
      await ticket.populate('createdBy', 'name email');
      if (assignedTechnician) {
        await ticket.populate('assignedTo', 'name email');
      }

      console.log(`   🎫 Ticket created: ${ticket.ticketNumber}`);

      // Send confirmation email to employee
      console.log(`   📧 Sending confirmation to employee: ${user.email}`);
      const employeeEmailResult = await sendTicketCreatedEmail(user.email, ticket);
      if (employeeEmailResult.success) {
        console.log(`   ✅ Ticket creation email sent to: ${user.email}`);
      } else {
        console.error(`   ❌ Failed to send employee email: ${employeeEmailResult.error}`);
      }

      // Send assignment email to technician
      if (assignedTechnician) {
        console.log(`   📧 Sending assignment to technician: ${assignedTechnician.email}`);
        const technicianEmailResult = await sendTicketAssignedEmail(assignedTechnician.email, assignedTechnician.name, ticket);
        if (technicianEmailResult.success) {
          console.log(`   ✅ Ticket assignment email sent to: ${assignedTechnician.email}`);
        } else {
          console.error(`   ❌ Failed to send technician email: ${technicianEmailResult.error}`);
        }
      }

      // Mark email as seen (IMPORTANT!)
      await connection.addFlags(id, '\\Seen');
      console.log(`   ✅ Email processed successfully!\n`);

    } catch (error) {
      console.error(`   ❌ Error processing email:`, error.message);
      // Mark as seen even on error to prevent reprocessing
      try {
        await connection.addFlags(id, '\\Seen');
        console.log(`   ⚠️  Email marked as seen to prevent reprocessing`);
      } catch (flagError) {
        console.error(`   ❌ Failed to mark email as seen:`, flagError.message);
      }
      throw error;
    }
  }

  extractIssueDescription(body) {
    // Remove email signatures, replies, forwarded content
    let cleaned = body
      .replace(/On .* wrote:/g, '') // Remove reply headers
      .replace(/From:.*$/gm, '') // Remove forwarded headers
      .replace(/Sent:.*$/gm, '')
      .replace(/To:.*$/gm, '')
      .replace(/Subject:.*$/gm, '')
      .replace(/-----Original Message-----/g, '')
      .replace(/>+/g, '') // Remove reply markers
      .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
      .trim();

    // Take first 1000 characters
    return cleaned.substring(0, 1000);
  }

  detectPriority(description) {
    const text = description.toLowerCase();

    const criticalKeywords = ['urgent', 'critical', 'emergency', 'down', 'not working', 'stopped', 'failed'];
    const highKeywords = ['important', 'asap', 'priority', 'serious', 'broken'];
    const lowKeywords = ['when possible', 'low priority', 'minor', 'cosmetic'];

    if (criticalKeywords.some(keyword => text.includes(keyword))) {
      return 'Critical';
    }
    if (highKeywords.some(keyword => text.includes(keyword))) {
      return 'High';
    }
    if (lowKeywords.some(keyword => text.includes(keyword))) {
      return 'Low';
    }

    return 'Medium';
  }
}

// Export singleton instance
const emailTicketService = new EmailTicketService();
export default emailTicketService;
