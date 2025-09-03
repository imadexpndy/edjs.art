// Simple authentication checker for EDJS using Hello Planet API
class SimpleAuth {
  constructor() {
    this.helloPlanetUrl = 'https://app.edjs.art';
    this.isAuthenticated = false;
    this.user = null;
  }

  async checkAuthStatus() {
    try {
      console.log('EDJS - Checking auth status with Hello Planet API');
      
      const response = await fetch(`${this.helloPlanetUrl}/api/auth/status`, {
        method: 'GET',
        credentials: 'include', // Include cookies for cross-domain auth
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('EDJS - Auth status response:', data);
        
        if (data.isAuthenticated && data.user) {
          this.isAuthenticated = true;
          this.user = data.user;
          return {
            isAuthenticated: true,
            user: data.user
          };
        }
      }
      
      console.log('EDJS - User not authenticated');
      this.isAuthenticated = false;
      this.user = null;
      return {
        isAuthenticated: false,
        user: null
      };
      
    } catch (error) {
      console.error('EDJS - Error checking auth status:', error);
      this.isAuthenticated = false;
      this.user = null;
      return {
        isAuthenticated: false,
        user: null
      };
    }
  }

  async init() {
    console.log('EDJS - Initializing SimpleAuth');
    const authStatus = await this.checkAuthStatus();
    return authStatus;
  }
}

// Export for use in auth-manager
window.SimpleAuth = SimpleAuth;
