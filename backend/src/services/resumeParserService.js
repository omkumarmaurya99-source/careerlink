// ==================================================
// CareerLink - Resume Parser Service
// ==================================================
// Resume file se text extract karta hai aur structured data nikalta hai
// PDF aur DOCX files supported hain

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class ResumeParserService {
  // Resume file parse karo aur structured data return karo
  static async parseResume(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      let rawText = '';

      // File type ke basis pe appropriate parser use karo
      if (ext === '.pdf') {
        rawText = await ResumeParserService.parsePDF(filePath);
      } else if (ext === '.docx') {
        rawText = await ResumeParserService.parseDOCX(filePath);
      } else if (ext === '.doc') {
        // .doc format ke liye limited support - text extraction try karo
        rawText = await ResumeParserService.parseDOC(filePath);
      } else {
        logger.warn(`Unsupported file format for parsing: ${ext}`);
        return { rawText: '', extractedSkills: [], extractedEmail: '', extractedPhone: '', extractedName: '' };
      }

      // Text se structured information extract karo
      const extractedData = ResumeParserService.extractInformation(rawText);

      logger.info(`Resume parsed successfully: ${path.basename(filePath)}`);

      return {
        rawText: rawText.substring(0, 5000), // Limit stored text
        ...extractedData,
        parsedAt: new Date(),
      };
    } catch (error) {
      logger.error(`Resume parsing error: ${error.message}`);
      return {
        rawText: '',
        extractedSkills: [],
        extractedEmail: '',
        extractedPhone: '',
        extractedName: '',
        error: 'Could not parse resume completely',
      };
    }
  }

  // PDF file parse karo
  static async parsePDF(filePath) {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    } catch (error) {
      logger.error(`PDF parsing error: ${error.message}`);
      return '';
    }
  }

  // DOCX file parse karo
  static async parseDOCX(filePath) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } catch (error) {
      logger.error(`DOCX parsing error: ${error.message}`);
      return '';
    }
  }

  // DOC file basic parsing (limited support)
  static async parseDOC(filePath) {
    try {
      // DOC format ka text extraction try karo
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } catch (error) {
      logger.warn(`DOC parsing limited support: ${error.message}`);
      return '';
    }
  }

  // Text se useful information extract karo using regex patterns
  // Deterministic approach - regex based extraction, no AI required
  static extractInformation(text) {
    const result = {
      extractedSkills: [],
      extractedEmail: '',
      extractedPhone: '',
      extractedName: '',
    };

    if (!text || text.trim().length === 0) {
      return result;
    }

    // Email extract karo - standard email regex pattern
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      result.extractedEmail = emails[0]; // Pehla email address
    }

    // Phone number extract karo - Indian aur international formats
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?(?:\d{5}[-.\s]?\d{5}|\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|\d{10})/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      result.extractedPhone = phones[0].trim();
    }

    // Common tech skills identify karo text mein
    // Yeh list commonly used technology skills ki hai
    const commonSkills = [
      'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift',
      'kotlin', 'typescript', 'go', 'golang', 'rust', 'scala', 'perl',
      'html', 'css', 'react', 'angular', 'vue', 'node.js', 'nodejs',
      'express', 'express.js', 'django', 'flask', 'spring', 'spring boot',
      'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud',
      'git', 'github', 'gitlab', 'jenkins', 'ci/cd',
      'rest', 'restful', 'graphql', 'api', 'microservices',
      'machine learning', 'deep learning', 'artificial intelligence',
      'data science', 'data analysis', 'sql', 'nosql',
      'firebase', 'heroku', 'netlify', 'vercel',
      'tailwind', 'bootstrap', 'sass', 'scss', 'less',
      'webpack', 'vite', 'babel', 'npm', 'yarn',
      'linux', 'unix', 'bash', 'shell scripting',
      'agile', 'scrum', 'jira', 'figma', 'photoshop',
      'tensorflow', 'pytorch', 'pandas', 'numpy',
      'power bi', 'tableau', 'excel',
      'communication', 'leadership', 'teamwork', 'problem solving',
    ];

    const lowerText = text.toLowerCase();
    const foundSkills = commonSkills.filter((skill) =>
      lowerText.includes(skill.toLowerCase())
    );

    // Unique skills only
    result.extractedSkills = [...new Set(foundSkills)];

    // Name extract karo - first line mein naam hone ki probability zyada hai
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // Check karo ki first line ek naam lag rahi hai (2-5 words, mostly alphabetic)
      if (
        firstLine.length > 1 &&
        firstLine.length < 60 &&
        /^[A-Za-z\s.'-]+$/.test(firstLine) &&
        firstLine.split(/\s+/).length <= 5
      ) {
        result.extractedName = firstLine;
      }
    }

    return result;
  }
}

module.exports = ResumeParserService;
