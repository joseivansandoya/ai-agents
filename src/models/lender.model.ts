import { faker } from '@faker-js/faker';

interface Lender {
  id: number;
  name: string;
  email: string;
  variableRate: number;
  fixedRateFiveYears: number;
  fixedRateTenYears: number;
}

class LenderModel {
  lenders: Lender[] = [];

  constructor () {
    this.initializeLenders();
  };

  getLenders = () => {
    return JSON.stringify(this.lenders);
  };

  getLenderById = (id: number) => {
    return JSON.stringify(this.lenders.find(lender => lender.id === id));
  };

  addLender = (lender: Lender) => {
    this.lenders.push(lender);
  };

  private initializeLenders = () => {
    for (let i = 1; i <= 10; i++) {
      this.lenders.push({
        id: i,
        name: faker.company.name(),
        email: faker.internet.email(),
        variableRate: faker.number.float({ min: 4, max: 7, fractionDigits: 2 }),
        fixedRateFiveYears: faker.number.float({ min: 3, max: 5, fractionDigits: 2 }),
        fixedRateTenYears: faker.number.float({ min: 4, max: 6, fractionDigits: 2 }),
      });
    }
  };
}

export default LenderModel;
