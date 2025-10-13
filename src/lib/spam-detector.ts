// Spam detection system with multiple detection methods

export interface SpamDetectionResult {
  isSpam: boolean;
  score: number; // 0-100, higher means more likely spam
  reasons: string[];
  confidence: 'low' | 'medium' | 'high';
  shouldBlock: boolean;
  shouldModerate: boolean;
}

export interface SpamDetectionConfig {
  // Score thresholds
  blockThreshold: number; // Default: 80
  moderateThreshold: number; // Default: 50
  
  // Detection methods weights
  keywordWeight: number; // Default: 30
  frequencyWeight: number; // Default: 25
  patternWeight: number; // Default: 20
  emailWeight: number; // Default: 15
  behaviorWeight: number; // Default: 10
  
  // Enable/disable specific methods
  enableKeywordDetection: boolean;
  enableFrequencyDetection: boolean;
  enablePatternDetection: boolean;
  enableEmailValidation: boolean;
  enableBehaviorAnalysis: boolean;
}

export class SpamDetector {
  private config: SpamDetectionConfig;
  private kv: any; // KVNamespace for storing frequency data

  constructor(kv: any, config?: Partial<SpamDetectionConfig>) {
    this.kv = kv;
    this.config = {
      blockThreshold: 80,
      moderateThreshold: 50,
      keywordWeight: 30,
      frequencyWeight: 25,
      patternWeight: 20,
      emailWeight: 15,
      behaviorWeight: 10,
      enableKeywordDetection: true,
      enableFrequencyDetection: true,
      enablePatternDetection: true,
      enableEmailValidation: true,
      enableBehaviorAnalysis: true,
      ...config
    };
  }

  // Main spam detection method
  async detectSpam(input: {
    email?: string;
    name?: string;
    message?: string;
    ipAddress?: string;
    userAgent?: string;
    phone?: string;
  }): Promise<SpamDetectionResult> {
    const results: {
      method: string;
      score: number;
      reasons: string[];
    }[] = [];

    // Run enabled detection methods
    if (this.config.enableKeywordDetection && input.message) {
      const keywordResult = this.detectKeywordSpam(input.message);
      results.push({
        method: 'keyword',
        score: keywordResult.score,
        reasons: keywordResult.reasons
      });
    }

    if (this.config.enableFrequencyDetection && input.ipAddress) {
      const frequencyResult = await this.detectFrequencySpam(input.ipAddress, input.email);
      results.push({
        method: 'frequency',
        score: frequencyResult.score,
        reasons: frequencyResult.reasons
      });
    }

    if (this.config.enablePatternDetection && input.message && input.email) {
      const patternResult = this.detectPatternSpam(input.message, input.email, input.name);
      results.push({
        method: 'pattern',
        score: patternResult.score,
        reasons: patternResult.reasons
      });
    }

    if (this.config.enableEmailValidation && input.email) {
      const emailResult = this.detectSuspiciousEmail(input.email);
      results.push({
        method: 'email',
        score: emailResult.score,
        reasons: emailResult.reasons
      });
    }

    if (this.config.enableBehaviorAnalysis && input.userAgent && input.ipAddress) {
      const behaviorResult = this.detectSuspiciousBehavior(input.userAgent, input.ipAddress);
      results.push({
        method: 'behavior',
        score: behaviorResult.score,
        reasons: behaviorResult.reasons
      });
    }

    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;
    const allReasons: string[] = [];

    for (const result of results) {
      const weight = this.getWeightForMethod(result.method);
      totalScore += result.score * weight;
      totalWeight += weight;
      allReasons.push(...result.reasons);
    }

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    // Determine confidence and actions
    const confidence = this.calculateConfidence(results.length, finalScore);
    const shouldBlock = finalScore >= this.config.blockThreshold;
    const shouldModerate = finalScore >= this.config.moderateThreshold && !shouldBlock;

    return {
      isSpam: shouldBlock || shouldModerate,
      score: Math.round(finalScore),
      reasons: [...new Set(allReasons)], // Remove duplicates
      confidence,
      shouldBlock,
      shouldModerate
    };
  }

