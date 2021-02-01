export default class ProfileService {
  getProfiles() {
    return fetch('/api/profile')
      .then(response => response.json());
  }

  getProfile(name) {
    return fetch(`/api/profile/${name}`)
      .then(response => response.json());
  }

  createRenderView(profileName, bounds) {
    return fetch(`/api/renderview/${profileName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bounds, }),
    });
  }

  getRenderViews() {
    return fetch('api/renderview')
      .then(response => response.json());
  }

  getRenderView(name) {
    return fetch(`/api/renderview/${name}`)
      .then(response => response.json());
  }
}
