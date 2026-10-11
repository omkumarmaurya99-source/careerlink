// ==================================================
// CareerLink - Job Recommendation Service
// ==================================================
// Candidate ke skills ke basis pe matching jobs recommend karta hai
// Simple skill-match score algorithm - transparent aur deterministic

const Job = require('../models/Job');
const User = require('../models/User');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class RecommendationService {
  // User ke skills ke basis pe jobs recommend karo
  // Algorithm: Candidate skills aur Job skills ka intersection / Job skills total
  static async getRecommendations(userId, { page = 1, limit = 10 }) {
    // User find karo aur uske skills dekho
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Agar user ke skills nahi hain toh recommend nahi kar sakte
    if (!user.skills || user.skills.length === 0) {
      logger.info(`No skills found for user ${userId}, returning empty recommendations`);
      return {
        recommendations: [],
        userSkills: [],
        message: 'Add skills to your profile to get job recommendations',
        algorithm: 'skill-match-score',
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: 0,
          totalPages: 0,
        },
      };
    }

    // User ke skills ko lowercase mein convert karo matching ke liye
    const userSkills = user.skills.map((s) => s.toLowerCase().trim());

    // Active jobs fetch karo jo kisi bhi user skill se match karti hain
    const jobs = await Job.find({
      status: 'active',
      // $in operator - koi bhi user skill job skills mein ho
      skills: { $in: userSkills },
    })
      .populate('recruiter', 'name email company')
      .lean();

    // Har job ke liye match score calculate karo
    // Match Score = (matched skills / job required skills) * 100
    const scoredJobs = jobs.map((job) => {
      const jobSkills = job.skills.map((s) => s.toLowerCase().trim());

      // Matching skills find karo - intersection of user skills and job skills
      const matchedSkills = userSkills.filter((skill) =>
        jobSkills.includes(skill)
      );

      // Missing skills - jo job maang rahi hai par user ke paas nahi hain
      const missingSkills = jobSkills.filter(
        (skill) => !userSkills.includes(skill)
      );

      // Match percentage calculate karo
      // Formula: (Number of matched skills / Total job skills) * 100
      const matchPercentage =
        jobSkills.length > 0
          ? Math.round((matchedSkills.length / jobSkills.length) * 100)
          : 0;

      return {
        job,
        matchedSkills,
        missingSkills,
        matchPercentage,
        totalJobSkills: jobSkills.length,
        totalMatchedSkills: matchedSkills.length,
        // Explanation text generate karo
        explanation: `${matchedSkills.length} out of ${jobSkills.length} required skills matched (${matchPercentage}%). Matched: [${matchedSkills.join(', ')}]${missingSkills.length > 0 ? `. Missing: [${missingSkills.join(', ')}]` : ''}`,
      };
    });

    // Score ke basis pe sort karo - highest match pehle
    scoredJobs.sort((a, b) => {
      // Pehle match percentage se sort
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      // Agar percentage same hai toh matched skills count se sort
      return b.totalMatchedSkills - a.totalMatchedSkills;
    });

    // Pagination apply karo
    const totalItems = scoredJobs.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedJobs = scoredJobs.slice(startIndex, startIndex + parseInt(limit));

    logger.info(
      `Recommendations generated for user ${userId}: ${totalItems} matching jobs found`
    );

    return {
      recommendations: paginatedJobs,
      userSkills,
      algorithm: 'skill-match-score',
      algorithmDescription:
        'Match Score = (Number of matched skills ÷ Total required skills) × 100. Jobs are sorted by match percentage in descending order.',
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
      },
    };
  }
}

module.exports = RecommendationService;
