import { faker } from '@faker-js/faker';

interface Property {
  id: number;
  address: string;
  zip: string;
  locationId: number;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
}

class PropertyModel {
  properties: Property[] = [];

  constructor () {
    this.initializeProperties();
  };

  getProperties = () => {
    return JSON.stringify(this.properties);
  };

  getPropertyById = (id: number) => {
    return JSON.stringify(this.properties.find(property => property.id === id));
  };

  addProperty = (property: Property) => {
    this.properties.push(property);
  };

  private initializeProperties = () => {
    for (let i = 1; i <= 10; i++) {
      this.properties.push({
        id: i,
        address: faker.location.streetAddress(),
        zip: faker.location.zipCode(),
        locationId: faker.number.int({ min: 1, max: 10 }),
        price: faker.number.float({ min: 100000, max: 3000000, fractionDigits: 2 }),
        beds: faker.number.int({ min: 1, max: 5 }),
        baths: faker.number.int({ min: 1, max:5 }),
        sqft: faker.number.int({ min: 1000, max: 5000 }),
        yearBuilt: faker.number.int({ min: 1990, max: 2024 }),
      });
    }
  };
}

export default PropertyModel;
