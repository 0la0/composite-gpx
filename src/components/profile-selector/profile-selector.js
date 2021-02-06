import BaseComponent from '../primitives/util/base-component.js';
import ProfileService from '../../services/ProfileService.js';
import PersistedStore from '../../services/PersistedStore.js';
import markup from './profile-selector.html';
import styles from './profile-selector.css';

const Constants = {
  STORE_KEY: 'PROFILE_SELECTION',
  PROFILE_ACTIVE: 'profile-active',
};

export default class ProfileSelector extends BaseComponent {
  static get tag() {
    return 'profile-selector';
  }

  constructor() {
    super(styles, markup, [ 'profiles', ]);
    this.profileService = new ProfileService();
    this.persistedStore = new PersistedStore();
    this.selectedProfileName = '';
    this.profileData = {
      bounds: {},
      activities: [],
    };
  }

  connectedCallback() {
    this.profileService.getRenderViews()
      .then(response => this.renderProfileMenu(response.views))
      .then(() => {
        const persistedData = this.persistedStore.getObjectFromStorage(Constants.STORE_KEY);
        if (persistedData?.profileName) {
          this.setActiveProfile(persistedData.profileName);
        }
      })
      .catch(error => console.log(error));
  }

  getProfileData() {
    return this.profileData;
  }

  renderProfileMenu(profileNames) {
    this.activeNewName = '';
    [...this.dom.profiles.children].forEach(child => this.dom.profiles.removeChild(child));
    profileNames.forEach(profileName => {
      const viewButton = document.createElement('button');
      viewButton.setAttribute('id', profileName);
      viewButton.classList.add('profile-button');
      viewButton.innerText = profileName;
      viewButton.addEventListener('click', () => this.setActiveProfile(profileName));
      this.dom.profiles.appendChild(viewButton);
    });
  }

  setActiveProfile(profileName) {
    this.selectedProfileName = profileName;
    [...this.dom.profiles.children].forEach(child => {
      if (child.getAttribute('id') === profileName) {
        child.classList.add(Constants.PROFILE_ACTIVE);
      } else {
        child.classList.remove(Constants.PROFILE_ACTIVE);
      }
    });
    this.persistedStore.storeObject(Constants.STORE_KEY, { profileName, });
    this.fetchProfileData(profileName);
  }

  fetchProfileData(profileName) {
    this.profileService.getRenderView(profileName)
      .then(response => {
        if (!response) {
          throw new Error('No activities', response);
        }
        this.profileData = response;
      })
      .catch(error => console.log(error));
  }
}
