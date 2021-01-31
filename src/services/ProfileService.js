export default class ProfileService {
  getProfiles() {
    return fetch('/api/profile')
      .then(response => response.json());
  }

  getProfile(name) {
    return fetch(`/api/profile/${name}`)
      .then(response => response.json());
  }
}
