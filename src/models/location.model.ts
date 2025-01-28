import { faker } from '@faker-js/faker';

interface Location {
  id: number;
  neighborhood: string;
  city: string;
  state: string;
}

class LocationModel {
  locations: Location[] = [];

  constructor () {
    this.initializeLocations();
  };

  getLocations = () => {
    return JSON.stringify(this.locations);
  };

  getLocationById = (id: number) => {
    return JSON.stringify(this.locations.find(location => location.id === id));
  };

  addLocation = (location: Location) => {
    this.locations.push(location);
  };

  private initializeLocations = () => {
    for (let i = 1; i <= 10; i++) {
      this.locations.push({
        id: i,
        neighborhood: faker.location.county(),
        city: faker.location.city(),
        state: faker.location.state(),
      });
    }
  };
}

export default LocationModel;
