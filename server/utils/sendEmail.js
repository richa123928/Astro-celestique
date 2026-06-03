const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email utility
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Astro Celestique" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

// Team notification email when puja is booked
const sendPujaBookingNotification = async (puja, user) => {
  const pujaNames = {
    grah_shanti:         'Grah Shanti Pooja',
    death_shanti:        'Death Shanti Pooja',
    lakshmi_vriddhi:     'Lakshmi Vriddhi Pooja',
    love_relationship:   'Love / Relationship Pooja',
    new_home:            'New Home Pooja',
    saraswati:           'Saraswati Pooja',
    marriage:            'Marriage Pooja',
    sarv_karya_samporan: 'Sarv Karya Samporan Pooja',
  };

  const pujaName = pujaNames[puja.pujaType] || puja.pujaType;

  // Email to TEAM
  await sendEmail({
    to: process.env.TEAM_EMAIL,
    subject: `🙏 New Puja Booking — ${pujaName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1528; color: #eee8d5; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #e8b460; font-size: 28px; margin: 0;">◉ Astro Celestique</h1>
          <p style="color: #8899aa; margin: 8px 0 0;">New Puja Booking Received</p>
        </div>

        <div style="background: #131c30; border: 1px solid rgba(201,150,60,0.15); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #e8b460; margin: 0 0 16px;">📋 Booking Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8899aa; width: 40%;">Puja Type</td><td style="padding: 8px 0; color: #eee8d5; font-weight: bold;">${pujaName}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Amount</td><td style="padding: 8px 0; color: #e8b460; font-weight: bold;">₹${puja.amountINR}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Status</td><td style="padding: 8px 0; color: #4ade80;">Pending Confirmation</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Preferred Date</td><td style="padding: 8px 0; color: #eee8d5;">${puja.preferredDate ? new Date(puja.preferredDate).toDateString() : 'Flexible'}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Special Notes</td><td style="padding: 8px 0; color: #eee8d5;">${puja.specialNotes || 'None'}</td></tr>
          </table>
        </div>

        <div style="background: #131c30; border: 1px solid rgba(201,150,60,0.15); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #e8b460; margin: 0 0 16px;">👤 User Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8899aa; width: 40%;">Name</td><td style="padding: 8px 0; color: #eee8d5;">${user.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Email</td><td style="padding: 8px 0; color: #eee8d5;">${user.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Phone</td><td style="padding: 8px 0; color: #eee8d5;">${user.phone || 'Not provided'}</td></tr>
          </table>
        </div>

        <div style="background: #131c30; border: 1px solid rgba(201,150,60,0.15); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #e8b460; margin: 0 0 16px;">🌟 Primary Person</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8899aa; width: 40%;">Name</td><td style="padding: 8px 0; color: #eee8d5;">${puja.primaryPerson?.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Date of Birth</td><td style="padding: 8px 0; color: #eee8d5;">${puja.primaryPerson?.dob ? new Date(puja.primaryPerson.dob).toDateString() : 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Time of Birth</td><td style="padding: 8px 0; color: #eee8d5;">${puja.primaryPerson?.timeNotAvailable ? 'Not Available' : puja.primaryPerson?.timeOfBirth || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Place of Birth</td><td style="padding: 8px 0; color: #eee8d5;">${puja.primaryPerson?.placeOfBirth}</td></tr>
          </table>
        </div>

        ${puja.secondaryPerson?.name ? `
        <div style="background: #131c30; border: 1px solid rgba(201,150,60,0.15); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #e8b460; margin: 0 0 16px;">💑 Partner Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8899aa; width: 40%;">Name</td><td style="padding: 8px 0; color: #eee8d5;">${puja.secondaryPerson.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Date of Birth</td><td style="padding: 8px 0; color: #eee8d5;">${puja.secondaryPerson.dob ? new Date(puja.secondaryPerson.dob).toDateString() : 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Place of Birth</td><td style="padding: 8px 0; color: #eee8d5;">${puja.secondaryPerson.placeOfBirth || 'N/A'}</td></tr>
          </table>
        </div>` : ''}

        ${puja.deceasedDetails?.name ? `
        <div style="background: #131c30; border: 1px solid rgba(201,150,60,0.15); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #e8b460; margin: 0 0 16px;">🕯️ Deceased Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8899aa; width: 40%;">Name</td><td style="padding: 8px 0; color: #eee8d5;">${puja.deceasedDetails.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Date of Death</td><td style="padding: 8px 0; color: #eee8d5;">${puja.deceasedDetails.dateOfDeath ? new Date(puja.deceasedDetails.dateOfDeath).toDateString() : 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Place of Death</td><td style="padding: 8px 0; color: #eee8d5;">${puja.deceasedDetails.placeOfDeath || 'N/A'}</td></tr>
          </table>
        </div>` : ''}

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(201,150,60,0.15);">
          <p style="color: #8899aa; font-size: 13px;">Please contact the user within 24 hours to confirm the booking.</p>
          <p style="color: #8899aa; font-size: 13px;">Reply to: <a href="mailto:${user.email}" style="color: #e8b460;">${user.email}</a></p>
        </div>
      </div>
    `
  });

  // Confirmation email to USER
  await sendEmail({
    to: user.email,
    subject: `🙏 Booking Confirmed — ${pujaName} | Astro Celestique`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1528; color: #eee8d5; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #e8b460; font-size: 28px; margin: 0;">◉ Astro Celestique</h1>
          <p style="color: #8899aa; margin: 8px 0 0;">Ancient Vedic Wisdom, Reimagined</p>
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 64px; margin-bottom: 16px;">🙏</div>
          <h2 style="color: #eee8d5; font-size: 28px; margin: 0 0 8px;">Booking Received!</h2>
          <p style="color: #8899aa;">Your ${pujaName} has been successfully booked.</p>
        </div>

        <div style="background: #131c30; border: 1px solid rgba(201,150,60,0.15); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #e8b460; margin: 0 0 16px;">Booking Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8899aa; width: 40%;">Puja</td><td style="padding: 8px 0; color: #eee8d5; font-weight: bold;">${pujaName}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Amount</td><td style="padding: 8px 0; color: #e8b460; font-weight: bold;">₹${puja.amountINR}</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Status</td><td style="padding: 8px 0; color: #fbbf24;">Pending Confirmation</td></tr>
            <tr><td style="padding: 8px 0; color: #8899aa;">Preferred Date</td><td style="padding: 8px 0; color: #eee8d5;">${puja.preferredDate ? new Date(puja.preferredDate).toDateString() : 'Flexible'}</td></tr>
          </table>
        </div>

        <div style="background: rgba(201,150,60,0.1); border: 1px solid rgba(201,150,60,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #e8b460; margin: 0 0 8px;">What happens next?</h3>
          <p style="color: #8899aa; margin: 0; line-height: 1.6;">
            Our team will contact you within <strong style="color: #eee8d5;">24 hours</strong> to confirm your booking details and arrange the ceremony. Please keep your phone and email accessible.
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(201,150,60,0.15);">
          <p style="color: #8899aa; font-size: 13px;">Questions? Reply to this email or contact us at</p>
          <a href="mailto:${process.env.TEAM_EMAIL}" style="color: #e8b460;">${process.env.TEAM_EMAIL}</a>
          <p style="color: #445566; font-size: 12px; margin-top: 16px;">© 2026 Astro Celestique · Made in Bharat</p>
        </div>
      </div>
    `
  });
};

// Send welcome email when user registers
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: '🌟 Welcome to Astro Celestique!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1528; color: #eee8d5; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #e8b460; font-size: 28px; margin: 0;">◉ Astro Celestique</h1>
          <p style="color: #8899aa;">Ancient Vedic Wisdom, Reimagined</p>
        </div>
        <h2 style="color: #eee8d5;">Namaste, ${user.name}! 🙏</h2>
        <p style="color: #8899aa; line-height: 1.7;">
          Welcome to Astro Celestique — your gateway to ancient Vedic wisdom reimagined for modern life.
        </p>
        <p style="color: #8899aa; line-height: 1.7;">You can now access:</p>
        <ul style="color: #8899aa; line-height: 2;">
          <li>🔮 AI-powered horoscopes (Daily, Weekly, Monthly, Yearly)</li>
          <li>✨ Free Kundli generator</li>
          <li>💬 Chat with Jyoti — our Vedic AI Oracle</li>
          <li>🪐 Astrology calculators (Numerology, Moon Sign, and more)</li>
          <li>🙏 Sacred puja booking services</li>
          <li>👳 Live consultations with verified astrologers</li>
        </ul>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${process.env.CLIENT_URL}" style="background: #c9963c; color: #0a0f1e; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: bold; font-size: 15px;">
            Explore Astro Celestique →
          </a>
        </div>
        <p style="color: #445566; font-size: 12px; margin-top: 32px; text-align: center;">© 2026 Astro Celestique · Made in Bharat</p>
      </div>
    `
  });
};

module.exports = { sendEmail, sendPujaBookingNotification, sendWelcomeEmail };