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
    this.activeProfileName = '';
  }

  connectedCallback() {
    this.dom.map.setRenderViewCallback(this.createRenderView.bind(this));
    this.profileService.getProfiles()
      .then(response => this.renderProfileSelector(response.profiles))
      .catch(error => console.log(error));
  }

  createRenderView(name, bounds) {
    this.profileService.createRenderView(this.activeProfileName, bounds, name);
  }

  loadProfile(profileName) {
    this.dom.map.clear();
    this.profileService.getProfile(profileName)
      .then(response => {
        const { activities, } = response;
        if (!activities || !activities.length) {
          throw new Error('No activities', response);
        }
        this.activeProfileName = profileName;
        this.dom.map.plotActivities(activities);
        
        const mappedYears = activities
          .filter(activity => activity.time)
          .map(activity => new Date(activity.time).getFullYear());
        const uniqueYears = new Set(mappedYears);
        console.log('TODO: build filter for years:', uniqueYears);
      })
      .catch(error => console.log(error));
  }

  renderProfileSelector(profiles = []) {
    requestAnimationFrame(() => {
      this.activeProfileName = '';
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
