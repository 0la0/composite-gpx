import BaseComponent from '../primitives/util/base-component.js';
import ProfileService from '../../services/ProfileService.js';
import markup from './activity-editor.html';
import styles from './activity-editor.css';

export default class ActivityEditor extends BaseComponent {
  static get tag() {
    return 'activity-editor';
  }

  constructor() {
    super(styles, markup, [ 'map', 'profiles', ]);
    this.profileService = new ProfileService();
  }

  connectedCallback() {
    console.log(this.dom.map);
    this.profileService.getProfiles()
      .then(response => this.renderProfileSelector(response.profiles))
      .catch(error => console.log(error));
  }

  loadProfile(profileName) {
    this.profileService.getProfile(profileName)
      .then(response => {
        const { activities, } = response;
        if (!activities || !activities.length) {
          throw new Error('No activities', response);
        }
        this.dom.map.plotActivities(activities);
      })
      .catch(error => console.log(error));
  }

  renderProfileSelector(profiles = []) {
    requestAnimationFrame(() => {
      [...this.dom.profiles.children].forEach(child => this.dom.profiles.removeChild(child));
      profiles.forEach(profile => {
        const profileButton = document.createElement('button');
        profileButton.classList.add('profile-button');
        profileButton.innerText = profile;
        profileButton.addEventListener('click', () => this.loadProfile(profile));
        this.dom.profiles.appendChild(profileButton);
      });
    });
  }
}