  // Keyword-based spam detection
  private detectKeywordSpam(text: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Spam keywords (international and Indonesian context)
    const spamKeywords = [
      // International spam
      'viagra', 'cialis', 'lottery', 'winner', 'million dollars', 'inheritance',
      'click here', 'act now', 'limited time', 'urgent', 'congratulations',
      'casino', 'gambling', 'bitcoin', 'investment opportunity', 'free money',
      'guaranteed', 'risk free', 'no risk', 'instant cash', 'quick cash',
      
      // Indonesian spam keywords
      'duit gratis', 'kaya mendadak', 'investasi bodong', 'pinjaman online',
      'judi online', 'togel', 'slot', 'casino online', 'bonus besar',
      'hadiah undian', 'pemenang undian', 'selamat anda menang',
      
      // Commercial spam
      'buy now', 'order now', 'special offer', 'discount', 'promotion',
      'beli sekarang', 'promo spesial', 'diskon besar', 'harga murah'
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = spamKeywords.filter(keyword => lowerText.includes(keyword));

    if (foundKeywords.length > 0) {
      score += Math.min(foundKeywords.length * 20, 60);
      reasons.push(`Contains spam keywords: ${foundKeywords.slice(0, 3).join(', ')}`);
    }

    // Check for excessive capitalization
    const capitalRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capitalRatio > 0.5) {
      score += 15;
      reasons.push('Excessive capitalization');
    }

    // Check for excessive punctuation
    const punctuationCount = (text.match(/[!?.]/g) || []).length;
    if (punctuationCount > text.length / 10) {
      score += 10;
      reasons.push('Excessive punctuation');
    }

    // Check for suspicious URLs
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const urls = text.match(urlPattern);
    if (urls && urls.length > 2) {
      score += 20;
      reasons.push('Multiple URLs in message');
    }

    return { score: Math.min(score, 100), reasons };
  }

  // Frequency-based spam detection
  private async detectFrequencySpam(ipAddress: string, email?: string): Promise<{ score: number; reasons: string[] }> {
    const reasons: string[] = [];
    let score = 0;
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    try {
      // Check IP-based frequency
      const ipKey = `spam_frequency_ip:${ipAddress}`;
      const ipData = await this.kv.get(ipKey, 'json');
      
      if (ipData) {
        const recentSubmissions = (ipData.submissions || []).filter((timestamp: number) => timestamp > oneHourAgo);
        
        if (recentSubmissions.length >= 10) {
          score += 40;
          reasons.push('High frequency submissions from IP');
        } else if (recentSubmissions.length >= 5) {
          score += 25;
          reasons.push('Moderate frequency submissions from IP');
        }

        // Check for rapid submissions (within 5 minutes)
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        const rapidSubmissions = recentSubmissions.filter((timestamp: number) => timestamp > fiveMinutesAgo);
        
        if (rapidSubmissions.length >= 3) {
          score += 30;
          reasons.push('Rapid successive submissions');
        }
      }

      // Check email-based frequency
      if (email) {
        const emailKey = `spam_frequency_email:${email.toLowerCase()}`;
        const emailData = await this.kv.get(emailKey, 'json');
        
        if (emailData) {
          const recentEmailSubmissions = (emailData.submissions || []).filter((timestamp: number) => timestamp > oneDayAgo);
          
          if (recentEmailSubmissions.length >= 5) {
            score += 35;
            reasons.push('Multiple submissions from same email');
          }
        }
      }

    } catch (error) {
      console.error('Frequency detection error:', error);
    }

    return { score: Math.min(score, 100), reasons };
  }

  // Pattern-based spam detection
  private detectPatternSpam(message: string, email?: string, name?: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Check for generic/spammy message patterns
    const genericPatterns = [
      /^(hi|hello|hey)\s*$/i, // Just greetings
      /^(good|nice|great)\s*(site|website|page)$/i, // Generic compliments
      /^(test|testing|sample)$/i, // Test messages
      /^.{1,5}$/, // Very short messages
      /^(.)\1{10,}$/i, // Repeated characters
    ];

    for (const pattern of genericPatterns) {
      if (pattern.test(message.trim())) {
        score += 15;
        reasons.push('Generic or test message pattern');
        break;
      }
    }

    // Check for random character patterns
    const randomPattern = /^[a-zA-Z0-9]{10,}$/;
    if (randomPattern.test(message.replace(/\s/g, ''))) {
      score += 20;
      reasons.push('Random character pattern');
    }

    // Check email-name consistency
    if (email && name) {
      const emailLocal = email.split('@')[0].toLowerCase();
      const nameLower = name.toLowerCase().replace(/\s/g, '');
      
      // If email local part and name are completely different, might be suspicious
      if (emailLocal.length > 3 && nameLower.length > 3) {
        const similarity = this.calculateSimilarity(emailLocal, nameLower);
        if (similarity < 0.2) {
          score += 10;
          reasons.push('Email and name inconsistency');
        }
      }
    }

    // Check for message template patterns
    const templatePatterns = [
      /i\s+am\s+(interested|writing)\s+to\s+(inquire|ask)/i,
      /looking\s+for\s+(information|details)/i,
      /please\s+(contact|call|email)\s+me/i,
    ];

    for (const pattern of templatePatterns) {
      if (pattern.test(message)) {
        score += 10;
        reasons.push('Template-like message');
        break;
      }
    }

    return { score: Math.min(score, 100), reasons };
  }

  // Email validation for spam detection
  private detectSuspiciousEmail(email: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      return { score: 50, reasons: ['Invalid email format'] };
    }

