const BASE_URL = '/api';

async function request(path, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : null;
  } catch (error) {
    console.error(`API error [${path}]:`, error);
    throw error;
  }
}

export async function login(email, password) {
  const users = await request(`/users?email=${encodeURIComponent(email)}`);
  if (!users.length) throw new Error('No account found with that email.');
  const matchedUser = users[0];
  if (matchedUser.password !== password) throw new Error('Incorrect password.');
  return matchedUser;
}

export async function getProjects() {
  return request('/projects');
}

export async function getProjectById(id) {
  return request(`/projects/${id}`);
}

export async function createProject(data) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(id, data) {
  return request(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id) {
  return request(`/projects/${id}`, { method: 'DELETE' });
}

export async function getUserById(id) {
  return request(`/users/${id}`);
}

export async function getUsers() {
  return request('/users');
}
