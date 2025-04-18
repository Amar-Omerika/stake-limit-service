const apiKeyAuth = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    
    const validApiKey = process.env.API_KEY || 'test-local-key';
    
    if (!apiKey || apiKey !== validApiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    next();
  };

export default apiKeyAuth;