    // Suspicious domains
    const suspiciousDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email', 'temp-mail.org',
      'yopmail.com', 'maildrop.cc', 'tempmail.de'
    ];

    if (suspiciousDomains.some(suspicious => domain.includes(suspicious))) {
      score += 40;
      reasons.push('Temporary email service');
    }

    // Check for numeric-heavy domains (often spam)
    const digitCount = (domain.match(/\d/g) || []).length;
    if (digitCount > domain.length / 2) {
      score += 20;
      reasons.push('Numeric-heavy domain');
    }

    // Check for suspicious patterns in local part
    const localPart = email.split('@')[0].toLowerCase();
    
    // Random looking local parts
    if (/^[a-z]{10,}$/.test(localPart) && !this.isDictionaryWord(localPart)) {
      score += 15;
      reasons.push('Random-looking email local part');
    }

    // Sequential characters
    if (/(.)\1{4,}/.test(localPart)) {
      score += 15;
      reasons.push('Repeated characters in email');
    }

    return { score: Math.min(score, 100), reasons };
  }

  // Behavior analysis for spam detection
  private detectSuspiciousBehavior(userAgent: string, ipAddress: string): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Check for suspicious user agents
    const suspiciousAgents = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i,
      /postman/i, /insomnia/i, /httpie/i
    ];

    if (suspiciousAgents.some(pattern => pattern.test(userAgent))) {
      score += 30;
      reasons.push('Suspicious user agent');
    }

    // Empty or very short user agent
    if (!userAgent || userAgent.length < 10) {
      score += 20;
      reasons.push('Missing or suspicious user agent');
    }

    // Check for common bot patterns
    const botPatterns = [
      'Mozilla/5.0 (compatible;', 'Mozilla/4.0 (compatible;',
      'Googlebot/', 'Bingbot/', 'Slurp/', 'DuckDuckBot/'
    ];

    if (botPatterns.some(pattern => userAgent.includes(pattern))) {
      score += 25;
      reasons.push('Known bot user agent');
    }

    return { score: Math.min(score, 100), reasons };
  }

  // Helper methods
  private getWeightForMethod(method: string): number {
    switch (method) {
      case 'keyword': return this.config.keywordWeight;
      case 'frequency': return this.config.frequencyWeight;
      case 'pattern': return this.config.patternWeight;
      case 'email': return this.config.emailWeight;
      case 'behavior': return this.config.behaviorWeight;
      default: return 10;
    }
  }

  private calculateConfidence(methodCount: number, score: number): 'low' | 'medium' | 'high' {
    if (methodCount >= 4 && score > 70) return 'high';
    if (methodCount >= 2 && score > 40) return 'medium';
    return 'low';
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private isDictionaryWord(word: string): boolean {
    // Simple check - in a real implementation, you might use a dictionary API
    const commonWords = ['hello', 'world', 'email', 'contact', 'info', 'admin', 'user', 'test'];
    return commonWords.includes(word);
  }

  // Record submission for frequency analysis
  async recordSubmission(ipAddress: string, email?: string): Promise<void> {
    const now = Date.now();
    
    try {
      // Record IP submission
      const ipKey = `spam_frequency_ip:${ipAddress}`;
      const ipData = await this.kv.get(ipKey, 'json') || { submissions: [] };
      ipData.submissions = [...(ipData.submissions || []), now].filter((timestamp: number) => 
        timestamp > now - (24 * 60 * 60 * 1000) // Keep only last 24 hours
      );
      
      await this.kv.put(ipKey, JSON.stringify(ipData), {
        expirationTtl: 24 * 60 * 60 // 24 hours
      });

      // Record email submission
      if (email) {
        const emailKey = `spam_frequency_email:${email.toLowerCase()}`;
        const emailData = await this.kv.get(emailKey, 'json') || { submissions: [] };
        emailData.submissions = [...(emailData.submissions || []), now].filter((timestamp: number) => 
          timestamp > now - (7 * 24 * 60 * 60 * 1000) // Keep only last 7 days
        );
        
        await this.kv.put(emailKey, JSON.stringify(emailData), {
          expirationTtl: 7 * 24 * 60 * 60 // 7 days
        });
      }
    } catch (error) {
      console.error('Failed to record submission:', error);
    }
  }
}

// Default spam detector instance
export function createSpamDetector(kv: any, config?: Partial<SpamDetectionConfig>): SpamDetector {
  return new SpamDetector(kv, config);
}

// Predefined configurations for different use cases
export const SPAM_DETECTION_CONFIGS = {
  strict: {
    blockThreshold: 60,
    moderateThreshold: 30,
    keywordWeight: 35,
    frequencyWeight: 30,
    patternWeight: 20,
    emailWeight: 10,
    behaviorWeight: 5,
  },
  
  moderate: {
    blockThreshold: 80,
    moderateThreshold: 50,
    keywordWeight: 30,
    frequencyWeight: 25,
    patternWeight: 20,
    emailWeight: 15,
    behaviorWeight: 10,
  },
  
  lenient: {
    blockThreshold: 90,
    moderateThreshold: 70,
    keywordWeight: 25,
    frequencyWeight: 20,
    patternWeight: 25,
    emailWeight: 20,
    behaviorWeight: 10,
  }
};