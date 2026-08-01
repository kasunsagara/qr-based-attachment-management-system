const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const Attachment = require('../models/Attachment');
const Module = require('../models/Module');
const AttachmentType = require('../models/AttachmentType');
const ScanHistory = require('../models/ScanHistory');

const getFrontendBaseUrl = (req) => {
  const configuredUrl = process.env.FRONTEND_URL?.trim() || 'https://qr-based-attachment.vercel.app';
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    try {
      const parsedUrl = new URL(origin);
      return `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch (error) {
      console.warn('Invalid origin header:', origin);
    }
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  if (forwardedProto && forwardedHost) {
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
    const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
    return `${proto}://${host}`;
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://qr-based-attachment.vercel.app'
    : 'http://localhost:5173';
};

/**
 * @desc    Generate QR code for a single attachment
 * @route   POST /api/qr/generate/:attachmentId
 * @access  Private/Admin
 */
exports.generateQR = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.attachmentId)
      .populate('moduleId', 'moduleNumber')
      .populate('attachmentTypeId', 'attachmentName');

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    const frontendUrl = getFrontendBaseUrl(req);
    const qrUrl = `${frontendUrl}/qr/${attachment.qrId}`;

    // Generate QR code as data URL
    const qrImage = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    // Save QR image to attachment
    attachment.qrImage = qrImage;
    await attachment.save();

    res.status(200).json({
      success: true,
      data: {
        qrId: attachment.qrId,
        qrImage,
        qrUrl,
        moduleNumber: attachment.moduleId.moduleNumber,
        attachmentName: attachment.attachmentTypeId.attachmentName,
      },
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Bulk generate QR codes for all attachments missing QR images
 * @route   POST /api/qr/bulk-generate
 * @access  Private/Admin
 */
exports.bulkGenerateQR = async (req, res) => {
  try {
    const frontendUrl = getFrontendBaseUrl(req);

    // Find attachments without QR images
    const attachments = await Attachment.find({
      $or: [{ qrImage: '' }, { qrImage: { $exists: false } }],
    })
      .populate('moduleId', 'moduleNumber')
      .populate('attachmentTypeId', 'attachmentName');

    if (attachments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All attachments already have QR codes',
        generated: 0,
      });
    }

    let generated = 0;
    for (const attachment of attachments) {
      const qrUrl = `${frontendUrl}/qr/${attachment.qrId}`;
      const qrImage = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });

      attachment.qrImage = qrImage;
      await attachment.save();
      generated++;
    }

    res.status(200).json({
      success: true,
      message: `Generated ${generated} QR code(s)`,
      generated,
    });
  } catch (error) {
    console.error('Bulk generate QR error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Bulk create missing attachments and generate QR codes
 * @route   POST /api/qr/bulk-create
 * @access  Private/Admin
 */
exports.bulkCreateAndGenerate = async (req, res) => {
  try {
    const frontendUrl = getFrontendBaseUrl(req);
    const modules = await Module.find().sort({ moduleNumber: 1 });
    const types = await AttachmentType.find().sort({ attachmentName: 1 });

    let created = 0;
    let qrGenerated = 0;

    for (const mod of modules) {
      for (const type of types) {
        // Check if attachment already exists
        let attachment = await Attachment.findOne({
          moduleId: mod._id,
          attachmentTypeId: type._id,
        });

        if (!attachment) {
          // Generate QR ID
          const lastAttachment = await Attachment.findOne().sort({ qrId: -1 });
          let nextNum = 1;
          if (lastAttachment && lastAttachment.qrId) {
            nextNum = parseInt(lastAttachment.qrId.replace('QR', '')) + 1;
          }
          const qrId = `QR${String(nextNum).padStart(4, '0')}`;

          attachment = await Attachment.create({
            qrId,
            moduleId: mod._id,
            attachmentTypeId: type._id,
            status: 'active',
          });
          created++;
        }

        // Generate QR if missing
        if (!attachment.qrImage) {
          const qrUrl = `${frontendUrl}/qr/${attachment.qrId}`;
          const qrImage = await QRCode.toDataURL(qrUrl, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H',
          });
          attachment.qrImage = qrImage;
          await attachment.save();
          qrGenerated++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Created ${created} attachment(s), generated ${qrGenerated} QR code(s)`,
      created,
      qrGenerated,
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Scan QR code - public endpoint
 * @route   GET /api/qr/scan/:qrId
 * @access  Public
 */
exports.scanQR = async (req, res) => {
  try {
    const { qrId } = req.params;

    const attachment = await Attachment.findOne({ qrId })
      .populate('moduleId', 'moduleNumber description')
      .populate('attachmentTypeId', 'attachmentName description');

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not found. Invalid or expired QR code.',
      });
    }

    // Record scan history
    const deviceInfo = req.headers['user-agent'] || '';
    await ScanHistory.create({
      attachmentId: attachment._id,
      qrId: attachment.qrId,
      moduleNumber: attachment.moduleId.moduleNumber,
      attachmentName: attachment.attachmentTypeId.attachmentName,
      deviceInfo,
    });

    res.status(200).json({
      success: true,
      data: {
        qrId: attachment.qrId,
        moduleNumber: attachment.moduleId.moduleNumber,
        moduleDescription: attachment.moduleId.description,
        attachmentName: attachment.attachmentTypeId.attachmentName,
        attachmentDescription: attachment.attachmentTypeId.description,
        status: attachment.status,
        createdAt: attachment.createdAt,
      },
    });
  } catch (error) {
    console.error('Scan QR error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Download QR code image
 * @route   GET /api/qr/download/:attachmentId
 * @access  Private/Admin
 */
exports.downloadQR = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.attachmentId)
      .populate('moduleId', 'moduleNumber')
      .populate('attachmentTypeId', 'attachmentName');

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    if (!attachment.qrImage) {
      return res.status(400).json({ success: false, message: 'QR code not generated yet' });
    }

    // Convert base64 to buffer
    const base64Data = attachment.qrImage.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const filename = `QR_Module${attachment.moduleId.moduleNumber}_${attachment.attachmentTypeId.attachmentName.replace(/\s+/g, '_')}.png`;

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Download QR error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Generate PDF with QR labels
 * @route   POST /api/qr/pdf
 * @access  Private/Admin
 */
exports.generatePDF = async (req, res) => {
  try {
    const { attachmentIds, ignoreQuantity } = req.body;

    let query = {};
    if (attachmentIds && attachmentIds.length > 0) {
      query._id = { $in: attachmentIds };
    }

    const attachments = await Attachment.find(query)
      .populate('moduleId', 'moduleNumber')
      .populate('attachmentTypeId', 'attachmentName')
      .sort({ qrId: 1 });

    if (attachments.length === 0) {
      return res.status(404).json({ success: false, message: 'No attachments found' });
    }

    // Filter out attachments without QR images
    const withQR = attachments.filter((a) => a.qrImage);
    if (withQR.length === 0) {
      return res.status(400).json({ success: false, message: 'No QR codes generated yet' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 30 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="QR_Labels.pdf"');
    doc.pipe(res);

    const labelsPerRow = 3;
    const labelWidth = 170;
    const labelHeight = 200;
    const startX = 30;
    const startY = 30;
    const gapX = 10;
    const gapY = 15;

    let col = 0;
    let row = 0;

    for (let i = 0; i < withQR.length; i++) {
      const att = withQR[i];
      const qty = ignoreQuantity ? 1 : (att.quantity || 1);

      for (let j = 0; j < qty; j++) {
        if (row > 0 && row * (labelHeight + gapY) + startY + labelHeight > 780) {
          doc.addPage();
          row = 0;
          col = 0;
        }

        const x = startX + col * (labelWidth + gapX);
        const y = startY + row * (labelHeight + gapY);

        // Draw label border
        doc.rect(x, y, labelWidth, labelHeight).stroke('#cccccc');

        // Draw QR image
        const base64Data = att.qrImage.replace(/^data:image\/png;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imgBuffer, x + 35, y + 5, { width: 100, height: 100 });

        // Label text
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text(att.qrId, x + 5, y + 110, { width: labelWidth - 10, align: 'center' });

        doc.fontSize(8).font('Helvetica');
        doc.text(`Module: ${att.moduleId.moduleNumber}`, x + 5, y + 125, {
          width: labelWidth - 10,
          align: 'center',
        });
        doc.text(att.attachmentTypeId.attachmentName, x + 5, y + 138, {
          width: labelWidth - 10,
          align: 'center',
        });

        // Draw a thin line separator
        doc.moveTo(x + 10, y + 155).lineTo(x + labelWidth - 10, y + 155).stroke('#eeeeee');

        doc.fontSize(6).fillColor('#888888');
        doc.text('Scan with phone camera', x + 5, y + 160, {
          width: labelWidth - 10,
          align: 'center',
        });
        doc.fillColor('#000000');

        col++;
        if (col >= labelsPerRow) {
          col = 0;
          row++;
        }
      }
    }

    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
