import BaseComponent from '../primitives/util/base-component.js';
import ProfileService from '../../services/ProfileService.js';
import markup from './activity-editor.html';
import styles from './activity-editor.css';

export default class ActivityEditor extends BaseComponent {
  static get tag() {
    return 'activity-editor';
  }

  constructor() {
    super(styles, markup, [ 'map', 'selector', 'error', 'years', ]);
    this.profileService = new ProfileService();
    this.activeProfileName = '';
    this.dom.selector.addEventListener('change', event => this.loadProfile(event.target.value));
    this.selectedYears = new Set();
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
        this.activities = activities;
        const mappedYears = activities
          .filter(activity => activity.time)
          .map(activity => new Date(activity.time).getFullYear());
        const uniqueYears = new Set(mappedYears);
        this.renderYearSelector(uniqueYears);
      })
      .then(() => this.dom.map.plotActivities(this.activities))
      .catch(error => console.log(error));
  }

  renderProfileSelector(profiles = []) {
    this.activeProfileName = '';
    if (!profiles.length) {
      this.dom.error.classList.add('error-message-visible');
      this.dom.selector.classList.remove('selector-error-visible');
      return;
    }
    const firstItem = profiles[0];
    this.dom.error.classList.remove('error-message-visible');
    this.dom.selector.classList.add('selector-visible');    
    [...this.dom.selector.children].forEach(child => this.dom.selector.removeChild(child));
    profiles.forEach(profileName => {
      const option = document.createElement('option');
      option.setAttribute('value', profileName);
      if (profileName === firstItem) {
        option.setAttribute('selected', true);
      }
      option.innerText = profileName.substring(0, profileName.lastIndexOf('.min'));
      this.dom.selector.appendChild(option);
    });
    this.loadProfile(firstItem);
  }

  renderYearSelector(years) {
    [...this.dom.years.children].forEach(child => this.dom.years.removeChild(child));
    
    this.selectedYears = years;
    years.forEach(year => {
      const yearParent = document.createElement('div');
      const checkbox = document.createElement('input');
      const label = document.createElement('label');
      yearParent.classList.add('checkbox');
      checkbox.classList.add('year-chckbox');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('id', year);
      checkbox.setAttribute('checked', true);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.selectedYears.add(year);
        } else {
          this.selectedYears.delete(year);
        }
        const activities = this.activities.filter(activity => {
          const year = new Date(activity.time).getFullYear();
          return this.selectedYears.has(year);
        });
        this.dom.map.clear();
        this.dom.map.plotActivities(activities);
      });
      label.classList.add('year-label');
      label.setAttribute('for', year);
      label.innerText = year;
      yearParent.appendChild(checkbox);
      yearParent.appendChild(label);
      this.dom.years.appendChild(yearParent);
    });
  }
}
