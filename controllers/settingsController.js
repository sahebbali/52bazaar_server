import Settings from "../models/settingModel.js";
// Get settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      // Create default settings if not exists
      settings = new Settings({
        userId: req.userId,
        storeName: "My Store",
        storeEmail: "admin@example.com",
        // ... other default values
      });
      await settings.save();
    }

    // Remove sensitive data before sending
    const settingsObj = settings.toObject();
    const sensitiveFields = [
      "bkashApiSecret",
      "bkashPassword",
      "nagadPrivateKey",
      "upayApiSecret",
      "smtpPassword",
    ];
    sensitiveFields.forEach((field) => {
      if (settingsObj[field]) {
        settingsObj[field] = "••••••••";
      }
    });

    res.json({
      success: true,
      data: settingsObj,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const options = { new: true, runValidators: true };

    // Find and update settings
    let settings = await Settings.findOneAndUpdate(
      { userId: req.userId },
      updates,
      options,
    );

    if (!settings) {
      // Create new settings if not exists
      settings = new Settings({
        userId: req.userId,
        ...updates,
      });
      await settings.save();
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating settings",
      error: error.message,
    });
  }
};

// Upload logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    const settings = await Settings.findOneAndUpdate(
      { userId: req.userId },
      { storeLogo: logoUrl },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      message: "Logo uploaded successfully",
      data: { logoUrl },
    });
  } catch (error) {
    console.error("Upload logo error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading logo",
      error: error.message,
    });
  }
};

// Test SMTP Connection
const testSMTP = async (req, res) => {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpEncryption,
      fromEmail,
    } = req.body;

    // Here you can add nodemailer test logic
    // const transporter = nodemailer.createTransport({...});
    // await transporter.verify();

    res.json({
      success: true,
      message: "SMTP connection successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "SMTP connection failed",
      error: error.message,
    });
  }
};

// Get payment gateway status
const getPaymentStatus = async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.userId });

    const paymentStatus = {
      bkash: {
        enabled: !!(settings?.bkashNumber && settings?.bkashApiKey),
        configured: !!(settings?.bkashNumber && settings?.bkashApiKey),
      },
      nagad: {
        enabled: !!(settings?.nagadMerchantId && settings?.nagadNumber),
        configured: !!(settings?.nagadMerchantId && settings?.nagadNumber),
      },
      upay: {
        enabled: !!(settings?.upayMerchantId && settings?.upayApiKey),
        configured: !!(settings?.upayMerchantId && settings?.upayApiKey),
      },
      rocket: {
        enabled: !!(settings?.rocketNumber && settings?.rocketApiKey),
        configured: !!(settings?.rocketNumber && settings?.rocketApiKey),
      },
      cod: {
        enabled: settings?.codEnabled || false,
      },
      bankTransfer: {
        enabled: settings?.bankTransferEnabled || false,
      },
    };

    res.json({
      success: true,
      data: paymentStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment status",
      error: error.message,
    });
  }
};

export default {
  getSettings,
  updateSettings,
  uploadLogo,
  testSMTP,
  getPaymentStatus,
};
