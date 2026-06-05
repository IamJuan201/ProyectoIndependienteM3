import { login } from '@services/api.js';
import { saveSession } from '@services/auth.js';
import { navigate } from '../router.js';

export function renderLogin(app) {
  app.innerHTML = `
    <div class="login-page">
      <div class="login-brand">
        <div class="brand-logo">Project<span>Flow</span></div>
        <p class="brand-tagline">Internal project management for teams.</p>
        <div class="brand-features">
          <div class="brand-feature">
            <div class="icon">[+]</div>
            <span>Manage all your projects in one place</span>
          </div>
          <div class="brand-feature">
            <div class="icon">[R]</div>
            <span>Role-based access: Manager &amp; Collaborator</span>
          </div>
          <div class="brand-feature">
            <div class="icon">[S]</div>
            <span>Fast, real-time status updates</span>
          </div>
        </div>
      </div>

      <div class="login-form-side">
        <div class="login-card">
          <h2>Welcome back</h2>
          <p>Sign in to access your workspace.</p>

          <div id="login-alert"></div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" placeholder="you@company.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="••••••••" autocomplete="current-password" />
          </div>

          <button class="btn btn-primary" id="login-btn">Sign In</button>

          <div style="margin-top:1.5rem;padding:1rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius);font-size:0.8rem;color:var(--text-muted)">
            <strong style="color:var(--text-secondary)">Test accounts:</strong><br/>
            manager@test.com / 123456 (Manager)<br/>
            user@test.com / 123456 (Collaborator)
          </div>
        </div>
      </div>
    </div>
  `;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('login-btn');
  const alertContainer = document.getElementById('login-alert');

  const attemptLogin = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    alertContainer.innerHTML = '';

    if (!email || !password) {
      alertContainer.innerHTML = `<div class="alert alert-error">Please enter your email and password.</div>`;
      return;
    }

    loginButton.textContent = 'Signing in...';
    loginButton.disabled = true;

    try {
      const user = await login(email, password);
      saveSession(user);
      navigate('/dashboard');
    } catch (error) {
      alertContainer.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
      loginButton.textContent = 'Sign In';
      loginButton.disabled = false;
    }
  };

  loginButton.addEventListener('click', attemptLogin);
  passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
  emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') passwordInput.focus(); });
}
