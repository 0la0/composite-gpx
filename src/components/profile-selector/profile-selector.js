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
    super(styles, markup, [ 'selector', ]);
    this.profileService = new ProfileService();
    this.persistedStore = new PersistedStore();
    this.selectedProfileName = '';
    this.dom.selector.addEventListener('change', (event) => this.setActiveProfile(event.target.value));
  }

  connectedCallback() {
    this.profileService.getRenderViews()
      .then((response) => {
        const persistedData = this.persistedStore.getObjectFromStorage(Constants.STORE_KEY);
        if (persistedData?.profileName) {
          this.setActiveProfile(persistedData.profileName);
        }
        this.renderProfileMenu(response.views, persistedData?.profileName);
      })
      .catch(error => console.log(error));
  }

  getProfileData() {
    return this.profileService.getRenderView(this.selectedProfileName);
  }

  renderProfileMenu(profileNames, activeView) {
    const selectedItem = activeView || profileNames[0];
    [...this.dom.selector].forEach(child => this.dom.selector.removeChild(child));
    profileNames
      .forEach(profileName => {
        const displayName = profileName.substring(0, profileName.lastIndexOf('.app'));
        const option = document.createElement('option');
        option.setAttribute('value', profileName);
        if (profileName === selectedItem) {
          option.setAttribute('selected', true);
        }
        option.classList.add('profile-button');
        option.innerText = displayName;
        this.dom.selector.appendChild(option);
      });
  }

  setActiveProfile(profileName) {
    this.selectedProfileName = profileName;
    this.persistedStore.storeObject(Constants.STORE_KEY, { profileName, });
  }
}
